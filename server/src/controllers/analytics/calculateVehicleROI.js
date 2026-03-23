/**
 * Calculate vehicle ROI (Return on Investment) metrics
 * @param {Array} trips - Array of completed trip records
 * @param {Array} fuelLogs - Array of fuel log records
 * @param {Array} maintenanceLogs - Array of maintenance log records
 * @returns {Array} ROI data for each vehicle
 */
const calculateVehicleROI = (trips, fuelLogs, maintenanceLogs) => {
  const roiMap = new Map();

  // Calculate revenue per vehicle from trips
  trips.forEach((trip) => {
    const vehicleId = trip.vehicle._id.toString();
    if (!roiMap.has(vehicleId)) {
      roiMap.set(vehicleId, {
        vehicleId: trip.vehicle._id,
        vehicleName: trip.vehicle.name,
        licensePlate: trip.vehicle.licensePlate,
        revenue: 0,
        fuelCost: 0,
        maintenanceCost: 0,
        trips: 0,
      });
    }
    const data = roiMap.get(vehicleId);
    data.revenue += trip.revenue || 0;
    data.trips += 1;
  });

  // Add fuel costs
  fuelLogs.forEach((log) => {
    const vehicleId = log.vehicle.toString();
    if (roiMap.has(vehicleId)) {
      roiMap.get(vehicleId).fuelCost += log.fuelCost || 0;
    }
  });

  // Add maintenance costs
  maintenanceLogs.forEach((log) => {
    const vehicleId = log.vehicle.toString();
    if (roiMap.has(vehicleId)) {
      roiMap.get(vehicleId).maintenanceCost += log.cost || 0;
    }
  });

  // Calculate final ROI metrics
  const vehicleROI = Array.from(roiMap.values()).map((data) => {
    const totalExpense = data.fuelCost + data.maintenanceCost;
    const roi = data.revenue - totalExpense;
    const roiPercentage =
      totalExpense > 0 ? ((roi / totalExpense) * 100).toFixed(2) : 0;

    return {
      vehicleId: data.vehicleId,
      vehicleName: data.vehicleName,
      licensePlate: data.licensePlate,
      revenue: data.revenue,
      fuelCost: data.fuelCost,
      maintenanceCost: data.maintenanceCost,
      totalExpense,
      netProfit: roi,
      roiPercentage: parseFloat(roiPercentage),
      trips: data.trips,
    };
  });

  return vehicleROI;
};

export default calculateVehicleROI;
