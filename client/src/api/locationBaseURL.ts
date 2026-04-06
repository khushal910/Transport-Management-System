import axios from 'axios';

/**
 * Location Autocomplete API Client
 * Uses OpenStreetMap Nominatim API for free location suggestions
 * Alternative: Google Places API (requires API key)
 */

const nominatimAPI = axios.create({
  baseURL: 'https://nominatim.openstreetmap.org',
  timeout: 5000,
});

export interface LocationSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  class: string;
  address?: {
    city?: string;
    state?: string;
    country?: string;
  };
}

/**
 * Get location suggestions from user input
 * @param query - User's location search query
 * @param countryCode - Optional: Filter by country (defaults to "IN" for India)
 * @returns Array of location suggestions
 */
export const getLocationSuggestions = async (
  query: string,
  countryCode: string = 'IN'
): Promise<LocationSuggestion[]> => {
  try {
    if (!query || query.trim().length < 2) {
      return [];
    }

    const response = await nominatimAPI.get('/search', {
      params: {
        q: query,
        format: 'json',
        limit: 10,
        countrycodes: countryCode, // Limit to India by default
        'accept-language': 'en',
      },
      headers: {
        'User-Agent': 'Transport-Management-System (contact@example.com)',
      },
    });

    if (Array.isArray(response.data)) {
      return response.data.map((item: any) => ({
        place_id: item.place_id,
        display_name: item.display_name,
        lat: item.lat,
        lon: item.lon,
        type: item.type,
        class: item.class,
      }));
    }

    return [];
  } catch (error: any) {
    console.error('Error fetching location suggestions:', error.message);
    return [];
  }
};

/**
 * Get location suggestions with debouncing for better performance
 * Use this in input change handlers
 */
export const debouncedGetLocationSuggestions = (
  callback: (suggestions: LocationSuggestion[]) => void,
  delay: number = 500
) => {
  let timeoutId: NodeJS.Timeout;

  return (query: string, countryCode?: string) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      const suggestions = await getLocationSuggestions(query, countryCode);
      callback(suggestions);
    }, delay);
  };
};

/**
 * Format location suggestion for display
 * Shows city, state, and partial address
 */
export const formatLocationDisplay = (location: LocationSuggestion): string => {
  const parts = location.display_name.split(',');
  // Return first 2-3 parts (usually most relevant)
  return parts.slice(0, 3).join(',').trim();
};

/**
 * Get reverse geocoding - convert coordinates to address
 */
export const getReverseGeocoding = async (
  latitude: number,
  longitude: number
): Promise<string | null> => {
  try {
    const response = await nominatimAPI.get('/reverse', {
      params: {
        format: 'json',
        lat: latitude,
        lon: longitude,
      },
      headers: {
        'User-Agent': 'Transport-Management-System (contact@example.com)',
      },
    });

    return response.data?.address?.name || response.data?.display_name || null;
  } catch (error) {
    console.error('Error in reverse geocoding:', error);
    return null;
  }
};

/**
 * Common Indian cities for quick selection
 * User can start with these or search for others
 */
export const COMMON_INDIAN_CITIES = [
  { name: 'Mumbai', lat: '19.0760', lon: '72.8777' },
  { name: 'Delhi', lat: '28.7041', lon: '77.1025' },
  { name: 'Bangalore', lat: '12.9716', lon: '77.5946' },
  { name: 'Hyderabad', lat: '17.3850', lon: '78.4867' },
  { name: 'Pune', lat: '18.5204', lon: '73.8567' },
  { name: 'Chennai', lat: '13.0827', lon: '80.2707' },
  { name: 'Kolkata', lat: '22.5726', lon: '88.3639' },
  { name: 'Ahmedabad', lat: '23.0225', lon: '72.5714' },
  { name: 'Jaipur', lat: '26.9124', lon: '75.7873' },
  { name: 'Lucknow', lat: '26.8467', lon: '80.9462' },
  { name: 'Chandigarh', lat: '30.7333', lon: '76.7794' },
  { name: 'Nagpur', lat: '21.1459', lon: '79.0882' },
];
