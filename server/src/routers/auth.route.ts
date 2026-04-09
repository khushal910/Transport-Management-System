import { Router } from 'express';
import userRegister from '../controllers/athentication/user.registration';
import userLogin from '../controllers/athentication/user.login';
import userLogout from '../controllers/athentication/user.logout';
import userForgotPassword from '../controllers/athentication/user.forgot-password';
import userResetPassword from '../controllers/athentication/user.reset-password';
import getProfile from '../controllers/athentication/get-profile';
import updateProfile from '../controllers/athentication/update-profile';
import updateCompany from '../controllers/athentication/update-company';
import requestEmailVerification from '../controllers/athentication/request-email-verification';
import sendEmail from '../controllers/athentication/send-email';
import verifyEmailChange from '../controllers/athentication/verify-email-change';
import setupPassword from '../controllers/employee/setup-password';
import addEmployee from '../controllers/employee/add.employee';
import getEmployees from '../controllers/employee/get.employees';
import getDeletedEmployees from '../controllers/employee/get.deletedEmployees';
import recoverEmployee from '../controllers/employee/recover.employee';
import updateEmployee from '../controllers/employee/update.employee';
import deleteEmployee from '../controllers/employee/delete.employee';
import requiredRole from '../middlewares/role.middleware';

const authRouter = Router();

authRouter.post('/register', userRegister);
authRouter.post('/login', userLogin);
authRouter.post('/logout', userLogout);
authRouter.post('/forgot-password', userForgotPassword);
authRouter.post('/reset-password', userResetPassword);
authRouter.get('/profile', requiredRole('manager', 'driver', 'dispatcher', 'safety_officer', 'financial_analyst'), getProfile);
authRouter.put('/profile', requiredRole('manager', 'driver', 'dispatcher', 'safety_officer', 'financial_analyst'), updateProfile);
authRouter.put('/company', requiredRole('manager'), updateCompany);
authRouter.post('/request-email-verification', requiredRole('manager', 'driver', 'dispatcher', 'safety_officer', 'financial_analyst'), requestEmailVerification);
authRouter.post('/send-email', requiredRole('manager', 'driver', 'dispatcher', 'safety_officer', 'financial_analyst'), sendEmail);
authRouter.post('/verify-email-change', requiredRole('manager', 'driver', 'dispatcher', 'safety_officer', 'financial_analyst'), verifyEmailChange);
authRouter.post('/setup-password', setupPassword);
authRouter.post('/add-employee', requiredRole('manager'), addEmployee);
authRouter.get('/employees', requiredRole('manager', 'dispatcher'), getEmployees);
authRouter.put('/employee/:employeeId', requiredRole('manager'), updateEmployee);
authRouter.delete('/employee/:employeeId', requiredRole('manager'), deleteEmployee);
authRouter.get('/employees/deleted', requiredRole('manager'), getDeletedEmployees);
authRouter.post('/employee/recover/:employeeId', requiredRole('manager'), recoverEmployee);

// TEST ROUTE: Simple endpoint to verify server is running latest code
authRouter.get('/test', (req, res) => {
  res.json({ success: true, message: 'Auth router is responding correctly', timestamp: new Date().toISOString() });
});

// TEST ROUTE: Test PUT method
authRouter.put('/test', (req, res) => {
  res.json({ success: true, message: 'PUT method works on auth router', timestamp: new Date().toISOString() });
});

export default authRouter;