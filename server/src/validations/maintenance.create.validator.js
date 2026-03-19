import joi from 'joi';

const maintenanceCreateSchema = joi.object({
  vehicleName: joi.string().trim().required(),
  description: joi.string().min(3).max(500).trim().required(),
  serviceDate: joi.date().required().min('now').messages({
    'date.min': 'Service date must be in the future',
  }),
  cost: joi.number().min(0).required(),
  distance: joi.number().min(0).optional().messages({
    'number.base': 'Distance must be a number',
    'number.min': 'Distance cannot be negative',
  }),
});

export default maintenanceCreateSchema;
