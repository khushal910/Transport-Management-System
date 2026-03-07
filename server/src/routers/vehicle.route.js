import {Router} from 'express'
import requiredRole from '../middlewares/role.middleware.js'
import vehicleRegister from '../controllers/vehicle/vehicle.register.js'
import vehicleUpdate from '../controllers/vehicle/vehicle.update.js'
import getVehicleList from '../controllers/vehicle/vehicle.getList.js'
import deleteVehicle from '../controllers/vehicle/vehicle.delete.js'

const vehicleRoute = Router()

vehicleRoute.post('/register', requiredRole('manager'), vehicleRegister)
vehicleRoute.post('/update/:vehicleId', requiredRole('manager'), vehicleUpdate);
vehicleRoute.get('/list', requiredRole('manager'), getVehicleList); 
vehicleRoute.delete('/delete/:vehicleId', requiredRole('manager'), deleteVehicle);

export default vehicleRoute