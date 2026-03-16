import { Router } from "express";
import requiredRole from "../middlewares/role.middleware.js";
import createTrip from "../controllers/trip/create.trip.js";
import getTripList from "../controllers/trip/trip.getList.js";

const tripRouter = Router();

// Both manager and dispatcher can create and view trips
tripRouter.post('/create', requiredRole('manager', 'dispatcher'), createTrip);
tripRouter.get('/get', requiredRole('manager', 'dispatcher'), getTripList);

export default tripRouter;