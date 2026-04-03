import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function EmailNotificationsDocs() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('dark-mode') === 'true';
    setIsDark(darkMode);
  }, []);

  const emailTypes = [
    {
      title: 'Employee Details Updated',
      icon: '📋',
      trigger: 'When manager updates employee information',
      recipient: 'The employee whose details were changed',
      recipient_email: 'Updated employee address',
      shows: [
        'What fields were changed (Name, Email, Role, Password)',
        'Timestamp of the change',
        'Security notice if unauthorized',
      ],
    },
    {
      title: 'Password Reset',
      icon: '🔑',
      trigger: 'When employee requests password reset',
      recipient: 'Employee requesting the reset',
      recipient_email: 'Employee registered email',
      shows: [
        'Password reset link (24-hour expiration)',
        'Instructions for creating new password',
        'Security notice if not authorized',
      ],
    },
    {
      title: 'Account Setup',
      icon: '🎉',
      trigger: 'When new employee account is created',
      recipient: 'New employee',
      recipient_email: 'Email assigned by manager',
      shows: [
        'Welcome message with name',
        'Setup link to create password',
        'Password strength requirements',
        'Account activation instructions',
      ],
    },
    {
      title: 'Account Deactivation',
      icon: '❌',
      trigger: 'When manager deactivates employee',
      recipient: 'Deactivated employee',
      recipient_email: 'Employee registered email',
      shows: [
        'Deactivation notice and date',
        'Employee information summary',
        'Access removal confirmation',
        'HR contact information',
      ],
    },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-6xl mx-auto px-4 py-16">
        <Link to="/docs" className={`text-blue-600 hover:text-blue-700 mb-8 inline-block`}>
          ← Back to Documentation
        </Link>

        <h1 className="text-4xl font-bold mb-4">📧 Email Notifications & Communication</h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
          Learn how the system sends professional email notifications to keep your team informed
        </p>

        {/* Overview */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-blue-50 border border-blue-200'}`}>
          <h2 className="text-2xl font-bold mb-4">System Overview</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            FleetFlow uses automated email notifications to keep employees informed about account changes, account setup, and password resets. All emails are professionally formatted with HTML templates and include security notices.
          </p>
          <p className={isDark ? 'text-gray-300' : 'text-gray-700'}>
            <strong>Key Feature:</strong> When a manager updates an employee's details (name, email, role, or password), an automatic email notification is sent to the employee's email address with details of what was changed.
          </p>
        </div>

        {/* Email Types */}
        <div className="mt-12">
          <h2 className="text-3xl font-bold mb-6">Email Types</h2>
          {emailTypes.map((email, idx) => (
            <div
              key={idx}
              className={`mb-8 p-6 rounded-lg ${
                isDark
                  ? 'bg-gray-800 border border-gray-700'
                  : 'bg-white border border-gray-200 shadow-lg'
              }`}
            >
              <div className="flex items-center mb-4">
                <span className="text-4xl mr-4">{email.icon}</span>
                <div>
                  <h3 className="text-2xl font-bold">{email.title}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Triggered: {email.trigger}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div>
                  <h4 className="font-bold mb-2">👤 Recipient</h4>
                  <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {email.recipient}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <strong>Email:</strong> {email.recipient_email}
                  </p>
                </div>

                <div>
                  <h4 className="font-bold mb-2">📝 Email Shows</h4>
                  <ul className={`space-y-1 text-sm`}>
                    {email.shows.map((item, sidx) => (
                      <li key={sidx} className={`flex items-start ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="mr-2 text-blue-500">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Employee Details Updated - Detailed */}
        <div className={`mt-12 p-6 rounded-lg ${isDark ? 'bg-purple-900 border border-purple-700' : 'bg-purple-50 border border-purple-200'}`}>
          <h2 className="text-2xl font-bold mb-4">📋 Employee Details Updated Email (NEW FEATURE)</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            This is our latest feature! When a manager updates an employee's information, the employee automatically receives a professional email notification.
          </p>

          <div className={`p-4 rounded mt-4 ${isDark ? 'bg-purple-800' : 'bg-purple-100'} border ${isDark ? 'border-purple-600' : 'border-purple-300'}`}>
            <h4 className="font-bold mb-2">📌 Real-World Example</h4>
            <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>Scenario:</strong> Manager "Rajesh" updates driver "Amit" from role "Driver" to "Dispatcher"
            </p>
            <ul className={`space-y-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li><strong>Manager Action:</strong> Opens Team page → Clicks Edit on Amit's profile</li>
              <li><strong>Changes Made:</strong> Role changed from "Driver" to "Dispatcher"</li>
              <li><strong>Saves:</strong> Clicks Save button</li>
              <li><strong>User Gets:</strong> Email sent to Amit's email</li>
              <li className="font-semibold text-blue-600 mt-2">
                Email Subject: "Your Account Details Have Been Updated"
              </li>
              <li className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Email Shows: ✓ Role: Dispatcher (new role)
              </li>
            </ul>
          </div>

          <div className={`p-4 rounded mt-4 ${isDark ? 'bg-purple-800' : 'bg-purple-100'} border ${isDark ? 'border-purple-600' : 'border-purple-300'}`}>
            <h4 className="font-bold mb-2">✨ Updated Fields Shown</h4>
            <ul className={`space-y-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <li>📝 <strong>Name:</strong> If employee name was changed</li>
              <li>✉️ <strong>Email:</strong> If employee email was changed</li>
              <li>👤 <strong>Role:</strong> If employee role was changed</li>
              <li>🔐 <strong>Password:</strong> If password was reset</li>
            </ul>
          </div>
        </div>

        {/* Email Template Features */}
        <div className={`mt-12 p-6 rounded-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200 shadow-lg'}`}>
          <h2 className="text-2xl font-bold mb-4">🎨 Email Template Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className="font-bold mb-2">📧 Universal Elements</h4>
              <ul className={`space-y-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>✓ Professional header with company branding</li>
                <li>✓ Clear, descriptive subject line</li>
                <li>✓ Timestamp of action</li>
                <li>✓ Main content with action details</li>
                <li>✓ Security section for unauthorized access warning</li>
                <li>✓ Help & contact information</li>
              </ul>
            </div>

            <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className="font-bold mb-2">🎯 Design Highlights</h4>
              <ul className={`space-y-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>✓ Responsive HTML design</li>
                <li>✓ Professional color scheme (blue, green, red)</li>
                <li>✓ Mobile-friendly layout (max 600px width)</li>
                <li>✓ Color-coded status badges</li>
                <li>✓ Clear call-to-action buttons</li>
                <li>✓ Auto-renewal security notices</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Configuration */}
        <div className={`mt-12 p-6 rounded-lg ${isDark ? 'bg-green-900 border border-green-700' : 'bg-green-50 border border-green-200'}`}>
          <h2 className="text-2xl font-bold mb-4">⚙️ Email Configuration</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Emails are sent automatically using Gmail's SMTP service. System administrators need to configure:
          </p>
          <div className={`p-4 rounded font-mono text-sm bg-black text-green-400 border ${isDark ? 'border-green-700' : 'border-green-300'} overflow-x-auto`}>
            {`EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
CLIENT_URL=http://localhost:5173`}
          </div>
          <p className={`mt-4 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <strong>Setup Steps:</strong>
          </p>
          <ol className={`mt-2 space-y-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} list-decimal list-inside`}>
            <li>Enable 2-Factor Authentication on Gmail account</li>
            <li>Generate App-Specific Password at myaccount.google.com/apppasswords</li>
            <li>Add credentials to server .env file</li>
            <li>Restart backend server</li>
          </ol>
        </div>

        {/* Troubleshooting */}
        <div className={`mt-12 p-6 rounded-lg ${isDark ? 'bg-red-900 border border-red-700' : 'bg-red-50 border border-red-200'}`}>
          <h2 className="text-2xl font-bold mb-4">🔧 Troubleshooting</h2>
          <div className="space-y-4">
            <div>
              <p className="font-bold">❌ Emails not sending?</p>
              <ul className={`mt-2 space-y-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>1. Verify .env file has EMAIL_USER and EMAIL_PASSWORD</li>
                <li>2. Check that you're using App-Specific Password (not regular Gmail password)</li>
                <li>3. Ensure 2-Factor Authentication is enabled on Gmail</li>
                <li>4. Check server console for error messages</li>
                <li>5. Look in spam/promotions folder for emails</li>
              </ul>
            </div>
            <div>
              <p className="font-bold">📝 Check Email Logs</p>
              <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Backend console will show: <br/>
                <span className="font-mono">✓ "Email transporter ready to send emails"</span> <br/>
                <span className="font-mono">✓ "Employee details updated email sent successfully to: email@example.com"</span>
              </p>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className={`mt-12 p-6 rounded-lg ${isDark ? 'bg-blue-900 border border-blue-700' : 'bg-blue-50 border border-blue-200'}`}>
          <h2 className="text-2xl font-bold mb-4">💡 Best Practices</h2>
          <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li className="flex items-start">
              <span className="mr-3 font-bold">•</span>
              Always verify email recipient before making changes to employee records
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-bold">•</span>
              Inform employees in advance when major role changes occur
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-bold">•</span>
              Check email logs regularly for failed delivery attempts
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-bold">•</span>
              Ensure spam filters don't block system emails (whitelist sender)
            </li>
            <li className="flex items-start">
              <span className="mr-3 font-bold">•</span>
              Review email content for accuracy and completeness
            </li>
          </ul>
        </div>

        {/* Footer */}
        <div className={`mt-12 p-8 rounded-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-gray-50 border border-gray-200'} text-center`}>
          <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>
            Want to learn about user roles and permissions? Check out our RBAC documentation.
          </p>
          <Link to="/docs/rbac" className="text-blue-600 hover:text-blue-700 mt-2 inline-block font-semibold">
            View Role-Based Access Control Documentation →
          </Link>
        </div>
      </div>
    </div>
  );
}
