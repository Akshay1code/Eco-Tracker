export interface Coordinates {
    lat: number;
    lng: number;
  }
  
  export function calculateDistanceKm(
    prev: Coordinates,
    curr: Coordinates
  ): number {
    const R = 6371; // Earth radius km
  
    const dLat = toRad(curr.lat - prev.lat);
    const dLng = toRad(curr.lng - prev.lng);
  
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(prev.lat)) *
        Math.cos(toRad(curr.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
  
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
  
  function toRad(value: number) {
    return (value * Math.PI) / 180;
  }
  