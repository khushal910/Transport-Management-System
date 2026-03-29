import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import analyticsBaseURL from "../../api/analyticsBaseURL";
import DateRangePicker from "../../components/DateRangePicker";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import html2pdf from "html2pdf.js";
import ExcelJS from "exceljs";

const Analytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        metricsType: "all",
      };

      const response = await analyticsBaseURL.get("/dashboard", { params });

      if (response.data?.success) {
        setAnalyticsData(response.data?.data);
      } else {
        toast.error(response.data?.message || "Failed to fetch analytics");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Error fetching analytics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const handleDateRangeChange = (dates) => {
    setDateRange({
      startDate: dates.startDate,
      endDate: dates.endDate,
    });
  };

  const exportToExcel = async () => {
    if (!analyticsData) return;

    try {
      const workbook = new ExcelJS.Workbook();

      // Fleet KPIs Sheet
      const kpiSheet = workbook.addWorksheet("Fleet KPIs");
      const kpiData = analyticsData.fleetKPIs;
      
      kpiSheet.columns = [
        { header: "Metric", key: "metric", width: 25 },
        { header: "Value", key: "value", width: 20 },
      ];

      const kpiEntries = [
        { metric: "Total Trips", value: kpiData.totalTrips },
        { metric: "Total Revenue", value: `₹${kpiData.totalRevenue.toFixed(2)}` },
        { metric: "Total Fuel Cost", value: `₹${kpiData.totalFuelCost.toFixed(2)}` },
        { metric: "Total Maintenance", value: `₹${kpiData.totalMaintenanceCost.toFixed(2)}` },
        { metric: "Total Expense", value: `₹${kpiData.totalExpense.toFixed(2)}` },
        { metric: "Net Profit", value: `₹${kpiData.totalNetProfit.toFixed(2)}` },
        { metric: "Fleet ROI", value: `${kpiData.fleetROI}%` },
        { metric: "Avg Utilization", value: `${kpiData.averageUtilization}%` },
        { metric: "Active Vehicles", value: `${kpiData.activeVehicles}/${kpiData.totalVehicles}` },
      ];

      kpiSheet.addRows(kpiEntries);
      kpiSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      kpiSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };

      // Monthly Summary Sheet
      const monthlySheet = workbook.addWorksheet("Monthly Summary");
      monthlySheet.columns = [
        { header: "Month", key: "month", width: 12 },
        { header: "Revenue", key: "revenue", width: 15 },
        { header: "Fuel Cost", key: "fuelCost", width: 15 },
        { header: "Maintenance", key: "maintenanceCost", width: 15 },
        { header: "Net Profit", key: "netProfit", width: 15 },
      ];

      const monthlyData = analyticsData.monthlyFinancial.map((m) => ({
        month: m.month,
        revenue: `₹${m.revenue.toFixed(2)}`,
        fuelCost: `₹${m.fuelCost.toFixed(2)}`,
        maintenanceCost: `₹${m.maintenanceCost.toFixed(2)}`,
        netProfit: `₹${m.netProfit.toFixed(2)}`,
      }));

      monthlySheet.addRows(monthlyData);
      monthlySheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      monthlySheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF70AD47" } };

      // Vehicle ROI Sheet
      const roiSheet = workbook.addWorksheet("Vehicle ROI");
      roiSheet.columns = [
        { header: "Vehicle Name", key: "vehicleName", width: 20 },
        { header: "License Plate", key: "licensePlate", width: 12 },
        { header: "Revenue", key: "revenue", width: 12 },
        { header: "Fuel Cost", key: "fuelCost", width: 12 },
        { header: "Maintenance", key: "maintenanceCost", width: 12 },
        { header: "Net Profit", key: "netProfit", width: 12 },
        { header: "ROI %", key: "roiPercentage", width: 10 },
        { header: "Trips", key: "trips", width: 8 },
      ];

      const roiData = analyticsData.vehicleROI.map((v) => ({
        vehicleName: v.vehicleName,
        licensePlate: v.licensePlate,
        revenue: `₹${v.revenue.toFixed(2)}`,
        fuelCost: `₹${v.fuelCost.toFixed(2)}`,
        maintenanceCost: `₹${v.maintenanceCost.toFixed(2)}`,
        netProfit: `₹${v.netProfit.toFixed(2)}`,
        roiPercentage: `${v.roiPercentage}%`,
        trips: v.trips,
      }));

      roiSheet.addRows(roiData);
      roiSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      roiSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF4472C4" } };

      // Fuel Efficiency Sheet
      const fuelSheet = workbook.addWorksheet("Fuel Efficiency");
      fuelSheet.columns = [
        { header: "Vehicle Name", key: "vehicleName", width: 20 },
        { header: "License Plate", key: "licensePlate", width: 12 },
        { header: "Total Distance", key: "totalDistance", width: 15 },
        { header: "Fuel Cost", key: "totalFuelCost", width: 12 },
        { header: "KM/Liter", key: "kmPerLiter", width: 12 },
        { header: "Efficiency", key: "efficiency", width: 12 },
      ];

      const fuelData = analyticsData.fuelEfficiency.map((f) => ({
        vehicleName: f.vehicleName,
        licensePlate: f.licensePlate,
        totalDistance: `${f.totalDistance.toFixed(2)} km`,
        totalFuelCost: `₹${f.totalFuelCost.toFixed(2)}`,
        kmPerLiter: f.kmPerLiter,
        efficiency: f.efficiency,
      }));

      fuelSheet.addRows(fuelData);
      fuelSheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
      fuelSheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFC65911" } };

      // Generate file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Analytics_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast.success("Excel file exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export Excel file");
    }
  };

  const exportToPDF = () => {
    const element = document.getElementById("analytics-report");
    console.log(element);
    const opt = {
      margin: 10,
      filename: `Analytics_Report_${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "landscape", unit: "mm", format: "a4" },
    };
    html2pdf().set(opt).from(element).save();
    toast.success("PDF exported successfully");
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow flex justify-center items-center py-12">
        <div className="text-gray-500 flex items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          Loading analytics...
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No analytics data available</p>
          <p className="text-gray-400 text-sm mt-1">
            Create some trips and expenses to see analytics
          </p>
        </div>
      </div>
    );
  }

  const kpiData = analyticsData.fleetKPIs;

  // Prepare chart data
  const fuelEfficiencyChartData = analyticsData.fuelEfficiency.slice(0, 12).map((f) => ({
    name: f.vehicleName,
    kmPerLiter: f.kmPerLiter,
  }));

  const topCostliestChartData = analyticsData.topCostliestVehicles.map((v) => ({
    name: v.vehicleName,
    totalExpense: v.totalExpense,
  }));

  const monthlyChartData = analyticsData.monthlyFinancial.map((m) => ({
    month: m.month,
    Revenue: m.revenue,
    FuelCost: m.fuelCost,
    Maintenance: m.maintenanceCost,
  }));

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
        <p className="text-gray-600">
          Fleet-wide insights and performance metrics
        </p>
      </div>

      {/* Date Range Filter - Not included in PDF */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Select Date Range</h3>
        <DateRangePicker
          startDate={dateRange.startDate}
          endDate={dateRange.endDate}
          onDateChange={handleDateRangeChange}
          onApply={fetchAnalytics}
        />
      </div>

      {/* Export Buttons - Not included in PDF */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={exportToExcel}
          className="bg-green-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
        >
          📊 Export to Excel
        </button>
        <button
          onClick={exportToPDF}
          className="bg-red-600 cursor-pointer text-white px-4 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-2"
        >
          📄 Export to PDF
        </button>
      </div>

      {/* Analytics Report - PDF Export Content */}
      <div id="analytics-report">
        {/* Fleet Flow KPIs */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Fleet Flow</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Total Fuel Cost */}
            <div className="bg-linear-to-br from-blue-50 to-blue-100 border-2 border-blue-400 rounded-lg p-6">
              <p className="text-gray-700 font-semibold text-sm mb-2">Total Fuel Cost</p>
              <p className="text-3xl font-bold text-blue-800">
                ₹{kpiData.totalFuelCost.toFixed(1)}
              </p>
            </div>

            {/* Fleet ROI */}
            <div className="bg-linear-to-br from-green-50 to-green-100 border-2 border-green-400 rounded-lg p-6">
              <p className="text-gray-700 font-semibold text-sm mb-2">Fleet ROI</p>
              <p className="text-3xl font-bold text-green-800">
                {kpiData.fleetROI > 0 ? "+" : ""}{kpiData.fleetROI.toFixed(2)}%
              </p>
            </div>

            {/* Utilization Rate */}
            <div className="bg-linear-to-br from-amber-50 to-amber-100 border-2 border-amber-400 rounded-lg p-6">
              <p className="text-gray-700 font-semibold text-sm mb-2">Utilization Rate</p>
              <p className="text-3xl font-bold text-amber-800">{kpiData.averageUtilization}%</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Fuel Efficiency Trend */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Fuel Efficiency Trend (KM/L)</h3>
            {analyticsData.fuelEfficiency && analyticsData.fuelEfficiency.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={fuelEfficiencyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="kmPerLiter"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: "#3b82f6", r: 4 }}
                    name="KM/Liter"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No fuel efficiency data available for selected period</p>
              </div>
            )}
          </div>

          {/* Top 5 Costliest Vehicles */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Top 5 Costliest Vehicles</h3>
            {analyticsData.topCostliestVehicles && analyticsData.topCostliestVehicles.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCostliestChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="totalExpense" fill="#ef4444" name="Total Expense (₹)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No vehicle expense data available for selected period</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Financial Trend */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Monthly Financial Trend</h3>
          {analyticsData.monthlyFinancial && analyticsData.monthlyFinancial.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: "#10b981", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="FuelCost"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ fill: "#ef4444", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="Maintenance"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={{ fill: "#f59e0b", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No monthly financial data available for selected period</p>
            </div>
          )}
        </div>

        {/* Financial Summary Table */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial Summary of Year</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-100 border-b-2 border-blue-400">
                  <th className="px-4 py-3 text-left text-sm font-bold text-gray-800">Month</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-800">Revenue</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-800">Fuel Cost</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-800">Maintenance</th>
                  <th className="px-4 py-3 text-right text-sm font-bold text-gray-800">Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.monthlyFinancial.map((month, index) => (
                  <tr
                    key={index}
                    className={`border-b border-gray-300 ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-gray-100 transition`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{month.month}</td>
                    <td className="px-4 py-3 text-sm text-right text-green-700 font-semibold">
                      ₹{month.revenue.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-red-700 font-semibold">
                      ₹{month.fuelCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right text-orange-700 font-semibold">
                      ₹{month.maintenanceCost.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-bold text-blue-800">
                      ₹{month.netProfit.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dead Stock Alerts */}
        {analyticsData.deadStock.length > 0 && (
          <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-bold text-red-900 mb-3">Dead Stock Alerts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {analyticsData.deadStock.map((vehicle) => (
                <div key={vehicle.vehicleId} className="bg-white rounded p-4 border border-red-200">
                  <p className="font-semibold text-gray-900">{vehicle.vehicleName}</p>
                  <p className="text-sm text-gray-600">{vehicle.licensePlate}</p>
                  <p className="text-xs text-red-600 mt-2">No trips in selected period</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-gray-600 text-xs font-semibold">Total Trips</p>
            <p className="text-2xl font-bold text-blue-900 mt-1">{kpiData.totalTrips}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-gray-600 text-xs font-semibold">Total Revenue</p>
            <p className="text-2xl font-bold text-green-900 mt-1">
              ₹{(kpiData.totalRevenue / 100000).toFixed(2)}L
            </p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <p className="text-gray-600 text-xs font-semibold">Net Profit</p>
            <p className="text-2xl font-bold text-purple-900 mt-1">
              ₹{(kpiData.totalNetProfit / 100000).toFixed(2)}L
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-gray-600 text-xs font-semibold">Active Vehicles</p>
            <p className="text-2xl font-bold text-orange-900 mt-1">
              {kpiData.activeVehicles}/{kpiData.totalVehicles}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
