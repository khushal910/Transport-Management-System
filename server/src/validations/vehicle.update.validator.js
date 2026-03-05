import Joi from 'joi';

const vehicleUpdateSchema = Joi.object({
  name: Joi.string().trim(),
  licensePlate: Joi.string().trim(),
  model: Joi.string().trim(),
  vehicleType: Joi.string().trim().lowercase().valid('truck', 'van', 'bike'),
  maxCapacity: Joi.number().positive(),
  odometer: Joi.number().min(0).positive(),
  status: Joi.string().trim().lowercase().valid('available', 'on_trip', 'in_shop', 'retired'),
});

export default vehicleUpdateSchema;
