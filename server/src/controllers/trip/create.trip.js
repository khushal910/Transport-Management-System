import User from "../../models/user.schema.js";
import Driver from "../../models/driver.schema.js";
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
    const companyId = req.user.companyId;

    // Check if vehicle exists and is available and belongs to the same company
    const isVehicleExist = await Vehicle.findOne({ 
      licensePlate: vehiclePlateNumber,
      company: companyId,
      isDeleted: false
    }, "_id status maxCapacity");
    
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

    // Check if driver exists and belongs to the same company
    const isDriverUser = await User.findOne({ 
      email: driverEmail, 
      role: 'driver',
      company: companyId 
    }, "_id").lean();
    
    if (!isDriverUser) {
      return response(res, 404, false, 'Driver not found');
    }

    // Check if driver record exists in Driver table
    const isDriverExist = await Driver.findOne({
      user: isDriverUser._id,
    }, "_id status");

    if (!isDriverExist) {
      return response(res, 404, false, 'Driver record not found. Driver must be properly registered.');
    }

    // Check if driver is available (not on_trip or suspended)
    if (isDriverExist.status === 'suspended') {
      return response(res, 400, false, 'Driver is suspended and cannot be assigned to trips');
    }

    if (isDriverExist.status === 'on_trip') {
      return response(res, 400, false, 'Driver is currently on a trip');
    }
    
    /* 
       If the driver is assigned to another trip with status draft or dispatched, it means they are currently on a trip and cannot be assigned to a new one until the current trip is completed or cancelled.
    */
    const isDriverAvailable = await Trip.findOne({ 
      driver: isDriverExist._id, 
      status: { $in: ['draft', 'dispatched'] } 
    });
    
    if (isDriverAvailable) {
      return response(res, 400, false, 'Driver is currently assigned to another trip');
    }

    const tripData = {
      company: companyId,
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

    // Update driver: increment assignedTrips, set status to on_trip, and recalculate completion rate
    const updatedDriver = await Driver.findByIdAndUpdate(
      isDriverExist._id,
      {
        $inc: { assignedTrips: 1 },
        status: 'on_trip'
      },
      { new: true }
    );

    // Recalculate and update completion rate for the driver
    if (updatedDriver.assignedTrips > 0) {
      const completionRate = (updatedDriver.completedTrips / updatedDriver.assignedTrips) * 100;
      await Driver.findByIdAndUpdate(
        isDriverExist._id,
        { completionRate: parseFloat(completionRate.toFixed(2)) }
      );
    }
        
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