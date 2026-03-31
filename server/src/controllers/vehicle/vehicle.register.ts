// @ts-nocheck
import Vehicle from '../../models/vehicle.schema';
import response from '../../response/response';
import vehicleRegisterSchema from '../../validations/vehicle.validator';

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

    const isVehicleExist = await Vehicle.findOne({ licensePlate: value.licensePlate });
    if (isVehicleExist) {
      return response(
        res,
        400,
        false,
        'Vehicle with this license plate already exists'
      );
    }

    const vehicleRegisterData = {
      ...value,
      company: req.user.companyId,
      createdBy: req.user.id
    };

    const vehicleRegister = await Vehicle.create(vehicleRegisterData);
    return response(res, 201, true, 'Vehicle registered successfully', vehicleRegister);
  
  } catch (err) {
    if (err.code === 11000) {
      return response(
        res,
        400,
        false,
        'Vehicle with this license plate already exists'
      );
    }

    console.error('Vehicle registration error:', err);
    return response(res, 500, false, 'Vehicle registration failed');
  }
};

export default vehicleRegister;

