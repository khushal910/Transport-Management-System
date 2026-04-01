import { Router } from 'express';
import requiredRole from '../middlewares/role.middleware';
import vehicleRegister from '../controllers/vehicle/vehicle.register';
import vehicleUpdate from '../controllers/vehicle/vehicle.update';
import getVehicleList from '../controllers/vehicle/vehicle.getList';
import deleteVehicle from '../controllers/vehicle/vehicle.delete';
import getDeletedVehicleList from '../controllers/vehicle/vehicle.getDeletedList';
import recoverVehicle from '../controllers/vehicle/vehicle.recover';

const vehicleRoute = Router();

vehicleRoute.post('/register', requiredRole('manager'), vehicleRegister);
vehicleRoute.post('/update/:vehicleId', requiredRole('manager'), vehicleUpdate);
vehicleRoute.get('/list', requiredRole('manager', 'dispatcher'), getVehicleList);
vehicleRoute.delete('/delete/:vehicleId', requiredRole('manager'), deleteVehicle);
vehicleRoute.get('/deleted/list', requiredRole('manager'), getDeletedVehicleList);
vehicleRoute.post('/recover/:vehicleId', requiredRole('manager'), recoverVehicle);

export default vehicleRoute;