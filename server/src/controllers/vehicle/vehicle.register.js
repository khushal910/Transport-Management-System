import Vehicle from '../../models/vehicle.schema.js';
import response from '../../response/response.js';
import vehicleRegisterSchema from '../../validations/vehicle.validator.js';

const vehicleRegister = async (req, res) => {
  try {
    const { error, value } = vehicleRegisterSchema.validate(req.body);

    if (error) {
      return response(
        res,
        400,
        false,
        error.details[0].message.replace(/["]/g, '')
      );
    }
    
    const vechicleRegisterData = {
      ...value,
      createdBy: req.user.id
    };

    const vehicleRegister = await Vehicle.create(vechicleRegisterData);
    return response(res, 201, true, 'Vehicle registered successfully');
  
  } catch (err) {
    if (err.code === 11000) {
      return response(
        res,
        400,
        false,
        'Vehicle with this license plate already exists'
      );
    }

    return response(res, 500, false, 'Vehicle registration failed');
  }
};

export default vehicleRegister;
