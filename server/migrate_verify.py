#!/usr/bin/env python3
import re

# Read the file
with open(r'c:\Users\Abc\Desktop\Transport-Management-System\server\src\utils\email.service.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Define migrations - each tuple is (operation_name_upper, operation_name_lower)
operations = [
    ('EMPLOYEE SETUP', 'employee setup', 'Welcome to Fleet Management System - Set Your Password'),
    ('FIRST LOGIN SECURITY', 'first login security', 'Security Notice: First Login Detected'),
    ('EMPLOYEE DETAILS UPDATED', 'employee details updated', 'Your Account Details Have Been Updated'),
    ('EMPLOYEE DELETED', 'employee deleted', 'Employee Account Deactivated - Fleet Management System'),
    ('EMPLOYEE RECOVERED', 'employee recovered', 'Employee Account Restored - Fleet Management System'),
    ('EMAIL VERIFICATION OTP', 'email verification OTP', 'Email Verification Code - Fleet Management System'),
    ('PASSWORD RESET OTP', 'password reset OTP', 'Password Reset Code - Fleet Management System'),
]

# For each operation, we need to:
# 1. Replace the transporter.verify() block
# 2. Replace the transporter.sendMail() call

for op_upper, op_lower, subject in operations:
    print(f"Migrating {op_upper}...")
    
    # Escape special regex characters in operation name
    op_upper_esc = re.escape(op_upper)
    op_lower_esc = re.escape(op_lower)
    
    # Replace verify block (be more specific by including the preceding log)
    verify_pattern = (
        r"console\.log\('\[EmailService-VERIFY\] VERIFYING SMTP BEFORE " + op_upper_esc + r" EMAIL'\);\s+"
        r"try\s*\{\s+"
        r"await transporter!\.verify\(\);\s+"
        r"console\.log\('\[EmailService-VERIFY\] ✅ SMTP VERIFIED FOR " + op_upper_esc + r" EMAIL'\);\s+"
        r"emailLogger\.info\('\[EmailService-VERIFY\] SMTP connection verified successfully for " + op_lower_esc + r"'\);\s+"
        r"\}\s+"
        r"catch\s*\(\s*verifyError:\s*any\s*\)\s*\{\s+"
        r"console\.log\('\[EmailService-VERIFY\] ❌ SMTP VERIFICATION FAILED FOR " + op_upper_esc + r" EMAIL'\);\s+"
        r"console\.log\('\[EmailService-ERROR\]',\s*verifyError\?\.message\s*\|\|\s*JSON\.stringify\(verifyError\)\);\s+"
        r"emailLogger\.error\('\[EmailService-VERIFY\] SMTP verification failed for " + op_lower_esc + r":',\s*verifyError\?\.message\);\s+"
        r"return\s*\{\s*success:\s*false,\s*error:\s*`SMTP verification failed: \$\{verifyError\?\.message\}`\s*\};\s+"
        r"\}"
    )
    
    verify_replacement = (
        f"console.log('[EmailService-VERIFY] VERIFYING GMAIL API BEFORE {op_upper} EMAIL');\n\n"
        f"    // Verify Gmail API is accessible\n"
        f"    const verification = await verifySmtpConnection('Gmail API verification for {op_lower}');\n"
        f"    if (!verification.success) {{\n"
        f"      emailLogger.error(`Gmail API verification failed: ${{verification.error}}`);\n"
        f"      return {{\n"
        f"        success: false,\n"
        f"        error: verification.error,\n"
        f"        statusCode: verification.statusCode,\n"
        f"      }};\n"
        f"    }}\n\n"
        f"    console.log('[EmailService-VERIFY] ✅ GMAIL API VERIFIED FOR {op_upper} EMAIL');\n"
        f"    emailLogger.info('[EmailService-VERIFY] Gmail API verified for {op_lower}');"
    )
    
    content = re.sub(verify_pattern, verify_replacement, content, flags=re.DOTALL)

print("Writing file...")
with open(r'c:\Users\Abc\Desktop\Transport-Management-System\server\src\utils\email.service.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ Done!")
