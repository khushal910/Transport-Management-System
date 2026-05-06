// @ts-nocheck
import mongoose from 'mongoose';
import response from '../../response/response';
import User from '../../models/user.schema';
import sendEmailValidatorSchema from '../../validations/send.email.validator';
import { sendDirectEmail } from '../../utils/email.service';

const sendEmail = async (req, res) => {
  try {
    const { recipientUserId, subject, message } = req.body;
    const senderId = req.user?.id;
    const senderRole = req.user?.role;
    const companyId = req.user?.companyId;

    if (!senderId || !senderRole || !companyId) {
      return response(res, 401, false, 'Unauthorized: Invalid session');
    }

    const { error, value } = sendEmailValidatorSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return response(
        res,
        400,
        false,
        'Invalid email payload',
        error.details.map((detail) => detail.message.replace(/"/g, ''))
      );
    }

    const sender = await User.findById(senderId);
    if (!sender) {
      return response(res, 404, false, 'Sender not found');
    }

    let recipient = null;
    if (senderRole === 'manager') {
      if (!recipientUserId) {
        return response(res, 400, false, 'Recipient employee is required');
      }

      if (!mongoose.Types.ObjectId.isValid(recipientUserId)) {
        return response(res, 400, false, 'Invalid recipient user ID');
      }

      recipient = await User.findOne({
        _id: recipientUserId,
        company: companyId,
        role: { $ne: 'manager' },
      });

      if (!recipient) {
        return response(res, 404, false, 'Employee not found in your company');
      }
    } else {
      recipient = await User.findOne({
        company: companyId,
        role: 'manager',
      });

      if (!recipient) {
        return response(res, 404, false, 'Manager not found for your company');
      }
    }

    const emailSubject = `Message from ${sender.name}: ${value.subject}`;
    const emailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f0f4f8; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">New message from ${sender.name}</h2>
          <p style="color: #4b5563; font-size: 14px;">You have a new message from <strong>${sender.name}</strong> (${sender.role}).</p>
        </div>
        <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #111827;">Subject</h3>
          <p style="color: #374151; font-size: 14px; margin-bottom: 20px;">${value.subject}</p>
          <h3 style="color: #111827;">Message</h3>
          <p style="color: #374151; font-size: 14px; white-space: pre-line;">${value.message}</p>
        </div>
        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 4px;">
          <p style="color: #92400e; font-size: 13px; margin: 0;">This is an automated message from the Fleet Management System. Reply to the sender directly if needed.</p>
        </div>
      </div>
    `;

    const result = await sendDirectEmail(recipient.email, emailSubject, emailBody);
    if (!result.success) {
      return response(
        res,
        result.statusCode || 503,
        false,
        result.error || 'Failed to send email',
        result.details || null,
      );
    }

    return response(res, 200, true, 'Email successfully sent');
  } catch (err) {
    console.error('Send Email Error:', err);
    return response(res, 500, false, 'Failed to send email');
  }
};

export default sendEmail;
