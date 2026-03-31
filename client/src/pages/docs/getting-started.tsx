import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function GettingStarted() {
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
        
        <h1 className="text-4xl font-bold mb-6">🚀 Getting Started</h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Complete guide to setting up and using the Transport Management System</p>
        
        {/* Welcome Section */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Welcome to TMS Platform</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            The Transport Management System (TMS) is a comprehensive platform designed to streamline your fleet operations, from vehicle management to real-time trip tracking. Whether you're managing 5 vehicles or 500, this system provides the tools you need to optimize efficiency, reduce costs, and improve safety.
          </p>
        </div>

        {/* Step 1: Account Setup */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Step 1: Create Your Account & Company Profile</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <strong>What to do:</strong> Register using your company email and create your company profile with basic information.
          </p>
          <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'} border border-blue-200 mb-4`}>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <strong>Practical Example:</strong><br/>
              Company: "ABC Logistics Ltd"<br/>
              Industry: Express Delivery<br/>
              Headquarters: Mumbai, India<br/>
              Phone: +91-22-1234-5678<br/>
              Email: admin@abclogistics.com
            </p>
          </div>
          <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <strong>Why this matters:</strong> This information helps the system track compliance requirements, send authoritative communications, and manage billing and invoicing.
          </p>
        </div>

        {/* Step 2: Add Vehicles */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Step 2: Add Your Vehicles to Fleet</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <strong>What to do:</strong> Register each vehicle in your fleet with complete details including registration number, capacity, and configuration.
          </p>
          <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'} border border-blue-200 mb-4`}>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-mono text-sm`}>
              <strong>Example Vehicle Entry:</strong><br/>
              Registration: MH-02-AB-1234<br/>
              Type: Heavy Goods Vehicle (HGV)<br/>
              Capacity: 20 Tons<br/>
              Fuel Type: Diesel<br/>
              Mileage: 45,000 km<br/>
              Insurance: Valid until Dec 2024<br/>
              Last Service: March 2024
            </p>
          </div>
          <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <strong>Why this matters:</strong> Accurate vehicle information enables the system to assign trips based on capacity, track compliance, and manage maintenance schedules automatically.
          </p>
        </div>

        {/* Step 3: Register Drivers */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Step 3: Register Your Drivers</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <strong>What to do:</strong> Add driver profiles with contact information, license details, training records, and emergency contacts.
          </p>
          <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'} border border-blue-200 mb-4`}>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-mono text-sm`}>
              <strong>Example Driver Profile:</strong><br/>
              Name: Rajesh Kumar<br/>
              License No: DL-8715-20231234567<br/>
              License Type: HMV (Heavy Motor Vehicle)<br/>
              Valid Till: June 2026<br/>
              Phone: +91-98765-43210<br/>
              Experience: 12 years<br/>
              Training: Advanced Safety (Completed March 2024)
            </p>
          </div>
          <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <strong>Why this matters:</strong> Driver information helps track compliance with duty hour regulations, manage training certifications, and maintain a safety record.
          </p>
        </div>

        {/* Step 4: Create First Trip */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Step 4: Create Your First Trip</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <strong>What to do:</strong> Create a trip by specifying pickup and delivery points, selecting a vehicle and driver, and setting the route.
          </p>
          <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'} border border-blue-200 mb-4`}>
            <p className={`${isDark ? 'text-gray-300' : 'text-gray-700'} font-mono text-sm`}>
              <strong>Example Trip:</strong><br/>
              Trip ID: TRP-2024-001<br/>
              Pickup: Mumbai Port Authority, Mumbai<br/>
              Delivery: Delhi Warehouse, New Delhi<br/>
              Distance: 1,500 km<br/>
              Estimated Duration: 24 hours<br/>
              Vehicle: MH-02-AB-1234 (20-ton capacity)<br/>
              Driver: Rajesh Kumar<br/>
              Cargo: Electronics (8 tons)<br/>
              Rate: ₹15,000
            </p>
          </div>
          <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <strong>Why this matters:</strong> The system will track the trip in real-time, manage driver duty hours, calculate expenses, and generate invoices automatically.
          </p>
        </div>

        {/* Best Practices */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">💡 Best Practices for Getting Started</h2>
          <ul className={`list-disc list-inside space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li><strong>Data Accuracy:</strong> Ensure all vehicle registration numbers and driver licenses are entered exactly as they appear in official documents to avoid compliance issues.</li>
            <li><strong>Regular Updates:</strong> Update driver training records and vehicle maintenance schedules promptly to ensure automatic alerts work correctly.</li>
            <li><strong>Route Planning:</strong> Before creating trips, verify pickup and delivery addresses are complete and correct to prevent delays.</li>
            <li><strong>Communication:</strong> Set up driver phone numbers and email addresses correctly so they receive trip assignments and important alerts.</li>
            <li><strong>Backup Information:</strong> Maintain physical copies of driver licenses and vehicle documents for regulatory compliance and quick reference.</li>
          </ul>
        </div>

        {/* Common Tasks */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">🔧 Common Tasks to Try Next</h2>
          <ol className={`list-decimal list-inside space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li><strong>Monitor Dashboard:</strong> Visit the dashboard to see real-time trip status, vehicle locations, and performance metrics.</li>
            <li><strong>Track Trip Progress:</strong> Click on an active trip to view real-time GPS tracking, driver status, and estimated arrival time.</li>
            <li><strong>View Analytics:</strong> Check the analytics section to see total distance covered, fuel costs, and revenue trends.</li>
            <li><strong>Generate Reports:</strong> Create custom reports for your management team showing expense breakdown, trip history, and driver performance.</li>
            <li><strong>Set Maintenance Reminders:</strong> Configure automatic maintenance alerts based on kilometers or days since last service.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
