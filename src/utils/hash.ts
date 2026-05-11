import crypto from 'crypto';

export function getBucket(experimentName: string, userId: string): number {
    const key = `${experimentName}:${userId}`;
    const hash = crypto.createHash('md5').update(key).digest('hex');
    const num = parseInt(hash.substring(0, 8), 16);

    return num % 100;
}

export function resolveVariantIndex(bucket: number, splitPercent: number, variantCount: number): number {
    if (variantCount <= 1) return 0;

    // All traffic to control — treatments unreachable
    if (splitPercent >= 100) return 0;

    // No control traffic — divide evenly across all variants
    if (splitPercent <= 0) {
        const sliceSize = 100 / variantCount;
        return Math.min(Math.floor(bucket / sliceSize), variantCount - 1);
    }

    if (bucket < splitPercent) return 0;

    const remaining = 100 - splitPercent;
    const sliceSize = remaining / (variantCount - 1);
    const offsetBucket = bucket - splitPercent;
    const index = 1 + Math.floor(offsetBucket / sliceSize);

    return Math.min(index, variantCount - 1);
}
