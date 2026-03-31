import joi, { ObjectSchema } from 'joi'

const loginValidatorSchema: ObjectSchema = joi.object({
  email: joi.string().email().trim().required(),
  password: joi.string().min(3).max(50).trim().required()
})

export default loginValidatorSchema
