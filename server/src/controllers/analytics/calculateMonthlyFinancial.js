/**
 * Calculate monthly financial summary data
 * @param {Array} trips - Array of completed trip records
 * @param {Array} fuelLogs - Array of fuel log records
 * @param {Array} maintenanceLogs - Array of maintenance log records
 * @returns {Array} Monthly financial data sorted by month
 */
const calculateMonthlyFinancial = (trips, fuelLogs, maintenanceLogs) => {
  const monthlyData = new Map();

  // Aggregate trip revenue by month
  trips.forEach((trip) => {
    const date = new Date(trip.createdAt);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;

    if (!monthlyData.has(monthKey)) {
      monthlyData.set(monthKey, {
        month: monthKey,
        revenue: 0,
        fuelCost: 0,
        maintenanceCost: 0,
        netProfit: 0,
      });
    }

    monthlyData.get(monthKey).revenue += trip.revenue || 0;
  });

  // Aggregate fuel costs by month
  fuelLogs.forEach((log) => {
    const date = new Date(log.date);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;

    if (monthlyData.has(monthKey)) {
      monthlyData.get(monthKey).fuelCost += log.fuelCost || 0;
    }
  });

  // Aggregate maintenance costs by month
  maintenanceLogs.forEach((log) => {
    const date = new Date(log.serviceDate);
    const monthKey = `${date.getFullYear()}-${String(
      date.getMonth() + 1
    ).padStart(2, '0')}`;

    if (monthlyData.has(monthKey)) {
      monthlyData.get(monthKey).maintenanceCost += log.cost || 0;
    }
  });

  // Calculate net profit and sort by month
  const monthlyFinancial = Array.from(monthlyData.values())
    .map((data) => ({
      ...data,
      netProfit: data.revenue - data.fuelCost - data.maintenanceCost,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return monthlyFinancial;
};

export default calculateMonthlyFinancial;
