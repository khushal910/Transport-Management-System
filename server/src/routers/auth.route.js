import { Router } from 'express';
import userRegister from '../controllers/user.registration.js';

const authRouter = Router();

authRouter.post('/register', userRegister);

export default authRouter;
