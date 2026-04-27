import { Request, Response } from 'express';
import response from '../../response/response.js';
import tripAddressSuggestionsQuerySchema from '../../validations/trip.address.suggestions.validator.js';
import { searchAddressSuggestions } from '../../services/geocoding.service.js';

const getTripAddressSuggestions = async (req: Request, res: Response) => {
  const { error, value } = tripAddressSuggestionsQuerySchema.validate(req.query);

  if (error) {
    return response(res, 400, false, error.details[0].message.replace(/"/g, ''));
  }

  try {
    const suggestions = await searchAddressSuggestions(value.query, value.limit);
    return response(res, 200, true, 'Address suggestions fetched successfully', suggestions);
  } catch (err) {
    console.error('Error fetching address suggestions:', err);
    return response(res, 502, false, 'Address suggestion service is temporarily unavailable. Please try again.');
  }
};

export default getTripAddressSuggestions;
