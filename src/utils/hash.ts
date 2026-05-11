import crypto from 'crypto';

/**
 * Generates a deterministic bucket (0-99) for a given key.
 * Same key will always produce the same bucket across restarts.
 *
 * @param experimentName - The experiment identifier
 * @param userId - The user identifier
 * @returns A number between 0 and 99 (inclusive)
 */
export function getBucket(experimentName: string, userId: string): number {
    const key = `${experimentName}:${userId}`;

    const hash = crypto
        .createHash('md5')
        .update(key)
        .digest('hex');

    // Take first 8 hex characters and convert to an integer
    // e.g. "a3f1c8b9" → 2751792313
    const num = parseInt(hash.substring(0, 8), 16);

    // Map to 0–99 bucket
    return num % 100;
}

/**
 * Determines which variant a user falls into based on their bucket.
 *
 * @param bucket - Number between 0-99
 * @param splitPercent - % of users that should get 'control' (e.g. 50 = 50/50 split)
 * @returns 'control' or 'treatment'
 *
 * Example:
 *   splitPercent = 50 → buckets 0-49 = control, 50-99 = treatment
 *   splitPercent = 80 → buckets 0-79 = control, 80-99 = treatment
 */
export function resolveVariantIndex(bucket: number, splitPercent: number): number {
    return bucket < splitPercent ? 0 : 1;
}