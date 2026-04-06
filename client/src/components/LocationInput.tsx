import React, { useRef, useEffect, useState } from 'react';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';
import { getLocationSuggestions, formatLocationDisplay, LocationSuggestion } from '../api/locationBaseURL';

interface LocationInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelect: (location: LocationSuggestion) => void;
  placeholder?: string;
  label?: string;
  name: string; // Add name prop
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  suggestions: LocationSuggestion[];
  setSuggestions: (suggestions: LocationSuggestion[]) => void;
  isLoading?: boolean;
  setIsLoading?: (loading: boolean) => void;
}

/**
 * LocationInput Component
 * Provides autocomplete suggestions for location fields
 * Works similar to Google Maps or Flipkart location search
 */
const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Enter location',
  label,
  name,
  showSuggestions,
  setShowSuggestions,
  suggestions,
  setSuggestions,
  isLoading = false,
  setIsLoading,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  // Handle location search with debouncing
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    const query = e.target.value.trim();

    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Debounce API call
    const timeout = setTimeout(async () => {
      setIsLoading?.(true);
      try {
        const results = await getLocationSuggestions(query);
        setSuggestions(results);
        setShowSuggestions(true);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading?.(false);
      }
    }, 500); // Wait 500ms after user stops typing

    setSearchTimeout(timeout);
  };

  const handleSelectLocation = (location: LocationSuggestion) => {
    onSelect(location);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setShowSuggestions]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [searchTimeout]);

  return (
    <div className="relative">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={value}
          onChange={handleInputChange}
          onFocus={() => {
            if (value.length >= 2 && suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 animate-spin" size={16} />
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto"
        >
          {suggestions.map((location) => (
            <div
              key={location.place_id}
              onClick={() => handleSelectLocation(location)}
              className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition"
            >
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-medium text-gray-900 text-sm">
                    {formatLocationDisplay(location)}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {location.type} • {location.class}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {showSuggestions && value.length >= 2 && suggestions.length === 0 && !isLoading && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-4">
          <div className="flex items-center gap-2 text-gray-500">
            <AlertCircle size={16} />
            <span className="text-sm">No locations found</span>
          </div>
          <p className="text-xs text-gray-400 mt-2">Try with a different search term</p>
        </div>
      )}
    </div>
  );
};

export default LocationInput;
