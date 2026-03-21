import { Router } from "express";
import requiredRole from "../middlewares/role.middleware.js";
import createTrip from "../controllers/trip/create.trip.js";
import getTripList from "../controllers/trip/trip.getList.js";
import deleteTrip from "../controllers/trip/delete.trip.js";
import updateTrip from "../controllers/trip/update.trip.js";

const tripRouter = Router();

// Both manager and dispatcher can create and view trips
tripRouter.post('/create', requiredRole('manager', 'dispatcher'), createTrip);
tripRouter.get('/get', requiredRole('manager', 'dispatcher'), getTripList);

// Both manager and dispatcher can delete trips (only if status is draft or dispatched)
tripRouter.delete('/delete/:tripId', requiredRole('manager', 'dispatcher'), deleteTrip);

// Both manager and dispatcher can update trips (only if status is draft or dispatched)
tripRouter.put('/update/:tripId', requiredRole('manager', 'dispatcher'), updateTrip);

export default tripRouter;