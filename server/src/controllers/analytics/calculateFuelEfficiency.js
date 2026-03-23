/**
 * Calculate fuel efficiency metrics for all vehicles
 * @param {Array} fuelLogs - Array of fuel log records
 * @param {Array} vehicles - Array of vehicle records
 * @returns {Array} Fuel efficiency data for each vehicle
 */
const calculateFuelEfficiency = (fuelLogs, vehicles) => {
  const fuelEfficiencyMap = new Map();

  fuelLogs.forEach((log) => {
    if (!fuelEfficiencyMap.has(log.vehicle.toString())) {
      fuelEfficiencyMap.set(log.vehicle.toString(), {
        vehicleId: log.vehicle,
        totalDistance: 0,
        totalFuelCost: 0,
        fuelLogs: [],
      });
    }
    const data = fuelEfficiencyMap.get(log.vehicle.toString());
    data.totalDistance += log.distance || 0;
    data.totalFuelCost += log.fuelCost || 0;
    data.fuelLogs.push(log);
  });

  const fuelEfficiency = Array.from(fuelEfficiencyMap.values()).map((data) => {
    const vehicle = new Map(vehicles.map((v) => [v._id.toString(), v]));
    
    const kmPerLiter =
      data.totalFuelCost > 0
        ? (data.totalDistance / (data.totalFuelCost / 50)) * 100
        : 0;

    return {
      vehicleId: data.vehicleId,
      vehicleName: vehicle?.get(data.vehicleId)?.name || 'Unknown',
      licensePlate: vehicle?.get(data.vehicleId)?.licensePlate,
      totalDistance: data.totalDistance,
      totalFuelCost: data.totalFuelCost,
      kmPerLiter: Math.round(kmPerLiter * 100) / 100,
      efficiency:
        kmPerLiter > 5 ? 'Good' : kmPerLiter > 3 ? 'Average' : 'Poor',
    };
  });

  return fuelEfficiency;
};

export default calculateFuelEfficiency;
