import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function SecurityDocs() {
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
        
        <h1 className="text-4xl font-bold mb-6">🔒 System Security & Privacy</h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Your guide to understanding security features, data protection, and safe operations</p>

        {/* Overview */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Security Overview</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Transport Management System is built with security-first architecture. This means protecting your data, respecting privacy, and preventing unauthorized access. While explaining at a level an 8-year-old can understand, we don't compromise on actual security implementation.
          </p>
          <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <strong>Think of it like a bank:</strong> The bank doesn't let everyone touch the money. Only authorized people (with keys) can open the vault. The bank tracks who opens it and when. Our system works the same way with your data.
          </p>
        </div>

        {/* Authentication */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">🔐 Authentication (Login & Password)</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Authentication is how the system verifies "you are who you say you are."
          </p>

          <div className={`space-y-4`}>
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-green-500' : 'bg-green-50 border-green-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>🎟️ Login Process</p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  1. Enter email and password<br/>
                  2. System checks if email exists<br/>
                  3. System verifies password (encrypted comparison, never shown)<br/>
                  4. If correct: System creates secure token (JWT)<br/>
                  5. Token stored in secure cookie (httpOnly = can't be stolen by hackers)<br/>
                  6. You're logged in!<br/>
                  <strong>Token Validity:</strong> 1 hour. Must login again after 1 hour for security.
                </p>
              </div>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-yellow-500' : 'bg-yellow-50 border-yellow-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>🔑 Password Security</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li><strong>Hashing:</strong> Passwords encrypted using bcrypt (industry standard). Even our engineers can't see your password.</li>
                <li><strong>Never Transmitted:</strong> Passwords sent over HTTPS only (encrypted tunnel).</li>
                <li><strong>Never Stored in Logs:</strong> Password never logged or shown in system logs.</li>
                <li><strong>Reset via Email:</strong> Forgot password? Secure link sent to your email, NOT your password.</li>
              </ul>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-red-500' : 'bg-red-50 border-red-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>❌ What We Don't Do</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Never store passwords in plain text</li>
                <li>Never send passwords via email or message</li>
                <li>Never allow weak passwords</li>
                <li>Never expose tokens in HTTP (always HTTPS)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Authorization */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">🛡️ Authorization (Role-Based Access)</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Authorization is "what you are allowed to do." Not everyone should do everything.
          </p>

          <div className={`mt-4 space-y-4`}>
            <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-3`}>Analogy: Restaurant Kitchen</p>
              <ul className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>🚪 <strong>Server:</strong> Can order food, serve customers, but NOT see chef's recipes</li>
                <li>👨‍🍳 <strong>Chef:</strong> Can see recipes, manage food, but NOT handle money</li>
                <li>💰 <strong>Manager:</strong> Can see everything, approve all transactions</li>
                <li>🚫 <strong>Customer:</strong> Can only order, NOT see kitchen</li>
              </ul>
              <p className={`mt-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Same in TMS:</strong> Each role has specific permissions. Drivers can't delete employees. Dispatchers can't modify financial data. Everyone is restricted to their role - that's the whole point!
              </p>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-green-500' : 'bg-green-50 border-green-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>Role-Based Permissions</p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2 space-y-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Driver:</strong> View own profile, trips, GPS tracking only. ❌ Cannot see other drivers' data.
                </p>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Dispatcher:</strong> Read employee data, assign trips. ❌ Cannot edit/delete employees.
                </p>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Manager:</strong> Full access to employee management. Still ❌ Cannot see other company's data (multi-tenancy protection).
                </p>
              </div>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-yellow-500' : 'bg-yellow-50 border-yellow-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>Frontend + Backend Validation (Double Check)</p>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Important: Authorization happens on BOTH frontend and backend. This is called "defense in depth."
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Why two checks?</strong><br/>
                  Imagine a car with driver airbags AND passenger airbags. One isn't enough! Same with security.<br/>
                  <strong>Frontend check:</strong> Hide buttons/features user can't use (better UX)<br/>
                  <strong>Backend check:</strong> REAL security - even if someone hacks frontend (removes button manually), backend still blocks them!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Protection */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">📦 Data Protection</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            How your data is protected from theft/loss/corruption.
          </p>

          <div className={`space-y-4`}>
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-blue-500' : 'bg-blue-50 border-blue-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>🔒 Encryption in Transit</p>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                When data travels from your browser to server, it's encrypted using HTTPS (SSL/TLS).
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Analogy:</strong> Like sending a letter in a locked box, not a postcard. Only sender and receiver have keys. Even if postman intercepts, can't read contents.
                </p>
              </div>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-green-500' : 'bg-green-50 border-green-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>🗄️ Database Security</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li><strong>Isolated Database:</strong> Each company's data stored separately (multi-tenancy)</li>
                <li><strong>Backups:</strong> Regular backups (daily/weekly) to prevent data loss</li>
                <li><strong>Access Control:</strong> Only backend server can access database, not direct internet access</li>
                <li><strong>Query Validation:</strong> SQL injection attacks prevented by parameterized queries</li>
              </ul>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-yellow-500' : 'bg-yellow-50 border-yellow-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>👁️ Soft Deletes (Data Recovery)</p>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                When you delete data, it's not actually deleted from database. Just marked as "deleted." This provides:
              </p>
              <ul className={`list-disc list-inside space-y-1 ml-2 mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Protection from accidental deletions (can recover)</li>
                <li>Audit trails (know what was deleted and by whom)</li>
                <li>Historical data preservation (for reports/compliance)</li>
                <li>Time-travel capability (see data state at any point)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Multi-Tenancy */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">🏢 Multi-Tenancy (Data Isolation)</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            System supports multiple companies. Most important: companies CANNOT see each other's data.
          </p>

          <div className={`mt-4 space-y-4`}>
            <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-3`}>Analogy: Apartment Building</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Each company is like an apartment. You can't see into your neighbor's apartment. Same building, completely separate spaces. Only building manager (admin) can enter all apartments for maintenance.
              </p>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-green-500' : 'bg-green-50 border-green-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>How It Works</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Every record in database has <code>company_id</code> field</li>
                <li>When you login, system stores your <code>companyId</code> in token</li>
                <li>Every query automatically filters by <code>companyId</code></li>
                <li>Even if someone manually edits request, backend validates companyId</li>
                <li>Result: Impossible to see other company's data</li>
              </ul>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-red-500' : 'bg-red-50 border-red-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>Example Attack Prevention</p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  Hacker tries: "Show me all employees" without company filter.<br/>
                  Backend sees request: <code>query: {'{'}employees: all{'}'}</code>, but current user company is "Uber". <br/>
                  Backend adds automatic filter: <code>query: {'{'}employees: all, company: "Uber"{'}'}</code><br/>
                  Result: Only Uber employees returned, even if hacker tried to see Flipkart's employees. ✅ Safe!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Audit & Compliance */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">📋 Audit & Compliance</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            System logs important activities for compliance and dispute resolution.
          </p>

          <div className={`space-y-3 mt-4`}>
            <div className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <strong>What's Logged:</strong> Login attempts, employee additions/deletions, role changes, data modifications, who deleted what and when.
              </p>
            </div>
            <div className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <strong>Why:</strong> If there's a dispute ("I didn't delete that!"), logs prove who actually did it and when.
              </p>
            </div>
            <div className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                <strong>Compliance:</strong> Helps meet regulatory requirements (GDPR, local laws). Proves you maintain data security.
              </p>
            </div>
          </div>
        </div>

        {/* Common Security Misconceptions */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">❓ Common Myths & Misconceptions</h2>
          
          <div className={`space-y-4`}>
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-red-500' : 'bg-red-50 border-red-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>❌ Myth: Hiding password in UI is secure</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Reality: Hiding password on frontend is just for user privacy/UX. Real security is backend validation. A hacker can always bypass frontend.
              </p>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-red-500' : 'bg-red-50 border-red-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>❌ Myth: Encrypted password at rest means employee can't see it</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Reality: Manager adding employee should NEVER see password. Employee should receive setup link via email. This is true security.
              </p>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-green-500' : 'bg-green-50 border-green-600'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>✅ Best Practice: Defense in Depth</p>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Multiple layers of security:
              </p>
              <ul className={`list-disc list-inside space-y-1 ml-2 mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Frontend validation (show errors early)</li>
                <li>Backend validation (REAL security)</li>
                <li>Role checking (frontend + backend)</li>
                <li>Encryption (transit + rest)</li>
                <li>Multi-tenancy isolation (data separation)</li>
                <li>Audit logs (accountability)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Security Checklist for Users */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">✅ Your Security Checklist</h2>
          <ul className={`space-y-3`}>
            <li className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>✅ Use strong, unique passwords (mix of letters, numbers, symbols)</p>
            </li>
            <li className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>✅ Never share your password with anyone (even managers)</p>
            </li>
            <li className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>✅ Log out on shared computers</p>
            </li>
            <li className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>✅ Keep browser/device updated (security patches)</p>
            </li>
            <li className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>✅ Be suspicious of unexpected emails/links (phishing protection)</p>
            </li>
            <li className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>✅ Use HTTPS (look for 🔒 lock icon in browser)</p>
            </li>
            <li className={`p-3 rounded ${isDark ? 'bg-gray-700' : 'bg-green-50'}`}>
              <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>✅ Report suspicious activity to admin immediately</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
