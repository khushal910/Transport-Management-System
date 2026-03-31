import Joi, { ObjectSchema } from "joi";

const tripCreateSchema: ObjectSchema = Joi.object({
  vehiclePlateNumber: Joi.string().trim().required(),
  cargoWeight: Joi.number().positive().required(),
  driverEmail: Joi.string().email().lowercase().trim().required(),
  startLocation: Joi.string().trim().min(2).required(),
  endLocation: Joi.string().trim().min(2).required(),
  revenue: Joi.number().positive().required(),
});

export default tripCreateSchema;
