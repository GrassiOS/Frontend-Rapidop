/**
 * Calculate distance between two geographic coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Filter products by distance from user location
 * @param products Array of products with business information
 * @param userLat User's latitude
 * @param userLon User's longitude
 * @param maxDistance Maximum distance in kilometers (100 = no limit)
 * @returns Filtered array of products with distance added
 */
export function filterProductsByDistance<T extends { businessId: number }>(
  products: T[],
  businesses: { id: number; latitude: number; longitude: number }[],
  userLat: number,
  userLon: number,
  maxDistance: number
): (T & { distance: number })[] {
  // Create a map of business distances
  const businessDistances = new Map<number, number>();
  
  businesses.forEach((business) => {
    const distance = calculateDistance(
      userLat,
      userLon,
      business.latitude,
      business.longitude
    );
    businessDistances.set(business.id, distance);
  });

  // Filter and add distance to products
  return products
    .map((product) => {
      const distance = businessDistances.get(product.businessId);
      if (distance === undefined) return null;
      return { ...product, distance };
    })
    .filter((product): product is T & { distance: number } => {
      if (product === null) return false;
      if (maxDistance >= 100) return true; // No distance limit
      return product.distance <= maxDistance;
    })
    .sort((a, b) => a.distance - b.distance); // Sort by distance
}
