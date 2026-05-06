import { Router } from 'express';
import smtpTest from '../controllers/athentication/smtp-test';

const debugRouter = Router();

debugRouter.post('/smtp-test', smtpTest);

export default debugRouter;