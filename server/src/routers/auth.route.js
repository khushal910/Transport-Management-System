import { Router } from 'express';
import userRegister from '../controllers/athentication/user.registration.js';
import userLogin from '../controllers/athentication/user.login.js';
import userLogout from '../controllers/athentication/user.logout.js';

const authRouter = Router();

authRouter.post('/register', userRegister);
authRouter.post('/login', userLogin);
authRouter.post('/logout', userLogout);

export default authRouter;
