import { Router } from 'express';
import userRegister from '../controllers/athentication/user.registration.js';
import userLogin from '../controllers/athentication/user.login.js';
import userLogout from '../controllers/athentication/user.logout.js';
import userForgotPassword from '../controllers/athentication/user.forgot-password.js';
import userResetPassword from '../controllers/athentication/user.reset-password.js';
import setupPassword from '../controllers/employee/setup-password.js';
import addEmployee from '../controllers/employee/add.employee.js';
import getEmployees from '../controllers/employee/get.employees.js';
import updateEmployee from '../controllers/employee/update.employee.js';
import deleteEmployee from '../controllers/employee/delete.employee.js';
import requiredRole from '../middlewares/role.middleware.js';

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
