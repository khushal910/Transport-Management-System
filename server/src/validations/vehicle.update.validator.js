import Joi from 'joi';

// Vehicle status is managed through system lifecycle events only:
// - available: default when vehicle is created
// - on_trip: automatically set when trip is created/dispatched
// - in_shop: managed through maintenance system
// - retired: manual setting only (vehicles no longer in use)
// Manual status changes are NOT allowed through this update endpoint
const vehicleUpdateSchema = Joi.object({
  name: Joi.string().trim(),
  licensePlate: Joi.string().trim(),
  model: Joi.string().trim(),
  vehicleType: Joi.string().trim().lowercase().valid('truck', 'van', 'bike'),
  maxCapacity: Joi.number().positive(),
  odometer: Joi.number().min(0).positive(),
  // Status intentionally excluded - managed through lifecycle events only
});

export default vehicleUpdateSchema;
