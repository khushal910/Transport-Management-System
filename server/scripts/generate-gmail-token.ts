import 'dotenv/config';
import { OAuth2Client } from 'google-auth-library';
import readline from 'readline';
import fs from 'fs';
import path from 'path';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectUrl = process.env.GOOGLE_REDIRECT_URL || 'http://localhost:3000/auth/google/callback';

if (!clientId || !clientSecret) {
  console.error('Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment variables.');
  console.error('Make sure your .env file has these variables set.');
  process.exit(1);
}

async function generateToken() {
  const oAuth2Client = new OAuth2Client(clientId, clientSecret, redirectUrl);

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.send'],
    prompt: 'consent',
  });

  console.log('\n🔗 Visit this URL in your browser to authorize:');
  console.log(authUrl);
  console.log('\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question('Enter the authorization code from the URL: ', async (code) => {
    try {
      const { tokens } = await oAuth2Client.getToken(code.trim());
      console.log('\n✅ Token generated successfully!');
      const tokenJson = JSON.stringify(tokens);
      console.log('\nAdd this to your .env file:');
      console.log(`GMAIL_OAUTH_TOKEN='${tokenJson}'`);

      const tokenPath = path.join(process.cwd(), '.gmail-token.json');
      fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));
      console.log(`\n💾 Token saved to ${tokenPath} (development only)`);
    } catch (error) {
      console.error('❌ Failed to exchange code for token:', error);
    } finally {
      rl.close();
    }
  });
}

generateToken();
