import {Router} from 'express'
import requiredRole from '../middlewares/role.middleware.js'
import vehicleRegister from '../controllers/vehicle/vehicle.register.js'
import vehicleUpdate from '../controllers/vehicle/vehicle.update.js'
import getVehicleList from '../controllers/vehicle/vehicle.getList.js'
import deleteVehicle from '../controllers/vehicle/vehicle.delete.js'
import getDeletedVehicleList from '../controllers/vehicle/vehicle.getDeletedList.js'
import recoverVehicle from '../controllers/vehicle/vehicle.recover.js'

const vehicleRoute = Router()

vehicleRoute.post('/register', requiredRole('manager'), vehicleRegister)
vehicleRoute.post('/update/:vehicleId', requiredRole('manager'), vehicleUpdate);
vehicleRoute.get('/list', requiredRole('manager'), getVehicleList); 
vehicleRoute.delete('/delete/:vehicleId', requiredRole('manager'), deleteVehicle);
vehicleRoute.get('/deleted/list', requiredRole('manager'), getDeletedVehicleList);
vehicleRoute.post('/recover/:vehicleId', requiredRole('manager'), recoverVehicle);

export default vehicleRoute