import { Router } from 'express';
import userRegister from '../controllers/athentication/user.registration';
import userLogin from '../controllers/athentication/user.login';
import userLogout from '../controllers/athentication/user.logout';
import userForgotPassword from '../controllers/athentication/user.forgot-password';
import userResetPassword from '../controllers/athentication/user.reset-password';
import setupPassword from '../controllers/employee/setup-password';
import addEmployee from '../controllers/employee/add.employee';
import getEmployees from '../controllers/employee/get.employees';
import updateEmployee from '../controllers/employee/update.employee';
import deleteEmployee from '../controllers/employee/delete.employee';
import requiredRole from '../middlewares/role.middleware';

const authRouter = Router();

authRouter.post('/register', userRegister);
authRouter.post('/login', userLogin);
authRouter.post('/logout', userLogout);
authRouter.post('/forgot-password', userForgotPassword);
authRouter.post('/reset-password', userResetPassword);
authRouter.post('/setup-password', setupPassword);
authRouter.post('/add-employee', requiredRole('manager'), addEmployee);
authRouter.get('/employees', requiredRole('manager'), getEmployees);
authRouter.put('/employee/:employeeId', requiredRole('manager'), updateEmployee);
authRouter.delete('/employee/:employeeId', requiredRole('manager'), deleteEmployee);

export default authRouter;