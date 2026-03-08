import User from "../../models/user.schema.js";
import Vehicle from "../../models/vehicle.schema.js";
import response from "../../response/response.js";
import tripCreateSchema from "../../validations/trip.create.validator.js";
import Trip from "../../models/trip.schema.js";

const createTrip = async (req, res) => {
  try { 
    

    const {error, value} = tripCreateSchema.validate(req.body);
    
    if(error){
      return response(res, 400, false, error.details[0].message.replace(/"/g, ""));
    }
    
    const { vehiclePlateNumber, driverEmail, cargoWeight, startLocation, endLocation, revenue } = value;

    // Check if vehicle exists and is available
    const isVehicleExist = await Vehicle.findOne({ licensePlate: vehiclePlateNumber, }, "_id status maxCapacity");
    if(!isVehicleExist ){
      return response(res, 404, false, 'Vehicle not found');
    }

    if(isVehicleExist.status !== 'available'){
      return response(res, 400, false, 'Vehicle is not available for trip');
    }

    //check if cargo weight exceeds vehicle capacity
    if (isVehicleExist.maxCapacity < cargoWeight) {
      return response(res, 400, false, 'Cargo weight exceeds vehicle capacity');
    }

    // Check if driver exists 
    const isDriverExist = await User.findOne({ email: driverEmail, role: 'driver' }).lean();
    if (!isDriverExist) {
      return response(res, 404, false, 'Driver not found');
    }
    
    /* 
       If the driver is assigned to another trip with status draft or dispatched, it means they are currently on a trip and cannot be assigned to a new one until the current trip is completed or cancelled.
    */
    const isDriverAvailable = await Trip.findOne({ driver: isDriverExist._id, status: { $in: ['draft', 'dispatched'] } });
    if (isDriverAvailable) {
      return response(res, 400, false, 'Driver is currently assigned to another trip');
    }

    const tripData = {
      vehicle: isVehicleExist._id,
      driver: isDriverExist._id,
      cargoWeight,
      startLocation,
      endLocation,
      revenue,
    };

    const newTrip = await Trip.create(tripData);
    
    // change vehicle status to assigned after creating the trip
    await Vehicle.findByIdAndUpdate(isVehicleExist._id, {status: 'assigned'});
        
    return response(res, 201, true, 'Trip created successfully', newTrip);

  } catch (error) {
    console.error('Error creating trip:', error);

    if(error.code === 11000){
      return response(res, 400, false, 'Trip with the same vehicle and driver already exists');
    }

    return response(res, 500, false, 'Failed to create trip');
  } 
};

export default createTrip;