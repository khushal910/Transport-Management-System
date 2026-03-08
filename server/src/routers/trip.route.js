import { Router } from "express";
import requiredRole from "../middlewares/role.middleware.js";
import createTrip from "../controllers/trip/create.trip.js";

const tripRouter = Router();

tripRouter.post('/create', requiredRole('manager'), createTrip);


export default tripRouter;