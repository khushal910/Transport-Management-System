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
import { PageContainer, PageHeader } from "../../components/ui";

interface FleetKPI {
  totalTrips: number;
  totalRevenue: number;
  totalFuelCost: number;
  totalMaintenanceCost: number;
  totalExpense: number;
  totalNetProfit: number;
  fleetROI: number;
  averageUtilization: number;
  activeVehicles: number;
  totalVehicles: number;
}

interface MonthlyFinancial {
  month: string;
  revenue: number;
  fuelCost: number;
  maintenanceCost: number;
  netProfit: number;
}

interface VehicleROI {
  vehicleName: string;
  licensePlate: string;
  revenue: number;
  fuelCost: number;
  maintenanceCost: number;
  netProfit: number;
  roiPercentage: number;
  trips: number;
}

interface FuelEfficiency {
  vehicleName: string;
  licensePlate: string;
  totalDistance: number;
  totalFuelCost: number;
  kmPerLiter: number;
  efficiency: string;
}

interface DeadStock {
  vehicleId: string;
  vehicleName: string;
  licensePlate: string;
  status: string;
}

interface TopCostliestVehicle {
  vehicleName: string;
  licensePlate: string;
  totalCost: number;
  totalExpense: number;
}

interface AnalyticsData {
  fleetKPIs: FleetKPI;
  monthlyFinancial: MonthlyFinancial[];
  vehicleROI: VehicleROI[];
  fuelEfficiency: FuelEfficiency[];
  deadStock: DeadStock[];
  topCostliestVehicles: TopCostliestVehicle[];
}

interface DateRange {
  startDate: string;
  endDate: string;
}

const Analytics = () => {
  const { notifyError, notifySuccess } = useNotification();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
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
    } catch (error: unknown) {
      const axiosError = error as any;
      notifyError(axiosError?.response?.data?.message || "Error fetching analytics");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const handleDateRangeChange = (dates: DateRange) => {
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
    if (!element) {
      notifyError("Analytics report element not found");
      return;
    }
    
    const opt: any = {
      margin: 10,
      filename: `Analytics_Report_${new Date().toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg" as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "landscape", unit: "mm", format: "a4" },
    };
    html2pdf().set(opt).from(element).save();
    notifySuccess("PDF exported successfully");
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="app-panel flex items-center justify-center py-14">
          <div className="flex items-center gap-2 text-slate-500">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-600"></div>
            Loading analytics...
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!analyticsData) {
    return (
      <PageContainer>
        <div className="app-panel">
          <div className="py-12 text-center">
            <p className="text-lg text-slate-500">No analytics data available</p>
            <p className="mt-1 text-sm text-slate-400">
              Create some trips and expenses to see analytics
            </p>
          </div>
        </div>
      </PageContainer>
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
    <PageContainer>
      <PageHeader
        title="Analytics Dashboard"
        description="Fleet-wide insights and performance metrics"
        eyebrow="Performance"
      />

      <div className="app-panel p-6">

      {/* Header */}
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Export & Reporting</p>
      </div>

      {/* Date Range Filter - Not included in PDF */}
      <div className="mb-8">
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Select Date Range</h3>
        <div className="flex gap-4 items-end flex-wrap">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => handleDateRangeChange({ startDate: e.target.value, endDate: dateRange.endDate })}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/35"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => handleDateRangeChange({ startDate: dateRange.startDate, endDate: e.target.value })}
              className="rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/35"
            />
          </div>
          <button
            onClick={fetchAnalytics}
            className="rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 px-6 py-2 font-semibold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            Apply Filter
          </button>
        </div>
      </div>

      {/* Export Buttons - Not included in PDF */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={exportToExcel}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 font-semibold text-white transition-colors duration-200 hover:bg-emerald-700"
        >
          📊 Export to Excel
        </button>
        <button
          onClick={exportToPDF}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 font-semibold text-white transition-colors duration-200 hover:bg-rose-700"
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
                  <Tooltip formatter={(value: any) => `₹${(value || 0).toLocaleString()}`} />
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
                <Tooltip formatter={(value: any) => `₹${(value || 0).toLocaleString()}`} />
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
    </PageContainer>
  );
};

export default Analytics;

