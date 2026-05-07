#!/usr/bin/env python3
import re

# Read the file
with open(r'c:\Users\Abc\Desktop\Transport-Management-System\server\src\utils\email.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Define migrations - each tuple is (email_param, op_upper, subject)
# For most functions, the email param is 'email', but for sendEmailVerificationOTP it's 'newEmail'

migrations = [
    ('email', 'EMPLOYEE SETUP', 'Welcome to Fleet Management System - Set Your Password'),
    ('email', 'FIRST LOGIN SECURITY', 'Security Notice: First Login Detected'),
    ('email', 'EMPLOYEE DETAILS UPDATED', 'Your Account Details Have Been Updated'),
    ('email', 'EMPLOYEE DELETED', 'Employee Account Deactivated - Fleet Management System'),
    ('email', 'EMPLOYEE RECOVERED', 'Employee Account Restored - Fleet Management System'),
    ('newEmail', 'EMAIL VERIFICATION OTP', 'Email Verification Code - Fleet Management System'),
    ('email', 'PASSWORD RESET OTP', 'Password Reset Code - Fleet Management System'),
]

for email_param, op_upper, subject in migrations:
    print(f"Migrating sendMail for {op_upper}...")
    
    # Escape the operation name for regex
    op_upper_esc = re.escape(op_upper)
    
    # Pattern: Locate the specific sendMail call by the operation name before it
    # This is more specific to avoid matching wrong functions
    pattern = (
        r"console\.log\('\[EmailService-SEND\] Sending " + op_upper_esc + r" email to:',\s*" + email_param + r"\);\s+"
        r"const result = await transporter!\.sendMail\(mailOptions\);\s+"
        r"console\.log\('\[EmailService-SEND\] ✅ " + op_upper_esc + r" email sent successfully'\);\s+"
        r"console\.log\('\[EmailService-SEND\] Message ID:',\s*result\.messageId\);\s+"
        r"emailLogger\.info\(`.*?`\);\s+"
        r"return\s*\{\s*success:\s*true,\s*message:\s*'[^']+',\s*messageId:\s*result\.messageId\s*\};"
    )
    
    replacement = (
        f"console.log('[EmailService-SEND] Sending {op_upper} email to:', {email_param});\n"
        f"    return await sendMailViaGmailAPI({email_param}, '{subject}', mailOptions.html, '{op_upper}');"
    )
    
    content = re.sub(pattern, replacement, content, flags=re.DOTALL | re.MULTILINE)

print("Writing file...")
with open(r'c:\Users\Abc\Desktop\Transport-Management-System\server\src\utils\email.service.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Done!")
