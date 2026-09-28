// Section 4 of the brief: "Keep Geography Simple" - a predefined list of
// Dhaka areas with plain lat/long centroids, no map API. `corridor` groups
// zones that are considered "on the way" to each other for pooling
// purposes (see PoolingService.isCompatibleRoute).
export interface Zone {
  name: string;
  lat: number;
  lng: number;
  corridor: string;
}

export const DHAKA_ZONES: Zone[] = [
  { name: 'Banani', lat: 23.7937, lng: 90.4066, corridor: 'gulshan-banani-mohakhali' },
  { name: 'Gulshan 1', lat: 23.7808, lng: 90.4144, corridor: 'gulshan-banani-mohakhali' },
  { name: 'Gulshan 2', lat: 23.7925, lng: 90.4078, corridor: 'gulshan-banani-mohakhali' },
  { name: 'Mohakhali', lat: 23.7773, lng: 90.4046, corridor: 'gulshan-banani-mohakhali' },
  { name: 'Dhanmondi', lat: 23.7461, lng: 90.3742, corridor: 'dhanmondi-farmgate' },
  { name: 'Farmgate', lat: 23.7581, lng: 90.3897, corridor: 'dhanmondi-farmgate' },
  { name: 'Mirpur', lat: 23.8223, lng: 90.3654, corridor: 'mirpur-uttara' },
  { name: 'Uttara', lat: 23.8759, lng: 90.3795, corridor: 'mirpur-uttara' },
  { name: 'Bashundhara', lat: 23.8151, lng: 90.4342, corridor: 'bashundhara-baridhara' },
  { name: 'Baridhara', lat: 23.7925, lng: 90.4213, corridor: 'bashundhara-baridhara' },
];

export function findZone(name: string): Zone | undefined {
  return DHAKA_ZONES.find((z) => z.name.toLowerCase() === name.toLowerCase());
}

// Very simple haversine distance in km - good enough for a demo fare model,
// not a routing engine (brief explicitly says not to build one).
export function distanceKm(a: Zone, b: Zone): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return R * 2 * Math.asin(Math.sqrt(h));
}
