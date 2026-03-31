// @ts-nocheck
/**
 * Calculate fleet-wide KPI metrics
 * @param {Array} trips - Array of completed trip records
 * @param {Array} fuelLogs - Array of fuel log records
 * @param {Array} maintenanceLogs - Array of maintenance log records
 * @param {Array} vehicles - Array of vehicle records
 * @param {Array} utilizationRate - Utilization rate data for all vehicles
 * @param {Array} deadStock - Dead stock vehicle data
 * @returns {Object} Fleet KPI metrics
 */
const calculateFleetKPIs = (
  trips,
  fuelLogs,
  maintenanceLogs,
  vehicles,
  utilizationRate,
  deadStock
) => {
  const totalRevenue = trips.reduce((sum, t) => sum + (t.revenue || 0), 0);
  const totalFuelCost = fuelLogs.reduce(
    (sum, f) => sum + (f.fuelCost || 0),
    0
  );
  const totalMaintenanceCost = maintenanceLogs.reduce(
    (sum, m) => sum + (m.cost || 0),
    0
  );
  const totalExpense = totalFuelCost + totalMaintenanceCost;
  const totalNetProfit = totalRevenue - totalExpense;
  const fleetROI =
    totalExpense > 0
      ? (((totalRevenue - totalExpense) / totalExpense) * 100).toFixed(2)
      : 0;
  const avgUtilization =
    utilizationRate.length > 0
      ? Math.round(
          utilizationRate.reduce((sum, v) => sum + v.utilizationPercent, 0) /
            utilizationRate.length
        )
      : 0;

  return {
    totalTrips: trips.length,
    totalRevenue,
    totalFuelCost,
    totalMaintenanceCost,
    totalExpense,
    totalNetProfit,
    fleetROI: parseFloat(fleetROI),
    averageUtilization: avgUtilization,
    activeVehicles: vehicles.filter((v) => v.status !== 'retired').length,
    totalVehicles: vehicles.length,
    deadStockVehicles: deadStock.length,
  };
};

export default calculateFleetKPIs;

