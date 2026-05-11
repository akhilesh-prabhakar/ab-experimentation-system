import fs from 'fs';
import path from 'path';
import { Experiment } from '../models/experiment.model';

const EXPERIMENTS_FILE_PATH = path.resolve(__dirname, '../../experiments.json');

function loadExperiments(): Experiment[] {
    if (!fs.existsSync(EXPERIMENTS_FILE_PATH)) {
        throw new Error(`experiments.json not found at path: ${EXPERIMENTS_FILE_PATH}`);
    }

    const raw = fs.readFileSync(EXPERIMENTS_FILE_PATH, 'utf-8');

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        throw new Error('experiments.json is not valid JSON');
    }

    if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('experiments.json must be a non-empty array');
    }

    validateExperiments(parsed);

    return parsed as Experiment[];
}

function validateExperiments(experiments: unknown[]): void {
    experiments.forEach((item, index) => {
        const exp = item as Record<string, unknown>;
        const label = `experiments[${index}]`;

        if (typeof exp.name !== 'string' || exp.name.trim() === '') {
            throw new Error(`${label}: name must be a non-empty string`);
        }

        if (typeof exp.enabled !== 'boolean') {
            throw new Error(`${label}: enabled must be a boolean`);
        }

        if (
            typeof exp.splitPercent !== 'number' ||
            exp.splitPercent < 0 ||
            exp.splitPercent > 100
        ) {
            throw new Error(`${label}: splitPercent must be a number between 0 and 100`);
        }

        if (!Array.isArray(exp.variants) || exp.variants.length < 2) {
            throw new Error(`${label}: variants must contain at least two entries`);
        }

        exp.variants.forEach((variantItem, variantIndex) => {
            const variant = variantItem as Record<string, unknown>;
            const variantLabel = `${label}.variants[${variantIndex}]`;

            if (typeof variant.name !== 'string' || variant.name.trim() === '') {
                throw new Error(`${variantLabel}: name must be a non-empty string`);
            }

            if (
                typeof variant.config !== 'object' ||
                variant.config === null ||
                Array.isArray(variant.config)
            ) {
                throw new Error(`${variantLabel}: config must be an object`);
            }
        });
    });
}

const experiments: Experiment[] = loadExperiments();

export default experiments;
