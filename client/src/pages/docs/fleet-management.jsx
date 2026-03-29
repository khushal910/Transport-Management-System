import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function FleetManagement() {
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
        
        <h1 className="text-4xl font-bold mb-6">🚗 Fleet Management</h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Complete guide to managing your vehicle fleet, tracking status, and maintaining vehicle data</p>

        {/* Overview */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Fleet Management Overview</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Fleet management is the core of the TMS platform. It allows you to register, track, and maintain all your vehicles in one centralized place. Each vehicle has its own profile with complete history, maintenance records, and real-time status updates.
          </p>
        </div>

        {/* Vehicle Status Lifecycle */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Vehicle Status Lifecycle</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Every vehicle in your fleet has a status that changes based on its current activity. Understanding these statuses helps you manage assignments and plan operations effectively.
          </p>

          <div className={`mt-4 space-y-4`}>
            {/* Available Status */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-green-500' : 'bg-green-50 border-green-600'}`}>
              <h3 className="text-lg font-bold mb-2">✅ Available (Active)</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Status:</strong> Vehicle is ready for assignment and can accept new trips.
              </p>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>When it occurs:</strong> After a trip is completed, vehicle maintenance is done, or vehicle is first registered.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example:</strong> Vehicle MH-02-AB-1234 completed delivery to Delhi warehouse at 2:30 PM. Driver filed final report. System automatically marks vehicle as "Available" and ready for next assignment.
                </p>
              </div>
            </div>

            {/* In Transit */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-blue-500' : 'bg-blue-50 border-blue-600'}`}>
              <h3 className="text-lg font-bold mb-2">🚙 In Transit (Active)</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Status:</strong> Vehicle is currently on an active trip with a driver and cargo.
              </p>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>What happens:</strong> System tracks real-time GPS location, fuel consumption, and driver duty hours. Any delays are flagged automatically.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example:</strong> Vehicle MH-02-AB-1234 is en route from Mumbai (departed 8:00 AM) to Delhi. GPS shows vehicle at Nashik, 175 km from start. ETA: 11:30 PM same day. System tracks fuel consumption: 25 liters used so far (1 liter per 7 km).
                </p>
              </div>
            </div>

            {/* Scheduled */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-yellow-500' : 'bg-yellow-50 border-yellow-600'}`}>
              <h3 className="text-lg font-bold mb-2">📅 Scheduled</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Status:</strong> Trip has been assigned but vehicle hasn't started yet.
              </p>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>What happens:</strong> Driver receives notification, can pre-plan route, and confirm readiness. System reserves the vehicle for this trip.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example:</strong> Trip TRP-2024-156 scheduled for tomorrow 6:00 AM. Vehicle MH-02-AB-1234 assigned with driver Rajesh Kumar. Pickup point: Mumbai warehouse. Delivery: Bangalore. System sends notification to driver to prepare documents and confirm vehicle inspection.
                </p>
              </div>
            </div>

            {/* Maintenance */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-orange-500' : 'bg-orange-50 border-orange-600'}`}>
              <h3 className="text-lg font-bold mb-2">🔧 Maintenance (Inactive)</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Status:</strong> Vehicle is undergoing scheduled or corrective maintenance and cannot accept new trips.
              </p>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Why it's needed:</strong> Regular maintenance extends vehicle life, ensures safety, and maintains warranty. The system tracks all maintenance activities.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example:</strong> Vehicle MH-02-AB-1234 completed 50,000 km maintenance. At authorized service center. Work order: Engine oil change, tire rotation, brake inspection. Expected completion: Dec 15, 2024, 4:00 PM. System blocks new trip assignments until maintenance status changes to Available.
                </p>
              </div>
            </div>

            {/* Offline */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-red-500' : 'bg-red-50 border-red-600'}`}>
              <h3 className="text-lg font-bold mb-2">⛔ Offline (Inactive)</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Status:</strong> Vehicle is not operational and cannot accept new trips. GPS and monitoring are paused.
              </p>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Common reasons:</strong> Major repairs, licensing issues, insurance lapsed, vehicle decommissioned, or temporary storage.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example:</strong> Vehicle MH-02-AB-1234 license suspended for 3 months due to regulatory violation. System marks as Offline. Insurance coverage also paused. Vehicle cannot be assigned to any trip. Admin receives alert. Action required: Resolve regulatory issue, renew license, verify insurance before resuming operations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vehicle Information Fields */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Complete Vehicle Information Fields</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Each vehicle profile contains comprehensive information tracked throughout its lifecycle:
          </p>

          <div className={`space-y-3`}>
            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>📋 Basic Information</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Registration Number (e.g., MH-02-AB-1234)</li>
                <li>Vehicle Make and Model (e.g., TATA 2527 XE)</li>
                <li>Manufacturing Year (e.g., 2022)</li>
                <li>Chassis Number (for identification)</li>
              </ul>
            </div>

            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>⛽ Capacity & Configuration</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Weight Capacity (e.g., 20 tons)</li>
                <li>Volume Capacity (e.g., 40 cubic meters)</li>
                <li>Fuel Type and Tank Capacity (e.g., Diesel, 150 liters)</li>
                <li>Seating Capacity (driver + assistants)</li>
              </ul>
            </div>

            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>📄 Documentation</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Registration Certificate (RC) - Valid till date</li>
                <li>Insurance Policy - Valid till date</li>
                <li>Fitness Certificate - Valid till date (for commercial vehicles)</li>
                <li>Pollution Certificate (PUC) - Valid till date</li>
              </ul>
            </div>

            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>🔧 Maintenance Tracking</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Current Odometer Reading (km)</li>
                <li>Last Service Date & Mileage</li>
                <li>Next Service Due (km or date)</li>
                <li>Service History (complete record of all work)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How to Add a Vehicle */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">How to Add a Vehicle to Fleet</h2>
          <ol className={`list-decimal list-inside space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>Go to <strong>Fleet → Vehicle Registry</strong></li>
            <li>Click <strong>"Add New Vehicle"</strong> button</li>
            <li>Fill in basic information (registration number, make, model, year)</li>
            <li>Enter capacity details (weight, volume, fuel type)</li>
            <li>Add documentation dates (RC, Insurance, Fitness Certificate)</li>
            <li>Enter current odometer reading and last service date</li>
            <li>Click <strong>Save</strong> to register vehicle in system</li>
            <li>Vehicle status automatically set to "Available" and ready for assignments</li>
          </ol>
        </div>

        {/* Best Practices */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">💡 Fleet Management Best Practices</h2>
          <ul className={`list-disc list-inside space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li><strong>Regular Updates:</strong> Update odometer readings immediately after each trip so maintenance alerts trigger accurately.</li>
            <li><strong>Document Renewal Alerts:</strong> System sends alerts 30 days before insurance or registration expires. Renew immediately to avoid offline status.</li>
            <li><strong>Preventive Maintenance:</strong> Schedule regular maintenance based on kilometers (every 10,000 km) or months (every 3 months), whichever comes first.</li>
            <li><strong>Track Fuel Efficiency:</strong> Monitor fuel consumption patterns to identify issues early and optimize routes for fuel savings.</li>
            <li><strong>Keep Maintenance History:</strong> All service receipts and work orders should be uploaded to system for warranty claims and compliance audits.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
