import { Response } from 'express';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
}

/**
 * Standardized API response handler
 * Ensures consistent response format across all endpoints
 * 
 * @param res - Express Response object
 * @param statusCode - HTTP status code
 * @param success - Indicates if request was successful
 * @param message - Response message
 * @param data - Optional response data payload
 * @returns Express Response with JSON body
 */
const response = <T = any>(
  res: Response,
  statusCode: number,
  success: boolean,
  message: string,
  data: T | null = null
): Response<ApiResponse<T>> => {
  return res.status(statusCode).json({
    success,
    message,
    data,
  });
};

export { response as default, ApiResponse };
