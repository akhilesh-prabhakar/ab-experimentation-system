import { Experiment, AssignmentResult } from '../models/experiment.model';
import { getBucket, resolveVariantIndex } from '../utils/hash';
import experiments from '../config/experiments.config';

class ExperimentService {
    private experiments: Experiment[];

    constructor() {
        this.experiments = experiments;
    }

    public assign(userId: string): AssignmentResult[] {
        const activeExperiments = this.experiments.filter(exp => exp.enabled);

        return activeExperiments.map(exp => {
            const bucket = getBucket(exp.name, userId);
            const variantIndex = resolveVariantIndex(
                bucket,
                exp.splitPercent,
                exp.variants.length
            );
            const variant = exp.variants[variantIndex];

            return {
                user_id: userId,
                experiment: exp.name,
                variant: variant.name,
                config: variant.config,
            };
        });
    }

    public assignSingle(userId: string, experimentName: string): AssignmentResult | null {
        const experiment = this.experiments.find(
            exp => exp.name === experimentName && exp.enabled
        );

        if (!experiment) return null;

        const bucket = getBucket(experiment.name, userId);
        const variantIndex = resolveVariantIndex(
            bucket,
            experiment.splitPercent,
            experiment.variants.length
        );
        const variant = experiment.variants[variantIndex];

        return {
            user_id: userId,
            experiment: experiment.name,
            variant: variant.name,
            config: variant.config,
        };
    }
}

export default new ExperimentService();
