import { Router } from 'express';
import userRegister from '../controllers/user.registration.js';
import userLogin from '../controllers/user.login.js';
import userLogout from '../controllers/user.logout.js';

const authRouter = Router();

authRouter.post('/register', userRegister);
authRouter.post('/login', userLogin);
authRouter.post('/logout', userLogout);

export default authRouter;
