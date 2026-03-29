import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function TripManagement() {
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
        
        <h1 className="text-4xl font-bold mb-6">📍 Trip Management</h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Complete guide to creating, tracking, and managing trips with real-time updates</p>

        {/* Overview */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Trip Management Overview</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Trips are the core operational unit of your transport business. Trip management covers everything from planning and assignment to real-time tracking and final reporting. The system automatically calculates routes, monitors progress, tracks expenses, and generates invoices.
          </p>
        </div>

        {/* Trip Information */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Complete Trip Information</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Each trip record contains comprehensive information to track all aspects of the shipment and operational performance.
          </p>

          <div className={`space-y-4`}>
            <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>📋 Basic Trip Details</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Trip ID (unique identifier, auto-generated)</li>
                <li>Pickup Location (from address with GPS coordinates)</li>
                <li>Delivery Location (to address with GPS coordinates)</li>
                <li>Pickup Date & Time (when cargo should be picked up)</li>
                <li>Estimated Delivery Date & Time (ETA)</li>
              </ul>
            </div>

            <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>🚛 Vehicle & Driver Assignment</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Vehicle Assigned (registration number)</li>
                <li>Primary Driver (name and license number)</li>
                <li>Co-Driver (if applicable)</li>
                <li>Vehicle Status at assignment</li>
              </ul>
            </div>

            <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>📦 Cargo Information</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Cargo Type (goods being transported)</li>
                <li>Total Weight (in kg)</li>
                <li>Volume/Dimensions (cubic meters)</li>
                <li>Special Handling (fragile, hazardous, temperature-controlled)</li>
                <li>Value of Shipment (for insurance)</li>
              </ul>
            </div>

            <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>💰 Financial Details</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Freight Charges (base rate per km or flat)</li>
                <li>Fuel Surcharge (if applicable)</li>
                <li>Toll Charges (predicted)</li>
                <li>Insurance Amount</li>
                <li>Total Trip Cost (automatic calculation)</li>
                <li>Payment Status (pending, partial, completed)</li>
              </ul>
            </div>

            <div className={`p-4 rounded ${isDark ? 'bg-gray-700' : 'bg-blue-50'}`}>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'} mb-2`}>📊 Operational Tracking</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Actual Pickup Time (when cargo loaded)</li>
                <li>Actual Delivery Time (when cargo unloaded)</li>
                <li>Actual Distance Covered (measured by GPS)</li>
                <li>Actual Fuel Consumed</li>
                <li>Route Taken (full trip path)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Trip Status Lifecycle */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Trip Status Lifecycle</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Every trip goes through multiple statuses from creation to completion. Understanding these helps you manage operations efficiently.
          </p>

          <div className={`mt-4 space-y-4`}>
            {/* Created */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-blue-500' : 'bg-blue-50 border-blue-600'}`}>
              <h3 className="text-lg font-bold mb-2">📝 Created</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Trip has been created in system but not yet assigned to any vehicle or driver. You can still edit trip details.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example:</strong> Dispatcher creates trip TRP-2024-001: Pickup from Mumbai warehouse Dec 15 9:00 AM, Delivery to Bangalore Dec 16 6:00 PM. Cargo: 500 boxes electronics (8 tons). System shows status "Created". Dispatcher can modify route or cargo details before assigning vehicle.
                </p>
              </div>
            </div>

            {/* Assigned */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-yellow-500' : 'bg-yellow-50 border-yellow-600'}`}>
              <h3 className="text-lg font-bold mb-2">📍 Assigned</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Trip has been assigned to a specific vehicle and driver. Driver receives notification with trip details and can confirm readiness.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example:</strong> Trip assigned to Vehicle MH-02-AB-1234 with Driver Rajesh Kumar. Driver receives SMS/Email notification with pickup address, contact, estimated freight charges. Driver confirms readiness by marking pre-trip inspection as completed in app.
                </p>
              </div>
            </div>

            {/* Pickup Scheduled */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-purple-500' : 'bg-purple-50 border-purple-600'}`}>
              <h3 className="text-lg font-bold mb-2">🎯 Pickup Scheduled</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Trip is waiting for scheduled pickup time. Driver is en route to pickup location or at pickup location preparing for cargo loading.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example:</strong> Pickup scheduled Dec 15 9:00 AM. Driver Rajesh is already at warehouse at 8:45 AM. He waits for cargo readiness. Warehouse manager reviews packing, performs final count, and confirms 500 boxes weigh 8 tons. Driver loads cargo and updates pickup time online as 9:15 AM.
                </p>
              </div>
            </div>

            {/* In Transit */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-green-500' : 'bg-green-50 border-green-600'}`}>
              <h3 className="text-lg font-bold mb-2">🚗 In Transit</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Vehicle is actively traveling with loaded cargo. System tracks real-time GPS location, fuel consumption, speed, and driver duty hours.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example:</strong> Started 9:15 AM from Mumbai. 2:00 PM: Vehicle at Nashik (175 km), fuel consumed 25 liters (1 per 7 km). System alerts: "Driver Rajesh has 6 hours driving done, 30-min break required". Driver stops at rest area. 3:30 PM: Break completed. Resumes driving. ETA Bangalore remains 6:00 PM next day.
                </p>
              </div>
            </div>

            {/* Delivered */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-green-600' : 'bg-green-100 border-green-800'}`}>
              <h3 className="text-lg font-bold mb-2">✅ Delivered</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Cargo has been successfully delivered and unloaded. Delivery receipt signed by recipient. Trip is complete and ready for invoicing.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example:</strong> Unloading completed 6:15 PM Dec 16. Warehouse manager signs delivery receipt confirming receipt of 500 boxes electronics. Driver uploads receipt photo in app. System marks trip as "Delivered". Automatically: (1) Adds trip to invoice, (2) Calculates freight ₹15,000 + fuel surcharge ₹800 + toll ₹1,200 = ₹17,000, (3) Credits vehicle "Available" status, (4) Updates driver performance metrics (on-time: yes, fuel efficiency: good).
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Best Practices */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">💡 Trip Management Best Practices</h2>
          <ul className={`list-disc list-inside space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li><strong>Plan in Advance:</strong> Create trips 24 hours ahead to allow route optimization and vehicle inspection planning.</li>
            <li><strong>Accurate Weight:</strong> Always verify cargo weight. Overloading violates regulations and increases accident risk.</li>
            <li><strong>Address Verification:</strong> Use GPS to verify pickup/delivery addresses are correct before assigning trip.</li>
            <li><strong>Regular Monitoring:</strong> Check GPS tracking for in-transit trips, especially long-distance routes.</li>
            <li><strong>Immediate Reporting:</strong> If vehicle breaks down or delays beyond 2 hours, immediately reroute cargo to alternative vehicle.</li>
            <li><strong>Documentation:</strong> Always collect signed delivery receipts. Upload them immediately after delivery for invoicing.</li>
            <li><strong>Performance Analysis:</strong> Review trip completion reports weekly to identify patterns and areas for improvement.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
