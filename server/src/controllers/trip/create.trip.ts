// @ts-nocheck
import User from '../../models/user.schema.js';
import Driver from '../../models/driver.schema.js';
import Vehicle from '../../models/vehicle.schema.js';
import response from '../../response/response.js';
import tripCreateSchema from '../../validations/trip.create.validator.js';
import Trip from '../../models/trip.schema.js';
import { DRIVER_STATUS } from '../../constants/driverStatus.constants.js';
import { validateDriverForAssignment, createStatusChangeRecord } from '../../utils/driverStatusManager.js';
import { validateAddressSelection } from '../../services/geocoding.service.js';

const createTrip = async (req, res) => {
  try { 
    

    const {error, value} = tripCreateSchema.validate(req.body);
    
    if(error){
      return response(res, 400, false, error.details[0].message.replace(/"/g, ""));
    }
    
    const {
      vehiclePlateNumber,
      driverEmail,
      cargoWeight,
      startLocationDetails,
      endLocationDetails,
      revenue,
    } = value;
    const companyId = req.user.companyId;

    let normalizedStartLocation;
    let normalizedEndLocation;

    try {
      const [startLocationValidation, endLocationValidation] = await Promise.all([
        validateAddressSelection(startLocationDetails),
        validateAddressSelection(endLocationDetails),
      ]);

      if (!startLocationValidation.isValid || !startLocationValidation.normalized) {
        return response(
          res,
          400,
          false,
          startLocationValidation.reason || 'Invalid start location. Please select an address from suggestions.',
        );
      }

      if (!endLocationValidation.isValid || !endLocationValidation.normalized) {
        return response(
          res,
          400,
          false,
          endLocationValidation.reason || 'Invalid destination location. Please select an address from suggestions.',
        );
      }

      normalizedStartLocation = startLocationValidation.normalized;
      normalizedEndLocation = endLocationValidation.normalized;
    } catch (addressError) {
      console.error('Address verification failed:', addressError);
      return response(res, 502, false, 'Address validation service unavailable. Please try again.');
    }

    if (normalizedStartLocation.placeId === normalizedEndLocation.placeId) {
      return response(res, 400, false, 'Start and destination locations must be different');
    }

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

    // Validate driver can be assigned using strict status control
    try {
      validateDriverForAssignment(isDriverExist.status);
    } catch (error) {
      return response(res, 400, false, error.message);
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
      startLocation: normalizedStartLocation.displayName,
      endLocation: normalizedEndLocation.displayName,
      startLocationDetails: normalizedStartLocation,
      endLocationDetails: normalizedEndLocation,
      revenue,
    };

    const newTrip = await Trip.create(tripData);
    
    // change vehicle status to assigned after creating the trip
    await Vehicle.findByIdAndUpdate(isVehicleExist._id, {status: 'assigned'});

    // Update driver: increment assignedTrips, set status to ON_TRIP, and recalculate completion rate
    // Create status change record for audit trail
    const statusChangeRecord = createStatusChangeRecord(
      isDriverExist.status,
      DRIVER_STATUS.ON_TRIP,
      'automatic_trip_assign',
      null // System automatic change
    );

    const updatedDriver = await Driver.findByIdAndUpdate(
      isDriverExist._id,
      {
        $inc: { assignedTrips: 1 },
        status: DRIVER_STATUS.ON_TRIP,
        lastStatusChange: new Date(),
        $push: { statusHistory: statusChangeRecord }
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
