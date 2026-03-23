/**
 * Get top costliest vehicles by maintenance and fuel expenses
 * @param {Array} vehicleROI - Vehicle ROI data
 * @param {number} limit - Number of top vehicles to return (default: 5)
 * @returns {Array} Top costliest vehicles
 */
const getTopCostliestVehicles = (vehicleROI, limit = 5) => {
  // Handle empty or null data
  if (!vehicleROI || vehicleROI.length === 0) {
    return [];
  }

  const topCostliest = vehicleROI
    .sort((a, b) => b.totalExpense - a.totalExpense)
    .slice(0, limit);

  return topCostliest;
};

export default getTopCostliestVehicles;
