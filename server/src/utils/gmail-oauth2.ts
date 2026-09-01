import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import runtimeConfig from '../config/runtime';

interface TokenData {
  access_token: string;
  refresh_token?: string;
  scope: string;
  token_type: string;
  expiry_date?: number;
}

interface OAuth2Result {
  success: boolean;
  message?: string;
  error?: string;
  accessToken?: string;
}

/**
 * Gmail OAuth2 Token Manager
 * Handles token generation, storage, and automatic refresh
 * Stores tokens in environment variable or file (production-safe)
 */
class GmailOAuth2Manager {
  private clientId: string;
  private clientSecret: string;
  private redirectUrl: string;
  private scopes: string[] = ['https://www.googleapis.com/auth/gmail.send'];
  private oAuth2Client: OAuth2Client;
  private tokenCachePath: string;
  private currentToken: TokenData | null = null;

  constructor() {
    this.clientId = runtimeConfig.googleClientId || '';
    this.clientSecret = runtimeConfig.googleClientSecret || '';
    this.redirectUrl = runtimeConfig.googleRedirectUrl || 'http://localhost:3000/auth/google/callback';
    this.tokenCachePath = path.join(process.cwd(), '.gmail-token.json');

    this.oAuth2Client = new OAuth2Client(this.clientId, this.clientSecret, this.redirectUrl);

    // Load token from environment or cache file
    this.loadToken();
  }

  /**
   * Load token from environment variable or cache file
   * Priority: Environment variable > Cache file
   */
  private loadToken(): void {
    try {
      // First, try to load from environment variable
      let envToken = process.env.GMAIL_OAUTH_TOKEN || runtimeConfig.gmailOAuthToken;
      if (envToken) {
        envToken = envToken.trim();
        if (
          (envToken.startsWith("'") && envToken.endsWith("'")) ||
          (envToken.startsWith('"') && envToken.endsWith('"'))
        ) {
          envToken = envToken.slice(1, -1).trim();
        }
        try {
          this.currentToken = JSON.parse(envToken) as TokenData;
          this.oAuth2Client.setCredentials(this.currentToken);
          console.log('[GmailOAuth2] Token loaded from environment variable');
          return;
        } catch (e) {
          console.warn('[GmailOAuth2] Failed to parse token from environment variable:', e);
        }
      }

      // Fall back to cache file (development only)
      if (fs.existsSync(this.tokenCachePath)) {
        const tokenJson = fs.readFileSync(this.tokenCachePath, 'utf-8');
        this.currentToken = JSON.parse(tokenJson) as TokenData;
        this.oAuth2Client.setCredentials(this.currentToken);
        console.log('[GmailOAuth2] Token loaded from cache file');
      }
    } catch (error) {
      console.warn('[GmailOAuth2] No token found, will need to authenticate');
    }
  }

  /**
   * Save token to both environment and cache file
   * For production: Set GMAIL_OAUTH_TOKEN env variable
   * For development: Uses local .gmail-token.json
   */
  private saveToken(token: TokenData): void {
    try {
      this.currentToken = token;
      this.oAuth2Client.setCredentials(token);

      // Always try to save to cache file (helpful for development)
      try {
        fs.writeFileSync(this.tokenCachePath, JSON.stringify(token, null, 2));
        console.log('[GmailOAuth2] Token saved to cache file');
      } catch (fileError) {
        console.warn('[GmailOAuth2] Could not save token to file (not critical in production)');
      }

      // Log reminder to set environment variable for production
      if (!process.env.GMAIL_OAUTH_TOKEN) {
        console.log(
          '[GmailOAuth2] ⚠️  For production deployment, set GMAIL_OAUTH_TOKEN environment variable with this JSON:',
        );
        console.log(JSON.stringify(token));
      }
    } catch (error) {
      console.error('[GmailOAuth2] Failed to save token:', error);
    }
  }

  /**
   * Generate the authorization URL for user to visit
   * User clicks this link to grant permissions
   */
  public getAuthorizationUrl(): string {
    const authUrl = this.oAuth2Client.generateAuthUrl({
      access_type: 'offline', // Required for refresh token
      scope: this.scopes,
      prompt: 'consent', // Force consent screen to get refresh token
    });
    return authUrl;
  }

  /**
   * Exchange authorization code for access token
   * Call this after user visits the authorization URL
   */
  public async exchangeCodeForToken(code: string): Promise<OAuth2Result> {
    try {
      console.log('[GmailOAuth2] Exchanging authorization code for tokens...');
      const { tokens } = await this.oAuth2Client.getToken(code);

      if (!tokens.access_token) {
        return {
          success: false,
          error: 'No access token received from Google',
        };
      }

      const tokenData: TokenData = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token ?? undefined,
        scope: this.scopes.join(' '),
        token_type: 'Bearer',
        expiry_date: tokens.expiry_date ?? undefined,
      };

      this.saveToken(tokenData);
      this.oAuth2Client.setCredentials(tokenData);

      console.log('[GmailOAuth2] ✅ Successfully exchanged code for tokens');
      return {
        success: true,
        message: 'Successfully authenticated with Gmail',
        accessToken: tokenData.access_token,
      };
    } catch (error: any) {
      console.error('[GmailOAuth2] Failed to exchange code:', error.message);
      return {
        success: false,
        error: `Failed to exchange authorization code: ${error.message}`,
      };
    }
  }

  /**
   * Get current access token, refreshing if necessary
   * Automatically handles token expiration and refresh
   */
  public async getAccessToken(): Promise<OAuth2Result> {
    try {
      if (!this.currentToken?.access_token) {
        return {
          success: false,
          error: 'No token available. Please authenticate first using authorization URL.',
        };
      }

      // Set credentials with current token
      this.oAuth2Client.setCredentials(this.currentToken);

      // Check if token is expired or close to expiring (< 5 minutes)
      const now = Date.now();
      const expiryDate = this.currentToken.expiry_date || 0;
      const timeUntilExpiry = expiryDate - now;

      console.log(`[GmailOAuth2] Token expiry check: ${timeUntilExpiry / 1000 / 60} minutes remaining`);

      if (timeUntilExpiry < 5 * 60 * 1000) {
        console.log('[GmailOAuth2] Token expiring soon, refreshing...');
        return await this.refreshAccessToken();
      }

      return {
        success: true,
        accessToken: this.currentToken.access_token,
      };
    } catch (error: any) {
      console.error('[GmailOAuth2] Failed to get access token:', error.message);
      return {
        success: false,
        error: `Failed to get access token: ${error.message}`,
      };
    }
  }

  /**
   * Refresh access token using refresh token
   * Called automatically when token is expiring
   */
  private async refreshAccessToken(): Promise<OAuth2Result> {
    try {
      if (!this.currentToken?.refresh_token) {
        return {
          success: false,
          error: 'No refresh token available. Please re-authenticate.',
        };
      }

      console.log('[GmailOAuth2] Refreshing access token...');
      this.oAuth2Client.setCredentials({
        refresh_token: this.currentToken.refresh_token,
      });

      const { credentials } = await this.oAuth2Client.refreshAccessToken();

      if (!credentials.access_token) {
        return {
          success: false,
          error: 'Failed to obtain new access token',
        };
      }

      const updatedToken: TokenData = {
        access_token: credentials.access_token,
        refresh_token: credentials.refresh_token || this.currentToken.refresh_token,
        scope: this.scopes.join(' '),
        token_type: 'Bearer',
        expiry_date: credentials.expiry_date ?? undefined,
      };

      this.saveToken(updatedToken);

      console.log('[GmailOAuth2] ✅ Token refreshed successfully');
      return {
        success: true,
        accessToken: updatedToken.access_token,
      };
    } catch (error: any) {
      console.error('[GmailOAuth2] Failed to refresh token:', error.message);
      return {
        success: false,
        error: `Failed to refresh token: ${error.message}`,
      };
    }
  }

  /**
   * Get the OAuth2Client instance (used for sending emails)
   */
  public getOAuth2Client(): OAuth2Client {
    if (this.currentToken) {
      this.oAuth2Client.setCredentials(this.currentToken);
    }
    return this.oAuth2Client;
  }

  /**
   * Verify if authentication is configured and working
   */
  public async verifyAuthentication(): Promise<OAuth2Result> {
    try {
      const tokenResult = await this.getAccessToken();
      if (!tokenResult.success) {
        return {
          success: false,
          error: tokenResult.error || 'Authentication verification failed',
        };
      }

      return {
        success: true,
        message: 'Gmail OAuth2 authentication verified',
      };
    } catch (error: any) {
      return {
        success: false,
        error: `Authentication verification failed: ${error.message}`,
      };
    }
  }

  /**
   * Check if initial setup is required
   */
  public needsInitialSetup(): boolean {
    return !this.currentToken?.access_token;
  }

  /**
   * Get authorization URL (for CLI setup)
   * Developers should visit this URL and follow the OAuth2 flow
   */
  public getSetupInstructions(): string {
    return `
1. Visit this URL in your browser:
   ${this.getAuthorizationUrl()}

2. Grant the requested permissions

3. Copy the authorization code from the callback URL

4. Run the token exchange endpoint:
   POST /api/auth/gmail/exchange-token
   Body: { "code": "your_authorization_code" }

5. Set the returned token in environment:
   GMAIL_OAUTH_TOKEN='${JSON.stringify({ access_token: '...', refresh_token: '...' }, null, 2)}'
    `;
  }
}

// Singleton instance
export const gmailOAuth2Manager = new GmailOAuth2Manager();

export default gmailOAuth2Manager;
