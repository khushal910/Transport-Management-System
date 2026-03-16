import { Router } from 'express';
import userRegister from '../controllers/athentication/user.registration.js';
import userLogin from '../controllers/athentication/user.login.js';
import userLogout from '../controllers/athentication/user.logout.js';
import addEmployee from '../controllers/athentication/add.employee.js';
import requiredRole from '../middlewares/role.middleware.js';

const authRouter = Router();

authRouter.post('/register', userRegister);
authRouter.post('/login', userLogin);
authRouter.post('/logout', userLogout);
authRouter.post('/add-employee', requiredRole('manager'), addEmployee);

export default authRouter;
