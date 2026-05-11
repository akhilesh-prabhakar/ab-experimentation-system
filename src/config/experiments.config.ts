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

    return parsed as Experiment[];
}

// Load once at startup — not on every request
const experiments: Experiment[] = loadExperiments();

export default experiments;