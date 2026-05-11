import { Request, Response, NextFunction } from 'express';
import experimentService from '../services/experiment.service';
import { SuccessResponse, ErrorResponse } from '../models/experiment.model';

class ExperimentController {
    public getExperiment(req: Request, res: Response, next: NextFunction): void {
        try {
            const { user_id, experiment } = req.query;

            if (!user_id || typeof user_id !== 'string' || user_id.trim() === '') {
                const error: ErrorResponse = {
                    status: 'error',
                    message: 'user_id is required and must be a non-empty string',
                    code: 'INVALID_USER_ID',
                };
                res.status(400).json(error);
                return;
            }

            if (experiment) {
                if (typeof experiment !== 'string') {
                    const error: ErrorResponse = {
                        status: 'error',
                        message: 'experiment must be a string',
                        code: 'INVALID_EXPERIMENT_NAME',
                    };
                    res.status(400).json(error);
                    return;
                }

                const result = experimentService.assignSingle(user_id.trim(), experiment.trim());

                if (!result) {
                    const error: ErrorResponse = {
                        status: 'error',
                        message: `Experiment '${experiment}' not found or is disabled`,
                        code: 'EXPERIMENT_NOT_FOUND',
                    };
                    res.status(404).json(error);
                    return;
                }

                const response: SuccessResponse = {
                    status: 'success',
                    data: result,
                };
                res.status(200).json(response);
                return;
            }

            const results = experimentService.assign(user_id.trim());
            const response: SuccessResponse = {
                status: 'success',
                data: results,
            };
            res.status(200).json(response);

        } catch (err) {
            next(err);
        }
    }
}

export default new ExperimentController();
