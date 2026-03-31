// @ts-nocheck
/**
 * Get dead stock (idle/unused) vehicles
 * @param {Array} utilizationRate - Utilization rate data for all vehicles
 * @returns {Array} Dead stock vehicles (those with zero trips)
 */
const getDeadStock = (utilizationRate) => {
  const deadStock = utilizationRate.filter((v) => v.isDeadStock);
  return deadStock;
};

export default getDeadStock;

