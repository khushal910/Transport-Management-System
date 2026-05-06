import runtimeConfig from '../config/runtime';
import { ErrorLogEntry } from './errorLogger';

/**
 * Error Alert Service
 * Sends notifications for critical errors to support channels
 */
class ErrorAlertService {
  /**
   * Send alert notification for critical errors
   * Integrates with email, Slack, Discord, PagerDuty, etc.
   */
  public async sendAlert(logEntry: ErrorLogEntry): Promise<void> {
    if (!runtimeConfig.isProduction) {
      return; // Skip alerts in development
    }

    try {
      const alertMessage = this.formatAlertMessage(logEntry);

      // Send via email (if configured)
      if (process.env.SUPPORT_EMAIL) {
        await this.sendEmailAlert(alertMessage, logEntry);
      }

      // Send via Slack (if configured)
      if (process.env.SLACK_WEBHOOK_URL) {
        await this.sendSlackAlert(alertMessage, logEntry);
      }

      // Send via Discord (if configured)
      if (process.env.DISCORD_WEBHOOK_URL) {
        await this.sendDiscordAlert(alertMessage, logEntry);
      }

      // Send via PagerDuty (if configured) for critical errors
      if (process.env.PAGERDUTY_INTEGRATION_KEY && this.isCritical(logEntry)) {
        await this.sendPagerDutyAlert(logEntry);
      }
    } catch (error) {
      console.error('Failed to send error alert:', error);
      // Don't throw - we don't want alerting failures to break the app
    }
  }

  /**
   * Format alert message
   */
  private formatAlertMessage(logEntry: ErrorLogEntry): string {
    return `
🚨 ERROR ALERT 🚨

Error Type: ${logEntry.errorType}
Level: ${logEntry.level.toUpperCase()}
Message: ${logEntry.message}
Time: ${logEntry.timestamp}
Status Code: ${logEntry.statusCode || 'N/A'}
Request ID: ${logEntry.requestId || 'N/A'}
User ID: ${logEntry.userId || 'N/A'}
Endpoint: ${logEntry.endpoint || 'N/A'}
Method: ${logEntry.method || 'N/A'}

Context:
${JSON.stringify(logEntry.context, null, 2)}

Stack Trace:
${logEntry.stack || 'N/A'}
    `.trim();
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(message: string, logEntry: ErrorLogEntry): Promise<void> {
    // TODO: Implement email sending
    // Example with nodemailer:
    /*
    try {
      const transporter = nodemailer.createTransport({
        // your email config
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: runtimeConfig.supportEmail,
        subject: `[${logEntry.level.toUpperCase()}] ${logEntry.errorType} in Production`,
        text: message,
        html: this.formatEmailHtml(logEntry),
      });
    } catch (error) {
      console.error('Email alert failed:', error);
    }
    */
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(message: string, logEntry: ErrorLogEntry): Promise<void> {
    try {
      const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
      if (!slackWebhookUrl) return;

      const color = logEntry.level === 'critical' ? 'danger' : 'warning';

      const payload = {
        attachments: [
          {
            color,
            title: `${logEntry.errorType} - ${logEntry.level.toUpperCase()}`,
            text: logEntry.message,
            fields: [
              {
                title: 'Status Code',
                value: logEntry.statusCode || 'N/A',
                short: true,
              },
              {
                title: 'Request ID',
                value: logEntry.requestId || 'N/A',
                short: true,
              },
              {
                title: 'User ID',
                value: logEntry.userId || 'N/A',
                short: true,
              },
              {
                title: 'Endpoint',
                value: logEntry.endpoint || 'N/A',
                short: true,
              },
              {
                title: 'Time',
                value: logEntry.timestamp,
                short: false,
              },
            ],
            footer: 'Transport Management System',
            ts: Math.floor(Date.now() / 1000),
          },
        ],
      };

      await fetch(slackWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('Slack alert failed:', error);
    }
  }

  /**
   * Send Discord alert
   */
  private async sendDiscordAlert(message: string, logEntry: ErrorLogEntry): Promise<void> {
    try {
      const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
      if (!discordWebhookUrl) return;

      const embed = {
        title: `${logEntry.errorType}`,
        description: logEntry.message,
        color: logEntry.level === 'critical' ? 15158332 : 16776960, // Red or Yellow
        fields: [
          {
            name: 'Level',
            value: logEntry.level.toUpperCase(),
            inline: true,
          },
          {
            name: 'Status Code',
            value: logEntry.statusCode || 'N/A',
            inline: true,
          },
          {
            name: 'Request ID',
            value: logEntry.requestId || 'N/A',
            inline: false,
          },
          {
            name: 'User ID',
            value: logEntry.userId || 'N/A',
            inline: true,
          },
          {
            name: 'Endpoint',
            value: logEntry.endpoint || 'N/A',
            inline: true,
          },
          {
            name: 'Timestamp',
            value: logEntry.timestamp,
            inline: false,
          },
        ],
        footer: {
          text: 'Transport Management System Error Alert',
        },
      };

      await fetch(discordWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds: [embed] }),
      });
    } catch (error) {
      console.error('Discord alert failed:', error);
    }
  }

  /**
   * Send PagerDuty alert for critical errors
   */
  private async sendPagerDutyAlert(logEntry: ErrorLogEntry): Promise<void> {
    try {
      const integrationKey = process.env.PAGERDUTY_INTEGRATION_KEY;
      if (!integrationKey) return;

      const payload = {
        routing_key: integrationKey,
        event_action: 'trigger',
        dedup_key: logEntry.requestId,
        payload: {
          summary: `${logEntry.errorType}: ${logEntry.message}`,
          severity: 'critical',
          source: 'Transport Management System',
          custom_details: {
            errorType: logEntry.errorType,
            endpoint: logEntry.endpoint,
            userId: logEntry.userId,
            requestId: logEntry.requestId,
            context: logEntry.context,
            stack: logEntry.stack,
          },
        },
      };

      await fetch('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    } catch (error) {
      console.error('PagerDuty alert failed:', error);
    }
  }

  /**
   * Check if error is critical
   */
  private isCritical(logEntry: ErrorLogEntry): boolean {
    return logEntry.level === 'critical';
  }

  /**
   * Format email HTML
   */
  private formatEmailHtml(logEntry: ErrorLogEntry): string {
    return `
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2 style="color: #d32f2f;">🚨 Error Alert</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Error Type</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${logEntry.errorType}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Level</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${logEntry.level.toUpperCase()}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Message</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${logEntry.message}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Endpoint</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${logEntry.endpoint || 'N/A'}</td>
          </tr>
          <tr style="background-color: #f5f5f5;">
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Request ID</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${logEntry.requestId || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Timestamp</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${logEntry.timestamp}</td>
          </tr>
        </table>
      </body>
    </html>
    `;
  }
}

export const errorAlert = new ErrorAlertService();
