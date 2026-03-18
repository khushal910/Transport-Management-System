import joi from 'joi';

const maintenanceCreateSchema = joi.object({
  vehicleName: joi.string().trim().required(),
  description: joi.string().min(3).max(500).trim().required(),
  serviceDate: joi.date().required().min('now').messages({
    'date.min': 'Service date must be in the future',
  }),
  cost: joi.number().min(0).required(),
});

export default maintenanceCreateSchema;
