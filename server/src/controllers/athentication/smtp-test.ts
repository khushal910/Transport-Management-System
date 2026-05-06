// @ts-nocheck
import response from '../../response/response';
import runtimeConfig from '../../config/runtime';
import { sendDirectEmail, verifySmtpConnection } from '../../utils/email.service';

const smtpTest = async (req, res) => {
  try {
    const mode = typeof req.body?.mode === 'string' ? req.body.mode.toLowerCase() : 'verify';
    const recipient = typeof req.body?.to === 'string' && req.body.to.trim().length > 0
      ? req.body.to.trim().toLowerCase()
      : runtimeConfig.emailUser;

    if (mode === 'send' && !recipient) {
      return response(res, 400, false, 'SMTP test requires a recipient email when mode=send');
    }

    const verificationResult = await verifySmtpConnection('SMTP test route');

    if (!verificationResult.success) {
      return response(
        res,
        verificationResult.statusCode || 503,
        false,
        verificationResult.error || 'SMTP verification failed',
        verificationResult.details || null,
      );
    }

    if (mode !== 'send') {
      return response(
        res,
        200,
        true,
        'SMTP verification succeeded',
        verificationResult.details || null,
      );
    }

    const subject = 'Fleet Management System SMTP test';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>SMTP Test Email</h2>
        <p>This message confirms that Gmail SMTP verification and sendMail are working from Render.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      </div>
    `;

    const sendResult = await sendDirectEmail(recipient!, subject, html);
    if (!sendResult.success) {
      return response(
        res,
        sendResult.statusCode || 503,
        false,
        sendResult.error || 'SMTP send test failed',
        sendResult.details || null,
      );
    }

    return response(
      res,
      200,
      true,
      'SMTP verification and send test succeeded',
      {
        verification: verificationResult.details || null,
        send: sendResult.messageId ? { messageId: sendResult.messageId, recipient } : null,
      },
    );
  } catch (err) {
    console.error('SMTP Test Error:', err);
    return response(res, 500, false, 'SMTP test failed unexpectedly');
  }
};

export default smtpTest;