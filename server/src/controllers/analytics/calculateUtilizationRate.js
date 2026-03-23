/**
 * Calculate vehicle utilization rate metrics
 * @param {Array} trips - Array of completed trip records
 * @param {Array} vehicles - Array of vehicle records
 * @returns {Array} Utilization rate data for each vehicle
 */
const calculateUtilizationRate = (trips, vehicles) => {
  const utilizationMap = new Map();

  vehicles.forEach((vehicle) => {
    const vehicleId = vehicle._id.toString();
    const vehicleTrips = trips.filter(
      (t) => t.vehicle && t.vehicle._id.toString() === vehicleId
    );

    utilizationMap.set(vehicleId, {
      vehicleId: vehicle._id,
      vehicleName: vehicle.name,
      licensePlate: vehicle.licensePlate,
      totalTrips: vehicleTrips.length,
      averageDistance:
        vehicleTrips.length > 0
          ? vehicleTrips.reduce(
              (sum, t) => sum + (t.endOdometer - t.startOdometer || 0),
              0
            ) / vehicleTrips.length
          : 0,
      status: vehicle.status,
    });
  });

  const utilizationRate = Array.from(utilizationMap.values()).map((data) => {
    const utilizationPercent =
      data.totalTrips > 0 ? Math.min((data.totalTrips / 30) * 100, 100) : 0;

    return {
      ...data,
      utilizationPercent: Math.round(utilizationPercent),
      isDeadStock: data.totalTrips === 0,
    };
  });

  return utilizationRate;
};

export default calculateUtilizationRate;
