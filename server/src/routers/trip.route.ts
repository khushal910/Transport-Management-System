import { Router } from 'express';
import requiredRole from '../middlewares/role.middleware';
import createTrip from '../controllers/trip/create.trip';
import getTripList from '../controllers/trip/trip.getList';
import deleteTrip from '../controllers/trip/delete.trip';
import updateTrip from '../controllers/trip/update.trip';
import updateTripStatus from '../controllers/trip/update.trip.status';

const tripRouter = Router();

// Both manager and dispatcher can create and view trips, drivers can view their assigned trips
tripRouter.post('/create', requiredRole('manager', 'dispatcher'), createTrip);
tripRouter.get('/get', requiredRole('manager', 'dispatcher', 'driver'), getTripList);

// Both manager and dispatcher can delete trips (only if status is draft or dispatched)
tripRouter.delete('/delete/:tripId', requiredRole('manager', 'dispatcher'), deleteTrip);

// Both manager and dispatcher can update trips (only if status is draft or dispatched)
tripRouter.put('/update/:tripId', requiredRole('manager', 'dispatcher'), updateTrip);

// Update trip status: Manager/Dispatcher can move draft->dispatched, Driver/Dispatcher can move dispatched->completed
tripRouter.patch('/status/:tripId', requiredRole('manager', 'dispatcher', 'driver'), updateTripStatus);

export default tripRouter;