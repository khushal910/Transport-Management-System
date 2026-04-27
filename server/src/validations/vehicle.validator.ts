import Joi, { ObjectSchema } from 'joi';

const vehicleRegisterSchema: ObjectSchema = Joi.object({
  name: Joi.string().trim().required(),
  licensePlate: Joi.string().trim().required(),
  model: Joi.string().trim().required(),
  vehicleType: Joi.string().trim().lowercase().valid('truck', 'van', 'bike').required(),
  maxCapacity: Joi.number().positive().required(),
  odometer: Joi.number().min(0).required(),
  status: Joi.string().trim().lowercase().valid('available', 'on_trip', 'in_shop', 'retired').default('available'),
});

export default vehicleRegisterSchema;
