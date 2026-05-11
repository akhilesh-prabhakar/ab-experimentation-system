import { Router } from 'express';
import experimentController from '../controllers/experiment.controller';

const router = Router();

router.get('/experiment', (req, res, next) => {
    experimentController.getExperiment(req, res, next);
});

export default router;