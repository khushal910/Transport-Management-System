import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function DriverManagement() {
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
        
        <h1 className="text-4xl font-bold mb-6">👨‍💼 Driver Management</h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Complete guide to managing drivers, licenses, compliance, and performance</p>

        {/* Overview */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Driver Management Overview</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Drivers are the backbone of your transport operation. The driver management module helps you maintain complete profiles, track licenses and certifications, monitor compliance, and measure performance. The system ensures all drivers meet regulatory requirements and national safety standards.
          </p>
        </div>

        {/* Driver Information Fields */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Complete Driver Profile Information</h2>
          
          <div className={`space-y-4`}>
            <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>👤 Personal Information</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Full Name (as per government ID)</li>
                <li>Date of Birth (to track age restrictions)</li>
                <li>Phone Number (primary contact)</li>
                <li>Email Address (for notifications and communications)</li>
                <li>Emergency Contact (name, relationship, phone)</li>
              </ul>
            </div>

            <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>📜 License & Certification</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>License Number (unique identifier)</li>
                <li>License Type (e.g., HMV, HPMV, LMV)</li>
                <li>Issue Date and Expiry Date</li>
                <li>Additional Endorsements (hazmat, passenger, etc.)</li>
                <li>Medical Fitness Certificate (valid for commercial drivers)</li>
              </ul>
            </div>

            <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>💼 Employment Details</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Employee ID (internal reference)</li>
                <li>Joining Date (date hired)</li>
                <li>Experience Level (years of driving experience)</li>
                <li>Base Location (home depot/garage)</li>
                <li>Employment Status (active, suspended, terminated)</li>
              </ul>
            </div>

            <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>📚 Training & Certifications</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Safety Training (date completed, validity)</li>
                <li>First Aid Certification</li>
                <li>Vehicle Maintenance Training</li>
                <li>Hazardous Materials Training (if applicable)</li>
                <li>Defensive Driving Course</li>
              </ul>
            </div>

            <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>📊 Compliance Tracking</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Duty Hours (tracked automatically during trips)</li>
                <li>Rest Period Compliance (mandated breaks)</li>
                <li>Safety Violations (logged and tracked)</li>
                <li>Traffic Violations (points system)</li>
                <li>Accidents History (recorded with details)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Driver Status & Duty Hours */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Driver Duty Hours & Status Tracking</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            The system automatically tracks driver duty hours according to national regulations (e.g., Motor Vehicles Act, 1988). This ensures driver safety and legal compliance.
          </p>

          <div className={`mt-4 space-y-4`}>
            {/* Available Status */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-green-500' : 'bg-green-50 border-green-600'}`}>
              <h3 className="text-lg font-bold mb-2">✅ Available (Ready for Assignment)</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Driver is well-rested, has completed mandatory rest period, and is ready to accept new trip assignments.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example:</strong> Rajesh Kumar completed his last trip at 3:00 PM yesterday. Completed 8-hour mandatory rest. Available at 11:00 AM today. System shows status as "Available". Can be assigned to new trip immediately.
                </p>
              </div>
            </div>

            {/* On Duty */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-blue-500' : 'bg-blue-50 border-blue-600'}`}>
              <h3 className="text-lg font-bold mb-2">🚗 On Duty (Active Driving)</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Driver is currently driving and accumulating duty hours. System tracks continuous driving hours and alerts when mandatory break is required.
              </p>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Regulation Rule:</strong> Maximum 6 hours continuous driving, then 30-minute break required.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example:</strong> Rajesh Kumar driving from Mumbai to Nashik (6 hours). System tracks: Started 8:00 AM, now 1:45 PM (5:45 minutes driving). At 2:00 PM (6 hours), system sends alert: "Mandatory 30-minute break required". Driver stops at designated rest area. System automatically changes status to "On Break" during halt.
                </p>
              </div>
            </div>

            {/* On Break */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-yellow-500' : 'bg-yellow-50 border-yellow-600'}`}>
              <h3 className="text-lg font-bold mb-2">☕ On Break (Rest Period)</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Driver is taking mandatory rest after continuous driving. System tracks break duration and alerts when driver can resume driving safely.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example:</strong> Break started at 2:00 PM. Driver rests for 30 minutes. At 2:30 PM, system shows "Break Completed". Driver can resume driving. If driver needs overnight rest, they can mark as "On Rest" for full 8-hour mandatory rest period before next trip.
                </p>
              </div>
            </div>

            {/* Offline */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-red-500' : 'bg-red-50 border-red-600'}`}>
              <h3 className="text-lg font-bold mb-2">⛔ Offline (Not Available)</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Driver is not available for assignments. Reasons include: license expired, training certification overdue, medical fitness expired, or employment suspended.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example:</strong> Driver's HMV license expires on Dec 15, 2024. On Dec 16, 2024, system automatically marks driver as "Offline" until license is renewed. Admin receives alert. Driver cannot be assigned any trips until license renewed and updated in system.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Driver Performance Metrics</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            System automatically calculates performance metrics based on actual trip data, helping you identify top performers and provide coaching where needed.
          </p>

          <div className={`space-y-3`}>
            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>⏱️ On-Time Performance</p>
              <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Percentage of trips delivered on or before scheduled delivery time. Example: Rajesh Kumar has 92% on-time delivery rate.
              </p>
            </div>

            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>⛽ Fuel Efficiency</p>
              <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Average kilometers per liter achieved. System tracks fuel consumption against vehicle standard. Example: Achieving 6.5 km/liter when vehicle should achieve 7 km/liter indicates driving habits need improvement.
              </p>
            </div>

            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>🛡️ Safety Score</p>
              <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Based on accidents, violations, and customer complaints. Example: Score out of 100. Above 90 = Excellent, 70-90 = Good, below 70 = Needs Improvement.
              </p>
            </div>

            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>📊 Average Trip Duration</p>
              <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                How efficiently driver manages breaks and completes assigned trips. Example: 15 hours average for 500 km trip (including 1-hour break).
              </p>
            </div>

            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>⭐ Customer Rating</p>
              <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Average rating from customers/recipients on professionalism and service quality. Example: 4.7/5.0 based on 48 feedback entries.
              </p>
            </div>
          </div>
        </div>

        {/* How to Add a Driver */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">How to Register a Driver</h2>
          <ol className={`list-decimal list-inside space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>Go to <strong>Employee → Add Employee</strong></li>
            <li>Fill in driver's personal information (name, DOB, contact)</li>
            <li>Enter license details (number, type, expiry date)</li>
            <li>Upload supporting documents (license copy, medical certificate)</li>
            <li>Add emergency contact person</li>
            <li>Record training certifications completed</li>
            <li>Click <strong>Submit</strong> to register driver</li>
            <li>Driver account created and system sends login credentials via email</li>
            <li>Driver can now be assigned to trips</li>
          </ol>
        </div>

        {/* Best Practices */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">💡 Driver Management Best Practices</h2>
          <ul className={`list-disc list-inside space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li><strong>License Renewal Alerts:</strong> System alerts 45 days before license expiry. Renew immediately to avoid operational disruption.</li>
            <li><strong>Regular Training:</strong> Schedule quarterly safety training and re-certifications to maintain compliance and reduce accident rates.</li>
            <li><strong>Duty Hours Compliance:</strong> Never override duty hour limits. System prevents violations automatically, but monitor patterns to optimize scheduling.</li>
            <li><strong>Performance Reviews:</strong> Review performance metrics monthly to identify coaching opportunities and recognize top performers.</li>
            <li><strong>Medical Fitness:</strong> Ensure all commercial drivers undergo annual medical fitness tests. Track results in system.</li>
            <li><strong>Emergency Contacts:</strong> Keep emergency contact information up-to-date for safety communications and incident management.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
