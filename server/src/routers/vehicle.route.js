import {Router} from 'express'
import requiredRole from '../middlewares/role.middleware.js'
import vehicleRegister from '../controllers/vehicle/vehicle.register.js'
import vehicleUpdate from '../controllers/vehicle/vehicle.update.js'

const vehicleRoute = Router()

vehicleRoute.post('/register', requiredRole('manager'), vehicleRegister)
vehicleRoute.post('/update/:vehicleId', requiredRole('manager'), vehicleUpdate);

export default vehicleRoute