const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/utils/email.service.ts');
let content = fs.readFileSync(filePath, 'utf-8');

// Function 1: sendEmployeeSetupEmail
console.log('Migrating sendEmployeeSetupEmail...');
content = content.replace(
  /console\.log\('\[EmailService-VERIFY\] VERIFYING SMTP BEFORE EMPLOYEE SETUP EMAIL'\);\s+try\s*\{\s+await transporter!\.verify\(\);\s+console\.log\('\[EmailService-VERIFY\] ✅ SMTP VERIFIED FOR EMPLOYEE SETUP EMAIL'\);\s+emailLogger\.info\('\[EmailService-VERIFY\] SMTP connection verified successfully for employee setup'\);\s+\}\s+catch\s*\(\s*verifyError:\s*any\s*\)\s*\{\s+console\.log\('\[EmailService-VERIFY\] ❌ SMTP VERIFICATION FAILED FOR EMPLOYEE SETUP EMAIL'\);\s+console\.log\('\[EmailService-ERROR\]',\s*verifyError\?\.message\s*\|\|\s*JSON\.stringify\(verifyError\)\);\s+emailLogger\.error\('\[EmailService-VERIFY\] SMTP verification failed for employee setup:',\s*verifyError\?\.message\);\s+return\s*\{\s*success:\s*false,\s*error:\s*`SMTP verification failed: \$\{verifyError\?\.message\}`\s*\};\s+\}/g,
  `console.log('[EmailService-VERIFY] VERIFYING GMAIL API BEFORE EMPLOYEE SETUP EMAIL');

    // Verify Gmail API is accessible
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

content = content.replace(
  /console\.log\('\[EmailService-SEND\] Sending EMPLOYEE SETUP email to:',\s*email\);\s+const result = await transporter!\.sendMail\(mailOptions\);\s+console\.log\('\[EmailService-SEND\] ✅ EMPLOYEE SETUP email sent successfully'\);\s+console\.log\('\[EmailService-SEND\] Message ID:',\s*result\.messageId\);\s+emailLogger\.info\(`Employee setup email sent successfully to: \$\{email\} \(messageId: \$\{result\.messageId\}\)`\);\s+return\s*\{\s*success:\s*true,\s*message:\s*'Setup email sent successfully',\s*messageId:\s*result\.messageId\s*\};/g,
  `console.log('[EmailService-SEND] Sending EMPLOYEE SETUP email to:', email);
    return await sendMailViaGmailAPI(email, 'Welcome to Fleet Management System - Set Your Password', mailOptions.html, 'EMPLOYEE SETUP');`
);

// Function 2: sendEmployeeFirstLoginSecurityEmail  
console.log('Migrating sendEmployeeFirstLoginSecurityEmail...');
content = content.replace(
  /console\.log\('\[EmailService-VERIFY\] VERIFYING SMTP BEFORE FIRST LOGIN SECURITY EMAIL'\);\s+try\s*\{\s+await transporter!\.verify\(\);\s+console\.log\('\[EmailService-VERIFY\] ✅ SMTP VERIFIED FOR FIRST LOGIN SECURITY EMAIL'\);\s+emailLogger\.info\('\[EmailService-VERIFY\] SMTP connection verified successfully for first login security'\);\s+\}\s+catch\s*\(\s*verifyError:\s*any\s*\)\s*\{\s+console\.log\('\[EmailService-VERIFY\] ❌ SMTP VERIFICATION FAILED FOR FIRST LOGIN SECURITY EMAIL'\);\s+console\.log\('\[EmailService-ERROR\]',\s*verifyError\?\.message\s*\|\|\s*JSON\.stringify\(verifyError\)\);\s+emailLogger\.error\('\[EmailService-VERIFY\] SMTP verification failed for first login security:',\s*verifyError\?\.message\);\s+return\s*\{\s*success:\s*false,\s*error:\s*`SMTP verification failed: \$\{verifyError\?\.message\}`\s*\};\s+\}/g,
  `console.log('[EmailService-VERIFY] VERIFYING GMAIL API BEFORE FIRST LOGIN SECURITY EMAIL');

    // Verify Gmail API is accessible
    const verification = await verifySmtpConnection('Gmail API verification for first login security');
    if (!verification.success) {
      emailLogger.error(\`Gmail API verification failed: \${verification.error}\`);
      return {
        success: false,
        error: verification.error,
        statusCode: verification.statusCode,
      };
    }

    console.log('[EmailService-VERIFY] ✅ GMAIL API VERIFIED FOR FIRST LOGIN SECURITY EMAIL');
    emailLogger.info('[EmailService-VERIFY] Gmail API verified for first login security');`
);

content = content.replace(
  /console\.log\('\[EmailService-SEND\] Sending FIRST LOGIN SECURITY email to:',\s*email\);\s+const result = await transporter!\.sendMail\(mailOptions\);\s+console\.log\('\[EmailService-SEND\] ✅ FIRST LOGIN SECURITY email sent successfully'\);\s+console\.log\('\[EmailService-SEND\] Message ID:',\s*result\.messageId\);\s+emailLogger\.info\(`Employee first login security email sent to: \$\{email\} \(messageId: \$\{result\.messageId\}\)`\);\s+return\s*\{\s*success:\s*true,\s*message:\s*'First login security email sent successfully',\s*messageId:\s*result\.messageId\s*\};/g,
  `console.log('[EmailService-SEND] Sending FIRST LOGIN SECURITY email to:', email);
    return await sendMailViaGmailAPI(email, 'Security Notice: First Login Detected', mailOptions.html, 'FIRST LOGIN SECURITY');`
);

// Continue with remaining functions...
console.log('Writing updated file...');
fs.writeFileSync(filePath, content, 'utf-8');
console.log('✅ Email service migration complete!');
