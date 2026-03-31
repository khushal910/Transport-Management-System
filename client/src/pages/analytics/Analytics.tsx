import { useEffect, useState } from "react";
import { useNotification } from '../../hooks/useNotification';
import analyticsBaseURL from "../../api/analyticsBaseURL";
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
  const { notifyError, notifySuccess } = useNotification();
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
        notifyError(response.data?.message || "Failed to fetch analytics");
      }
    } catch (error) {
      notifyError(error.response?.data?.message || "Error fetching analytics");
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

      notifySuccess("Excel file exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      notifyError("Failed to export Excel file");
    }
  };

  const exportToPDF = () => {
    const element = document.getElementById("analytics-report");
    const opt = {
      margin: 10,
      filename: `Analytics_Report_${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "landscape", unit: "mm", format: "a4" },
    };
    html2pdf().set(opt).from(element).save();
    notifySuccess("PDF exported successfully");
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
        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange({ startDate: e.target.value, endDate: dateRange.endDate })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange({ startDate: dateRange.startDate, endDate: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
          <button
            onClick={fetchAnalytics}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
          >
            Apply Filter
          </button>
        </div>
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
      <div id="analytics-report" style={{ backgroundColor: "#ffffff", padding: "24px" }}>
        {/* Fleet Flow KPIs */}
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", marginBottom: "16px" }}>Fleet Flow</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "16px" }}>
            {/* Total Fuel Cost */}
            <div style={{ background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)", border: "2px solid #3b82f6", borderRadius: "8px", padding: "24px" }}>
              <p style={{ color: "#374151", fontWeight: "600", fontSize: "14px", marginBottom: "8px" }}>Total Fuel Cost</p>
              <p style={{ fontSize: "30px", fontWeight: "bold", color: "#1e3a8a" }}>
                ₹{kpiData.totalFuelCost.toFixed(1)}
              </p>
            </div>

            {/* Fleet ROI */}
            <div style={{ background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)", border: "2px solid #22c55e", borderRadius: "8px", padding: "24px" }}>
              <p style={{ color: "#374151", fontWeight: "600", fontSize: "14px", marginBottom: "8px" }}>Fleet ROI</p>
              <p style={{ fontSize: "30px", fontWeight: "bold", color: "#166534" }}>
                {kpiData.fleetROI > 0 ? "+" : ""}{kpiData.fleetROI.toFixed(2)}%
              </p>
            </div>

            {/* Utilization Rate */}
            <div style={{ background: "linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)", border: "2px solid #f59e0b", borderRadius: "8px", padding: "24px" }}>
              <p style={{ color: "#374151", fontWeight: "600", fontSize: "14px", marginBottom: "8px" }}>Utilization Rate</p>
              <p style={{ fontSize: "30px", fontWeight: "bold", color: "#92400e" }}>{kpiData.averageUtilization}%</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "24px", marginBottom: "32px" }}>
          {/* Fuel Efficiency Trend */}
          <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "24px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#111827", marginBottom: "16px" }}>Fuel Efficiency Trend (KM/L)</h3>
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
              <div style={{ height: "256px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                <p>No fuel efficiency data available for selected period</p>
              </div>
            )}
          </div>

          {/* Top 5 Costliest Vehicles */}
          <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "24px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#111827", marginBottom: "16px" }}>Top 5 Costliest Vehicles</h3>
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
              <div style={{ height: "256px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
                <p>No vehicle expense data available for selected period</p>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Financial Trend */}
        <div style={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "24px", marginBottom: "32px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#111827", marginBottom: "16px" }}>Monthly Financial Trend</h3>
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
            <div style={{ height: "256px", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af" }}>
              <p>No monthly financial data available for selected period</p>
            </div>
          )}
        </div>

        {/* Financial Summary Table */}
        <div style={{ marginBottom: "32px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#111827", marginBottom: "16px" }}>Financial Summary of Year</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#dbeafe", border: "2px solid #3b82f6" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "14px", fontWeight: "bold", color: "#1f2937" }}>Month</th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "14px", fontWeight: "bold", color: "#1f2937" }}>Revenue</th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "14px", fontWeight: "bold", color: "#1f2937" }}>Fuel Cost</th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "14px", fontWeight: "bold", color: "#1f2937" }}>Maintenance</th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "14px", fontWeight: "bold", color: "#1f2937" }}>Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {analyticsData.monthlyFinancial.map((month, index) => (
                  <tr
                    key={index}
                    style={{
                      borderBottom: "1px solid #d1d5db",
                      backgroundColor: index % 2 === 0 ? "#f9fafb" : "#ffffff",
                    }}
                  >
                    <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: "500", color: "#111827" }}>{month.month}</td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", textAlign: "right", fontWeight: "600", color: "#059669" }}>
                      ₹{month.revenue.toFixed(2)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", textAlign: "right", fontWeight: "600", color: "#dc2626" }}>
                      ₹{month.fuelCost.toFixed(2)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", textAlign: "right", fontWeight: "600", color: "#b45309" }}>
                      ₹{month.maintenanceCost.toFixed(2)}
                    </td>
                    <td style={{ padding: "12px 16px", fontSize: "14px", textAlign: "right", fontWeight: "bold", color: "#1e40af" }}>
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
          <div style={{ backgroundColor: "#fef2f2", borderLeft: "4px solid #f87171", borderRadius: "8px", padding: "24px", marginBottom: "32px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#7f1d1d", marginBottom: "12px" }}>Dead Stock Alerts</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "16px" }}>
              {analyticsData.deadStock.map((vehicle) => (
                <div key={vehicle.vehicleId} style={{ backgroundColor: "#ffffff", borderRadius: "8px", padding: "16px", border: "1px solid #fecaca" }}>
                  <p style={{ fontWeight: "600", color: "#111827" }}>{vehicle.vehicleName}</p>
                  <p style={{ fontSize: "14px", color: "#4b5563", marginTop: "4px" }}>{vehicle.licensePlate}</p>
                  <p style={{ fontSize: "12px", color: "#dc2626", marginTop: "8px" }}>No trips in selected period</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Additional KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
          <div style={{ backgroundColor: "#eff6ff", borderRadius: "8px", padding: "16px", border: "1px solid #bfdbfe" }}>
            <p style={{ color: "#374151", fontSize: "12px", fontWeight: "600" }}>Total Trips</p>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: "#1e3a8a", marginTop: "8px" }}>{kpiData.totalTrips}</p>
          </div>
          <div style={{ backgroundColor: "#f0fdf4", borderRadius: "8px", padding: "16px", border: "1px solid #bbf7d0" }}>
            <p style={{ color: "#374151", fontSize: "12px", fontWeight: "600" }}>Total Revenue</p>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: "#166534", marginTop: "8px" }}>
              ₹{(kpiData.totalRevenue / 100000).toFixed(2)}L
            </p>
          </div>
          <div style={{ backgroundColor: "#faf5ff", borderRadius: "8px", padding: "16px", border: "1px solid #e9d5ff" }}>
            <p style={{ color: "#374151", fontSize: "12px", fontWeight: "600" }}>Net Profit</p>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: "#6b21a8", marginTop: "8px" }}>
              ₹{(kpiData.totalNetProfit / 100000).toFixed(2)}L
            </p>
          </div>
          <div style={{ backgroundColor: "#fffbeb", borderRadius: "8px", padding: "16px", border: "1px solid #fef3c7" }}>
            <p style={{ color: "#374151", fontSize: "12px", fontWeight: "600" }}>Active Vehicles</p>
            <p style={{ fontSize: "24px", fontWeight: "bold", color: "#92400e", marginTop: "8px" }}>
              {kpiData.activeVehicles}/{kpiData.totalVehicles}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;

