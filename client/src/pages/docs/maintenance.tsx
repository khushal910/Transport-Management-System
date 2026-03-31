import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Maintenance() {
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
        
        <h1 className="text-4xl font-bold mb-6">🔧 Maintenance Management</h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Complete guide to scheduling, tracking, and managing vehicle maintenance</p>

        {/* Overview */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Maintenance Management Overview</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Regular maintenance is critical to fleet reliability, safety, and fuel efficiency. The maintenance module helps you schedule preventive maintenance, track service history, manage costs, and ensure all vehicles meet regulatory compliance standards.
          </p>
        </div>

        {/* Types of Maintenance */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Types of Maintenance</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Different types of maintenance serve different purposes in keeping your fleet operational.
          </p>

          <div className={`space-y-4`}>
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-blue-500' : 'bg-blue-50 border-blue-600'}`}>
              <h3 className="text-lg font-bold mb-2">📅 Preventive Maintenance</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Scheduled maintenance performed at regular intervals to prevent breakdowns. This is the most cost-effective maintenance type.
              </p>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Triggers:</strong> Based on kilometers driven or days elapsed, whichever comes first.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example Schedule for 20-ton HGV:</strong><br/>
                  Every 5,000 km or 1 month: Oil change, filter replacement<br/>
                  Every 10,000 km or 3 months: Oil change, filter, brake inspection<br/>
                  Every 50,000 km or 6 months: Full service - engine, transmission, suspension check<br/>
                  Every 100,000 km or 12 months: Major overhaul - complete inspection of all systems
                </p>
              </div>
              <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Benefits:</strong> Prevents unexpected breakdowns (85% of breakdowns prevented), reduces fuel consumption by 15%, extends vehicle life by 40%.
              </p>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-orange-500' : 'bg-orange-50 border-orange-600'}`}>
              <h3 className="text-lg font-bold mb-2">🚨 Corrective Maintenance</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Repairs needed when equipment fails or malfunctions. Unplanned maintenance is more expensive than preventive maintenance.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example:</strong> Vehicle breaks down on highway. Engine dies. Driver calls roadside assistance. Mechanic diagnoses: Blown head gasket (not caught during preventive maintenance). Repair cost: ₹35,000 and 3-hour downtime. If detected during preventive maintenance: ₹8,000 and 1 hour downtime.
                </p>
              </div>
              <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>How prevented:</strong> System alerts when next preventive maintenance is due. Completed preventive maintenance captures 80% of potential failures early.
              </p>
            </div>

            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-red-500' : 'bg-red-50 border-red-600'}`}>
              <h3 className="text-lg font-bold mb-2">🆘 Emergency Repairs</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Critical repairs needed to get vehicle operational immediately. Often happens on highway or during urgent trips.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example:</strong> Vehicle at Delhi with delivery. Brake failure on highway. Emergency: Tow to nearest service center, brake pads replacement (₹3,500), brake fluid replacement (₹2,000). Total ₹5,500. Delay: 2 hours. Another vehicle needed to cover delivery. System records as emergency repair in vehicle history.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Planning */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Maintenance Planning & Scheduling</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            System automatically creates maintenance alerts based on vehicle data. You schedule and track all maintenance activities.
          </p>

          <div className={`space-y-3 mt-4`}>
            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>⏰ Automatic Alert Generation</p>
              <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                System monitors odometer reading and calculates next maintenance due. When distance/time approaches 80% trigger point, an alert is generated. Example: Vehicle at 48,000 km, next maintenance due at 50,000. Alert sent at 40,000 km: "Schedule maintenance within 2 weeks".
              </p>
            </div>

            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>📊 Maintenance History</p>
              <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Complete record of all services performed: date, mileage, parts replaced, cost, service center, warranty details. Historical data helps identify recurring issues and predict future maintenance needs.
              </p>
            </div>

            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>💰 Cost Tracking</p>
              <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                All maintenance expenses tracked by vehicle and cost category. Monthly/yearly maintenance cost analysis helps optimize service center selection and supplier negotiations.
              </p>
            </div>

            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>📄 Documentation Management</p>
              <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Upload service invoices, warranty certificates, spare parts receipts, and service center contact details. Easy access during audits and insurance claims.
              </p>
            </div>
          </div>
        </div>

        {/* Maintenance Checklist */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Standard Maintenance Checklist</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Common maintenance items that should be checked regularly:
          </p>

          <div className={`space-y-3`}>
            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>🛢️ Engine & Fluids</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Engine oil level and quality (every 5,000 km)</li>
                <li>Oil filter replacement (every 5,000 km)</li>
                <li>Coolant level (every 1,000 km)</li>
                <li>Transmission fluid (every 20,000 km)</li>
                <li>Brake fluid (every 10,000 km)</li>
              </ul>
            </div>

            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>🛻 Brakes & Tires</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Brake pad wear (every 10,000 km)</li>
                <li>Brake disc thickness (every 20,000 km)</li>
                <li>Tire condition and pressure (every 1,000 km)</li>
                <li>Tire tread depth (minimum 1.6 mm by law)</li>
                <li>Brake hose inspection (every 50,000 km)</li>
              </ul>
            </div>

            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>⚡ Electrical & Lights</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Headlights and taillights function (every trip)</li>
                <li>Indicators and hazard lights (every trip)</li>
                <li>Battery condition and terminal corrosion (every 10,000 km)</li>
                <li>Wiper blades and fluid (every 5,000 km)</li>
                <li>Horn functionality (every trip)</li>
              </ul>
            </div>

            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>🔗 Suspension & Steering</p>
              <ul className={`list-disc list-inside space-y-1 ml-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <li>Steering smoothness (every trip)</li>
                <li>Suspension springs and shock absorbers (every 30,000 km)</li>
                <li>Wheel alignment (if pulling to one side)</li>
                <li>Axle and bearing condition (every 50,000 km)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How to Schedule Maintenance */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">How to Schedule Maintenance</h2>
          <ol className={`list-decimal list-inside space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>Go to <strong>Fleet → Maintenance</strong></li>
            <li>Click <strong>"Schedule Maintenance"</strong> button</li>
            <li>Select vehicle from dropdown (filters available vehicles)</li>
            <li>Select maintenance type (Preventive, Corrective, Emergency)</li>
            <li>Enter description of work needed</li>
            <li>Choose preferred service center from list</li>
            <li>Select preferred date and time for maintenance</li>
            <li>Click <strong>Submit</strong> to schedule</li>
            <li>System sends confirmation to service center</li>
            <li>Vehicle status automatically changed to "Maintenance"</li>
            <li>Upon completion, upload service invoice and update odometer reading</li>
          </ol>
        </div>

        {/* Best Practices */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">💡 Maintenance Best Practices</h2>
          <ul className={`list-disc list-inside space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li><strong>Follow Schedule Religiously:</strong> Skipping maintenance costs 5-10x more in repairs. Budget maintenance expenses; don't skip them.</li>
            <li><strong>Use Authorized Service Centers:</strong> Improves warranty coverage and ensures quality work. Store contact details and preferred rates in system.</li>
            <li><strong>Keep Records Complete:</strong> All service invoices, spare parts receipts, and warranty documents should be uploaded to system for audit trails.</li>
            <li><strong>Monitor Fuel Efficiency:</strong> Sudden increase in fuel consumption often indicates maintenance issues (worn filters, misalignment, engine problems).</li>
            <li><strong>Driver Inspections:</strong> Train drivers to perform daily visual checks (lights, tire condition, fluid leaks) and report issues immediately.</li>
            <li><strong>Plan Around Trip Schedule:</strong> Schedule preventive maintenance during low-demand periods to minimize revenue loss from vehicle downtime.</li>
            <li><strong>Compare Service Centers:</strong> Track costs and quality scores from different centers. Negotiate bulk service discounts for annual contracts.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
