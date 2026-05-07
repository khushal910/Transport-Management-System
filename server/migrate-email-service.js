const fs = require('fs');
const path = require('path');

const emailServicePath = path.join(__dirname, 'src/utils/email.service.ts');
let content = fs.readFileSync(emailServicePath, 'utf-8');

// Migration 1: sendEmployeeSetupEmail - replace transporter verify
content = content.replace(
  /(\s+emailLogger\.info\(`Starting employee setup email flow for: \$\{email\}`\);\s+console\.log\('\[EmailService-VERIFY\] VERIFYING SMTP BEFORE EMPLOYEE SETUP EMAIL'\);\s+)try\s*\{\s+await transporter!\.verify\(\);\s+console\.log\('\[EmailService-VERIFY\] ✅ SMTP VERIFIED FOR EMPLOYEE SETUP EMAIL'\);\s+emailLogger\.info\('\[EmailService-VERIFY\] SMTP connection verified successfully for employee setup'\);\s+\}\s*catch\s*\(\s*verifyError:\s*any\s*\)\s*\{\s+console\.log\('\[EmailService-VERIFY\] ❌ SMTP VERIFICATION FAILED FOR EMPLOYEE SETUP EMAIL'\);\s+console\.log\('\[EmailService-ERROR\]',\s*verifyError\?\.message\s*\|\|\s*JSON\.stringify\(verifyError\)\);\s+emailLogger\.error\('\[EmailService-VERIFY\] SMTP verification failed for employee setup:',\s*verifyError\?\.message\);\s+return\s*\{\s*success:\s*false,\s*error:\s*`SMTP verification failed: \$\{verifyError\?\.message\}`\s*\};\s+\}/g,
  `$1// Verify Gmail API is accessible
    const verification = await verifySmtpConnection('Gmail API verification for employee setup');
    if (!verification.success) {
      emailLogger.error(\`Gmail API verification failed: \${verification.error}\`);
      return {
        success: false,
        error: verification.error,
        statusCode: verification.statusCode,
      };
    }

    console.log('[EmailService-VERIFY] ✅ GMAIL API VERIFIED FOR EMPLOYEE SETUP EMAIL');
    emailLogger.info('[EmailService-VERIFY] Gmail API verified for employee setup');`
);

// Migration 2: sendEmployeeSetupEmail - replace transporter sendMail
content = content.replace(
  /console\.log\('\[EmailService-SEND\] Sending EMPLOYEE SETUP email to:', email\);\s+const result = await transporter!\.sendMail\(mailOptions\);\s+console\.log\('\[EmailService-SEND\] ✅ EMPLOYEE SETUP email sent successfully'\);\s+console\.log\('\[EmailService-SEND\] Message ID:', result\.messageId\);\s+emailLogger\.info\(`Employee setup email sent successfully to: \$\{email\} \(messageId: \$\{result\.messageId\}\)`\);\s+return\s*\{\s*success:\s*true,\s*message:\s*'Setup email sent successfully',\s*messageId:\s*result\.messageId\s*\};/g,
  `console.log('[EmailService-SEND] Sending EMPLOYEE SETUP email to:', email);
    return await sendMailViaGmailAPI(email, 'Welcome to Fleet Management System - Set Your Password', mailOptions.html, 'EMPLOYEE SETUP');`
);

// Save the file
fs.writeFileSync(emailServicePath, content, 'utf-8');
console.log('Email service migration complete!');
