/**
 * Ramer-Douglas-Peucker Algorithm for Polyline Simplification
 * Reduces the number of points in a polyline while maintaining its shape
 * This helps display cleaner paths without overlapping GPS noise
 */

export interface LatLng {
  latitude: number;
  longitude: number;
  [key: string]: any; // Allow additional properties like speed, timestamp
}

/**
 * AGGRESSIVE: Simple distance-based filtering - fastest and most effective
 * Removes points that are too close together
 * @param points - Array of GPS points
 * @param minDistanceKM - Minimum distance between points in kilometers (default 0.1 km = 100 meters)
 * @returns Filtered points
 */
export function aggressiveDistanceFilter(
  points: any[],
  minDistanceKM: number = 0.1
): LatLng[] {
  if (!points || points.length < 2) return points || [];

  const filtered: LatLng[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const lastPoint = filtered[filtered.length - 1];
    const distance = calculateDistance(
      lastPoint.latitude,
      lastPoint.longitude,
      points[i].latitude,
      points[i].longitude
    );

    // Only add point if it's far enough from the last kept point
    if (distance >= minDistanceKM) {
      filtered.push(points[i]);
    }
  }

  return filtered;
}

/**
 * Calculate distance between two GPS coordinates in kilometers
 * Using Haversine formula
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Filter by accuracy - removes points with poor GPS accuracy
 * @param points - Array of GPS points with accuracy property
 * @param maxAccuracy - Maximum acceptable accuracy in meters (default 300m - very lenient)
 * @returns Filtered points
 */
export function filterByAccuracy(
  points: any[],
  maxAccuracy: number = 300
): LatLng[] {
  return points.filter((point) => {
    // Keep all points if no accuracy data
    if (point.accuracy === undefined || point.accuracy === null) {
      return true;
    }
    return point.accuracy <= maxAccuracy;
  });
}

/**
 * Main optimization function - AGGRESSIVE version for cleanup
 * Use this to get a clean, minimal path without overlaps
 */
export function optimizeGPSPath(points: any[]): LatLng[] {
  try {
    if (!points || !Array.isArray(points) || points.length < 2) {
      return points || [];
    }

    console.log(`[GPS] Starting optimization with ${points.length} points`);

    // Step 1: Light accuracy filter (very lenient)
    let optimized = filterByAccuracy(points, 300);
    console.log(`[GPS] After accuracy filter: ${optimized.length} points`);

    // Step 2: AGGRESSIVE distance filter - this is the main cleanup
    // Remove any points closer than 100 meters
    optimized = aggressiveDistanceFilter(optimized, 0.1); // 0.1 km = 100 meters
    console.log(`[GPS] After distance filter: ${optimized.length} points`);

    return optimized;
  } catch (error) {
    console.error('[GPS] Error optimizing path:', error);
    return points || [];
  }
}

/**
 * Calculate perpendicular distance from a point to a line segment
 * @param point - Point to measure distance from
 * @param lineStart - Start of line segment
 * @param lineEnd - End of line segment
 * @returns Distance in degrees (approximation)
 */
function perpendicularDistance(
  point: LatLng,
  lineStart: LatLng,
  lineEnd: LatLng
): number {
  const dx = lineEnd.longitude - lineStart.longitude;
  const dy = lineEnd.latitude - lineStart.latitude;

  if (dx === 0 && dy === 0) {
    // Line start and end are the same point
    const pdx = point.longitude - lineStart.longitude;
    const pdy = point.latitude - lineStart.latitude;
    return Math.sqrt(pdx * pdx + pdy * pdy);
  }

  const t =
    ((point.longitude - lineStart.longitude) * dx +
      (point.latitude - lineStart.latitude) * dy) /
    (dx * dx + dy * dy);

  const closestPoint = {
    longitude: lineStart.longitude + t * dx,
    latitude: lineStart.latitude + t * dy,
  };

  const pdx = point.longitude - closestPoint.longitude;
  const pdy = point.latitude - closestPoint.latitude;
  return Math.sqrt(pdx * pdx + pdy * pdy);
}

/**
 * Ramer-Douglas-Peucker algorithm (kept for reference, not used in main flow)
 * @param points - Array of GPS points
 * @param epsilon - Distance threshold (in degrees)
 * @returns Simplified array
 */
export function simplifyPolyline(
  points: LatLng[],
  epsilon: number = 0.001
): LatLng[] {
  if (points.length <= 2) {
    return points;
  }

  let dmax = 0;
  let index = 0;

  for (let i = 1; i < points.length - 1; i++) {
    const d = perpendicularDistance(
      points[i],
      points[0],
      points[points.length - 1]
    );
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  let result: LatLng[] = [];

  if (dmax > epsilon) {
    const rec1 = simplifyPolyline(points.slice(0, index + 1), epsilon);
    const rec2 = simplifyPolyline(points.slice(index), epsilon);
    result = rec1.slice(0, -1).concat(rec2);
  } else {
    result = [points[0], points[points.length - 1]];
  }

  return result;
}

/**
 * Filter points by minimum distance (in degrees)
 * Kept for backward compatibility
 * @param points - Array of GPS points
 * @param minDistance - Minimum distance between points in degrees
 * @returns Filtered points
 */
export function filterPointsByDistance(
  points: LatLng[],
  minDistance: number = 0.0001
): LatLng[] {
  if (points.length <= 1) {
    return points;
  }

  const filtered: LatLng[] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const lastPoint = filtered[filtered.length - 1];
    const dx = points[i].longitude - lastPoint.longitude;
    const dy = points[i].latitude - lastPoint.latitude;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance >= minDistance) {
      filtered.push(points[i]);
    }
  }

  return filtered;
}
