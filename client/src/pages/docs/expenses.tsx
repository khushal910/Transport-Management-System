import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Expenses() {
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
        
        <h1 className="text-4xl font-bold mb-6">💰 Expense & Cost Management</h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Complete guide to tracking, categorizing, and analyzing fleet operational expenses</p>

        {/* Overview */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Expense Management Overview</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Controlling and optimizing operational costs is critical to fleet profitability. The expense module tracks all costs associated with vehicle operations, provides detailed cost analysis, and helps identify areas for cost reduction. Understanding your cost structure is essential for pricing decisions and profitability analysis.
          </p>
        </div>

        {/* Expense Categories */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Expense Categories & Tracking</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            All fleet expenses are categorized systematically to provide clear visibility into cost breakdowns.
          </p>

          <div className={`space-y-4`}>
            {/* Fuel */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-blue-500' : 'bg-blue-50 border-blue-600'}`}>
              <h3 className="text-lg font-bold mb-2">⛽ Fuel Expenses</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Single largest expense category for most fleets. Tracked automatically through odometer readings and actual refueling records.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example for 20-ton HGV:</strong><br/>
                  Trip: Mumbai to Bangalore (1,500 km)<br/>
                  Fuel consumption: 1 liter per 7 km = 214 liters<br/>
                  Diesel rate: ₹100 per liter = ₹21,400<br/>
                  Monthly (8 trips): ₹171,200/month = ₹2,054,400/year<br/>
                  Typical fleet (10 vehicles): ₹20,544,000/year
                </p>
              </div>
              <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <strong>Optimization:</strong> Route optimization can save 5-10% fuel. Preventive maintenance improves fuel efficiency by 8-12%. Driver training reduces fuel costs by 3-5%.
              </p>
            </div>

            {/* Maintenance */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-orange-500' : 'bg-orange-50 border-orange-600'}`}>
              <h3 className="text-lg font-bold mb-2">🔧 Maintenance & Repair Costs</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Includes preventive maintenance, repairs, spare parts, and service center labor. Tracked by vehicle and cost type for detailed analysis.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example Annual Maintenance Costs:</strong><br/>
                  Oil changes (8 times/year): ₹4,000 x 8 = ₹32,000<br/>
                  Filter replacements (4 times/year): ₹2,000 x 4 = ₹8,000<br/>
                  Tire maintenance/replacement: ₹25,000<br/>
                  Brake service: ₹15,000<br/>
                  Emergency repairs: ₹40,000<br/>
                  Total annual/vehicle: ₹120,000<br/>
                  Fleet (10 vehicles): ₹1,200,000/year
                </p>
              </div>
            </div>

            {/* Driver Expenses */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-green-500' : 'bg-green-50 border-green-600'}`}>
              <h3 className="text-lg font-bold mb-2">👨‍💼 Driver Expenses & Allowances</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Salary components and allowances paid to drivers. Includes basic salary, trip allowance, performance bonus, and per-diem charges.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example Monthly Payment per Driver:</strong><br/>
                  Basic Salary: ₹20,000<br/>
                  Trip Allowance (₹500 per trip, 20 trips/month): ₹10,000<br/>
                  Food &amp; Lodging (₹300/day, 20 working days): ₹6,000<br/>
                  Performance Bonus (if on-time rate &gt;90%): ₹3,000<br/>
                  Total/month: ₹39,000<br/>
                  Annual (12 months): ₹468,000/driver<br/>
                  Fleet (10 drivers): ₹4,680,000/year
                </p>
              </div>
            </div>

            {/* Vehicle Registration & Insurance */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-purple-500' : 'bg-purple-50 border-purple-600'}`}>
              <h3 className="text-lg font-bold mb-2">📋 Registration & Insurance Costs</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Fixed costs for vehicle registration renewals, insurance policies, and compliance certifications. Tracked with expiry dates for renewal alerts.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example Annual Costs per Vehicle:</strong><br/>
                  Vehicle Registration (RC) renewal: ₹1,500/year<br/>
                  Comprehensive Insurance (₹30 lac coverage): ₹28,000/year<br/>
                  Fitness Certificate renewal: ₹500/year<br/>
                  Pollution Certificate: ₹400/year<br/>
                  Third-party Risk Insurance: ₹2,000/year<br/>
                  Total/year: ₹32,400<br/>
                  Fleet (10 vehicles): ₹324,000/year
                </p>
              </div>
            </div>

            {/* Toll & Parking */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-yellow-500' : 'bg-yellow-50 border-yellow-600'}`}>
              <h3 className="text-lg font-bold mb-2">🚧 Toll, Parking & Other Charges</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Trip-specific charges including highway tolls, parking fees, and administrative charges. Captured from trip end reports.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'} mt-2`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  <strong>Example Trip to Bangalore (1,500 km):</strong><br/>
                  Highway tolls (NH): ₹1,200<br/>
                  State border toll (if applicable): ₹400<br/>
                  Parking (pickup/delivery points): ₹300<br/>
                  Total trip charges: ₹1,900<br/>
                  Monthly (8 trips): ₹15,200<br/>
                  Annual: ₹182,400
                </p>
              </div>
            </div>

            {/* Administrative Costs */}
            <div className={`p-4 rounded border-l-4 ${isDark ? 'bg-gray-700 border-red-500' : 'bg-red-50 border-red-600'}`}>
              <h3 className="text-lg font-bold mb-2">📊 Administrative & Other Costs</h3>
              <p className={`mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Office expenses, software subscriptions, permits, GPS tracking service, and miscellaneous charges.
              </p>
              <div className={`p-3 rounded ${isDark ? 'bg-gray-600' : 'bg-blue-50'}`}>
                <p className={`${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  TMS Software subscription: ₹500/vehicle/month = ₹60,000/year<br/>
                  GPS tracking system: ₹300/vehicle/month = ₹36,000/year<br/>
                  Office supplies: ₹25,000/year
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Cost Analysis Dashboard */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">Cost Analysis & Reporting</h2>
          <p className={`mb-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            System provides multiple views to analyze and optimize expenses:
          </p>

          <div className={`space-y-3 mt-4`}>
            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>📈 Cost Per Km</p>
              <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Total monthly cost ÷ total km covered. Benchmark against industry standards and track improvements. Example: ₹80/km indicates high efficiency.
              </p>
            </div>

            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>💹 Profit Per Trip</p>
              <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Revenue per trip minus all trip-related costs (fuel, toll, maintenance allocation, driver). Helps identify unprofitable routes.
              </p>
            </div>

            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>🎯 Budget vs Actual</p>
              <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Compare budgeted expenses against actual spending by category. Identifies overspending areas for management attention.
              </p>
            </div>

            <div>
              <p className={`font-bold ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>📊 Vehicle Comparison</p>
              <p className={`ml-4 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Compare cost performance across vehicles. Identify high-maintenance or inefficient vehicles early.
              </p>
            </div>
          </div>
        </div>

        {/* How to Log Expenses */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">How to Record Expenses</h2>
          <ol className={`list-decimal list-inside space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>Go to <strong>Finance → Expense Management</strong></li>
            <li>Click <strong>"Add Expense"</strong> button</li>
            <li>Select expense category (Fuel, Maintenance, Toll, etc.)</li>
            <li>Select vehicle and associated trip (if applicable)</li>
            <li>Enter expense amount and date</li>
            <li>Add brief description (e.g., "Engine oil and filter change")</li>
            <li>Upload receipt/invoice as attachment</li>
            <li>Click <strong>Submit</strong> to record expense</li>
            <li>Expense automatically added to vehicle and category totals</li>
            <li>Reports updated in real-time</li>
          </ol>
        </div>

        {/* Best Practices */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">💡 Expense Management Best Practices</h2>
          <ul className={`list-disc list-inside space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li><strong>Record All Expenses:</strong> Even small expenses add up. ₹50 x 365 days = ₹18,250/year per vehicle. Ensure nothing is missed.</li>
            <li><strong>Upload Receipts Immediately:</strong> Don't wait until month-end. Capture expense details while fresh to avoid errors and disputes.</li>
            <li><strong>Categorize Correctly:</strong> Proper categorization enables accurate analysis and identification of cost reduction opportunities.</li>
            <li><strong>Monitor Fuel Efficiency:</strong> Sudden increase in fuel costs often indicates mechanical issues, driver behavior problems, or route inefficiency.</li>
            <li><strong>Negotiate with Service Centers:</strong> Use cost data to negotiate bulk discounts. Competition between service centers can reduce maintenance costs 15-20%.</li>
            <li><strong>Preventive Spending:</strong> Spend ₹10,000 on preventive maintenance to avoid ₹50,000 in emergency repairs. Always prioritize prevention.</li>
            <li><strong>Review Monthly:</strong> Check expense reports monthly to identify trends and anomalies. Early action prevents cost spirals.</li>
            <li><strong>Benchmark Performance:</strong> Compare your cost per km against industry averages. Identify areas where you're above average and investigate roots causes.</li>
          </ul>
        </div>

        {/* Cost Reduction Strategies */}
        <div className={`mt-8 p-6 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <h2 className="text-2xl font-bold mb-4">🎯 Strategies for Cost Reduction</h2>
          <ul className={`list-disc list-inside space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            <li><strong>Route Optimization:</strong> Longer routes = more fuel + driver time. System suggests best routes. 5-10% fuel savings common.</li>
            <li><strong>Driver Training:</strong> Trained drivers reduce accidents (↓insurance), improve fuel efficiency (↓5-10%), and reduce vehicle wear (↓maintenance).</li>
            <li><strong>Fleet Right-sizing:</strong> Using appropriate vehicle capacity for loads. Small vehicles for small loads reduce fuel and wear.</li>
            <li><strong>Bulk Purchasing:</strong> Negotiate group rates for fuel, spare parts, and insurance. Combine with competitors or associations for leverage.</li>
            <li><strong>Regular Audits:</strong> Monthly cost audits identify overcharging by service centers or suppliers. Results in 5-8% cost savings.</li>
            <li><strong>GPS Monitoring:</strong> Driver behavior monitoring (speeding, idling) leads to 8-12% fuel savings and 40% accident reduction.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
