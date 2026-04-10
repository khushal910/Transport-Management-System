import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function EmployeeManagement() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('dark-mode') === 'true';
    setIsDark(darkMode);
  }, []);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link to="/docs" className={`text-blue-600 hover:text-blue-700 mb-8 inline-block`}>
          ← Back to Documentation
        </Link>
        
        <h1 className="text-4xl font-bold mb-6">👥 Employee Management</h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Complete guide to managing team members, roles, and account recovery</p>

        {/* Overview */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Employee Management Overview</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            The Employee Management system allows managers to add, update, manage, delete, and recover team members. The system supports multiple roles including Drivers, Dispatchers, Safety Officers, and Financial Analysts. Built-in safety features include automatic recovery of deleted employees and comprehensive activity tracking.
          </p>
        </div>

        {/* Employee Roles */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Employee Roles & Responsibilities</h2>
          
          <div className={`space-y-4`}>
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-blue-500' : 'bg-blue-50 border-blue-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>🚗 Driver</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Operates vehicles and completes trip assignments. Requires valid driver's license, certifications, and safety compliance.
              </p>
              <ul className={`list-disc list-inside space-y-1 ml-2 mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>License information tracked with automatic expiry alerts</li>
                <li>Safety score monitored continuously</li>
                <li>Duty hours and rest periods tracked</li>
                <li>Performance metrics calculated automatically</li>
              </ul>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-green-500' : 'bg-green-50 border-green-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>📋 Dispatcher</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Assigns trips and manages ongoing operations. Can view employee data but cannot delete or modify records.
              </p>
              <ul className={`list-disc list-inside space-y-1 ml-2 mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Read-only access to employee information</li>
                <li>Can assign trips to available drivers</li>
                <li>Real-time monitoring of driver status</li>
              </ul>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-yellow-500' : 'bg-yellow-50 border-yellow-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>🛡️ Safety Officer</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Monitors driver safety, compliance, and violations. Generates safety reports and recommendations.
              </p>
              <ul className={`list-disc list-inside space-y-1 ml-2 mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Access to safety metrics and violation logs</li>
                <li>Can generate compliance reports</li>
                <li>Cannot modify employee records</li>
              </ul>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-purple-500' : 'bg-purple-50 border-purple-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>💰 Financial Analyst</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Analyzes costs, expenses, and financial metrics. Generates financial reports and budgets.
              </p>
              <ul className={`list-disc list-inside space-y-1 ml-2 mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Access to expense and cost data</li>
                <li>Generate financial reports</li>
                <li>Budget planning and analysis</li>
              </ul>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-red-500' : 'bg-red-50 border-red-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>👑 Manager</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Full access to all employee management features. Can add, update, delete, and recover team members.
              </p>
              <ul className={`list-disc list-inside space-y-1 ml-2 mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Add new employees with roles and certifications</li>
                <li>Update employee information and driver licenses</li>
                <li>Delete employees (soft delete, not permanent)</li>
                <li>Recover deleted employees automatically</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Adding Employees */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Adding Employees</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Managers can add new employees through the Team page. The process varies slightly based on environment mode.
          </p>

          <div className={`mt-4 space-y-4`}>
            <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>📝 Employee Information</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li><strong>Full Name:</strong> Employee's complete name</li>
                <li><strong>Email:</strong> Work email (must be unique)</li>
                <li><strong>Role:</strong> Driver, Dispatcher, Safety Officer, or Financial Analyst</li>
              </ul>
            </div>

            <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>🚗 Driver-Specific Information</p>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Only required if role is set to "Driver":</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li><strong>License Number:</strong> Unique driver license ID</li>
                <li><strong>License Expiry:</strong> Date when license expires</li>
                <li><strong>License Category:</strong> HMV, HPMV, LMV, etc.</li>
              </ul>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-green-500' : 'bg-green-50 border-green-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>✅ Development Mode (Auto-Activation)</p>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                In development/testing environment, employees are automatically activated with a default password.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example:</strong> Add new driver "Raj Kumar" with email raj@company.com. System generates default password: "Dev@123" (or configured password). Email shows password in response. Employee can login immediately. Good for quick testing.
                </p>
              </div>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-orange-500' : 'bg-orange-50 border-orange-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>🔐 Production Mode (Email Setup)</p>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                In production, employees receive a secure setup email with a unique link to set their own password.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Process:</strong><br/>
                  1. Manager adds employee "Sarah" with email sarah@company.com<br/>
                  2. System sends email with subject "Welcome to Transport Management System"<br/>
                  3. Email contains unique setup link valid for 24 hours<br/>
                  4. Sarah clicks link, creates her own password<br/>
                  5. Account activated, Sarah can login<br/>
                  <strong>Security Benefit:</strong> Only Sarah knows her password. Manager never sees it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Auto-Recovery Feature */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">✨ Automatic User Recovery (NEW)</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            A smart safety feature that prevents accidental data loss. If you delete an employee by mistake and later try to re-add them with the same email, the system automatically recovers their account instead of blocking you.
          </p>

          <div className={`mt-4 space-y-4`}>
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-green-500' : 'bg-green-50 border-green-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>How It Works</p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} mb-3`}>
                  <strong>Step 1: Delete Employee</strong><br/>
                  Manager deletes "Raj Kumar" (email: raj@example.com). Employee is marked as deleted in database.
                </p>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} mb-3`}>
                  <strong>Step 2: Mistake Realized</strong><br/>
                  Manager realizes Raj was deleted by mistake. Actually wants to keep him but change his role.
                </p>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} mb-3`}>
                  <strong>Step 3: Re-Add with Same Email</strong><br/>
                  Manager adds employee again using same email: raj@example.com, with updated information.
                </p>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Step 4: Automatic Recovery ✅</strong><br/>
                  Instead of "Email already exists" error, system detects deleted account. Automatically recovers account with new information. Recovery email sent to Raj. Account is active again!
                </p>
              </div>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-yellow-500' : 'bg-yellow-50 border-yellow-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>Recovery Rules & Guarantees</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>✅ Automatically recovers only if employee belongs to SAME company</li>
                <li>✅ Updates employee name, role, and certifications</li>
                <li>✅ Recreates driver record if role changed to Driver</li>
                <li>✅ Sends recovery email to activate account</li>
                <li>✅ Prevents accidental data loss from misclicks</li>
                <li>❌ Does NOT recover if email belongs to different company (security feature)</li>
              </ul>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-red-500' : 'bg-red-50 border-red-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>Recovery vs Permanent Delete</p>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Important: When you delete an employee in this system, it's a "soft delete" - the account is marked as deleted but data remains in database.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                  <strong>Soft Delete Benefits:</strong>
                </p>
                <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <li>Historical data preserved (for audits/reports)</li>
                  <li>Can recover if deleted by mistake</li>
                  <li>Deleted Employees tab shows all deleted accounts</li>
                  <li>Manual recovery available from Deleted Employees tab</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Deleted Employees Tab */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Deleted Employees Tab (Manual Recovery)</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            In addition to automatic recovery, managers can manually recover deleted employees from the Team page.
          </p>

          <div className={`mt-4 space-y-3`}>
            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>📍 Finding Deleted Employees</p>
              <p className={`ml-4 mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                1. Go to Team page<br/>
                2. Click "Deleted Employees" tab (shows count of deleted accounts)<br/>
                3. Search for employee by name (search is real-time)<br/>
                4. Click "✓ Recover" button next to employee name
              </p>
            </div>

            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>🔄 Manual Recovery Process</p>
              <p className={`ml-4 mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                • Confirm recovery (no permission needed, only manager can see deleted tab)<br/>
                • System updates employee status from deleted to active<br/>
                • Recovery email sent to employee<br/>
                • Employee reappears in Active Employees tab<br/>
                • Full history maintained (nothing is lost)
              </p>
            </div>

            <div className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <strong>Example:</strong> Deleted employee "Priya" was accidentally deleted 3 days ago. Manager searches "Priya" in Deleted Employees tab. Finds her in deactivated list. Clicks Recover. Priya immediately gets recovery email. Can login next day. No data loss. All her driver records, trips completed, and performance history intact.
              </p>
            </div>
          </div>
        </div>

        {/* Editing Employees */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Editing & Updating Employees</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Managers can update employee information after they set their password. This allows for role changes, license updates, and other modifications.
          </p>

          <div className={`mt-4 space-y-3`}>
            <div className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>✅ Can Edit</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Name, Email, Role, Driver License info, Performance metrics</p>
            </div>

            <div className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-red-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>❌ Cannot Edit</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Password (employee must reset via forgot password), ID</p>
            </div>

            <div className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <strong>Note:</strong> Edit button is disabled if employee hasn't set password yet. This ensures employee is active and has access before making changes.
              </p>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">🔐 Security Features</h2>
          <ul className={`space-y-3`}>
            <li className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Manager-Only Access</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Only managers can add, edit, delete employees. Other roles have read-only access.</p>
            </li>
            <li className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Email Verification</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>All employee emails verified and unique per company.</p>
            </li>
            <li className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Soft Deletes</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Data never permanently deleted, always recoverable for 30+ days.</p>
            </li>
            <li className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Audit Trail</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>All changes logged: who deleted employee, when, recovery history.</p>
            </li>
            <li className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>Company Isolation</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Managers only see employees of their own company.</p>
            </li>
          </ul>
        </div>

        {/* Best Practices */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">💡 Best Practices</h2>
          <ul className={`space-y-3`}>
            <li className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>✅ Always verify information before adding drivers - save on corrections later</p>
            </li>
            <li className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>✅ Keep driver licenses updated - system alerts 30 days before expiry</p>
            </li>
            <li className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>✅ Don't hesitate to delete for testing - automatic recovery available</p>
            </li>
            <li className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>✅ Check Deleted Employees tab periodically to recover critical staff</p>
            </li>
            <li className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>✅ Use different emails for different roles - prevents confusion</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
