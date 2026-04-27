import Joi, { ObjectSchema } from 'joi';

const locationDetailsSchema: ObjectSchema = Joi.object({
  placeId: Joi.string().trim().required(),
  displayName: Joi.string().trim().min(5).max(255).required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required(),
});

const tripUpdateSchema: ObjectSchema = Joi.object({
  vehiclePlateNumber: Joi.string().trim().required(),
  cargoWeight: Joi.number().positive().required(),
  driverEmail: Joi.string().email().lowercase().trim().required(),
  startLocation: Joi.string().trim().min(2).max(255).required(),
  endLocation: Joi.string().trim().min(2).max(255).required(),
  startLocationDetails: locationDetailsSchema.optional(),
  endLocationDetails: locationDetailsSchema.optional(),
  revenue: Joi.number().positive().required(),
}).options({ abortEarly: false, stripUnknown: true });

export default tripUpdateSchema;
