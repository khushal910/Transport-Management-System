import runtimeConfig from '../config/runtime';

const MIN_QUERY_LENGTH = 3;
const DEFAULT_LIMIT = 5;
const MAX_LIMIT = 8;
const MAX_COORDINATE_DRIFT_KM = 2;

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export interface AddressSuggestion {
  placeId: string;
  displayName: string;
  latitude: number;
  longitude: number;
  source: 'nominatim';
}

export interface AddressValidationResult {
  isValid: boolean;
  reason?: string;
  normalized?: AddressSuggestion;
}

const buildGeocodingUrl = (path: string, params: URLSearchParams): string => {
  const baseUrl = runtimeConfig.geocodingBaseUrl.replace(/\/$/, '');
  return `${baseUrl}${path}?${params.toString()}`;
};

const fetchGeocodingJson = async <T>(url: string): Promise<T> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), runtimeConfig.geocodingTimeoutMs);

  try {
    const providerResponse = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'User-Agent': runtimeConfig.geocodingUserAgent,
      },
      signal: controller.signal,
    });

    if (!providerResponse.ok) {
      throw new Error(`Geocoding provider returned ${providerResponse.status}`);
    }

    return (await providerResponse.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
};

const toSuggestion = (result: NominatimResult): AddressSuggestion | null => {
  const latitude = Number(result.lat);
  const longitude = Number(result.lon);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  return {
    placeId: String(result.place_id),
    displayName: result.display_name,
    latitude,
    longitude,
    source: 'nominatim',
  };
};

const toRadians = (value: number): number => (value * Math.PI) / 180;

const getDistanceInKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

export const searchAddressSuggestions = async (query: string, limit: number = DEFAULT_LIMIT): Promise<AddressSuggestion[]> => {
  const sanitizedQuery = query.trim();
  if (sanitizedQuery.length < MIN_QUERY_LENGTH) {
    return [];
  }

  const boundedLimit = Math.min(Math.max(limit, 1), MAX_LIMIT);
  const params = new URLSearchParams({
    q: sanitizedQuery,
    format: 'jsonv2',
    addressdetails: '1',
    dedupe: '1',
    limit: String(boundedLimit),
  });

  if (runtimeConfig.geocodingCountryCodes) {
    params.set('countrycodes', runtimeConfig.geocodingCountryCodes);
  }

  if (runtimeConfig.geocodingContactEmail) {
    params.set('email', runtimeConfig.geocodingContactEmail);
  }

  const url = buildGeocodingUrl('/search', params);
  const results = await fetchGeocodingJson<NominatimResult[]>(url);

  return results
    .map((result) => toSuggestion(result))
    .filter((item): item is AddressSuggestion => Boolean(item));
};

export const validateAddressSelection = async (
  selection: Partial<AddressSuggestion> | null | undefined,
): Promise<AddressValidationResult> => {
  if (!selection?.placeId) {
    return { isValid: false, reason: 'Please select a valid address from suggestions' };
  }

  const latitude = Number(selection.latitude);
  const longitude = Number(selection.longitude);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { isValid: false, reason: 'Selected address coordinates are invalid' };
  }

  const params = new URLSearchParams({
    place_ids: String(selection.placeId),
    format: 'jsonv2',
    addressdetails: '1',
  });

  if (runtimeConfig.geocodingContactEmail) {
    params.set('email', runtimeConfig.geocodingContactEmail);
  }

  const url = buildGeocodingUrl('/lookup', params);
  const [lookupResult] = await fetchGeocodingJson<NominatimResult[]>(url);

  if (!lookupResult) {
    return { isValid: false, reason: 'Selected address is not recognized by the map provider' };
  }

  const normalized = toSuggestion(lookupResult);
  if (!normalized) {
    return { isValid: false, reason: 'Selected address coordinates are invalid' };
  }

  const distanceKm = getDistanceInKm(latitude, longitude, normalized.latitude, normalized.longitude);
  if (distanceKm > MAX_COORDINATE_DRIFT_KM) {
    return { isValid: false, reason: 'Selected address coordinates do not match the verified location' };
  }

  return {
    isValid: true,
    normalized,
  };
};
