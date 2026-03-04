import { Router } from 'express';
import userRegister from '../controllers/user.registration.js';
import userLogin from '../controllers/user.login.js';

const authRouter = Router();

authRouter.post('/register', userRegister);
authRouter.post('/login', userLogin);

export default authRouter;
