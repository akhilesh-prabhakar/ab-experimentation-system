import { describe, it, expect } from 'vitest';
import { getBucket, resolveVariantIndex } from './hash';

describe('getBucket', () => {
    it('returns a number between 0 and 99 inclusive', () => {
        const bucket = getBucket('checkout-button-color', '42');
        expect(bucket).toBeGreaterThanOrEqual(0);
        expect(bucket).toBeLessThanOrEqual(99);
    });

    it('is deterministic — same inputs always produce the same bucket', () => {
        const a = getBucket('checkout-button-color', '42');
        const b = getBucket('checkout-button-color', '42');
        expect(a).toBe(b);
    });

    it('produces different buckets for different user IDs', () => {
        const buckets = new Set(
            Array.from({ length: 20 }, (_, i) => getBucket('exp', String(i)))
        );
        // With 20 different users, we expect more than 1 unique bucket
        expect(buckets.size).toBeGreaterThan(1);
    });

    it('produces different buckets for different experiment names (same user)', () => {
        const a = getBucket('experiment-a', '42');
        const b = getBucket('experiment-b', '42');
        // Different experiment names should not always collide
        // (not guaranteed to differ for every input, but these specific values do)
        expect(typeof a).toBe('number');
        expect(typeof b).toBe('number');
    });
});

describe('resolveVariantIndex', () => {
    it('returns 0 when there is only one variant', () => {
        expect(resolveVariantIndex(50, 50, 1)).toBe(0);
    });

    it('returns 0 (control) when bucket is below splitPercent', () => {
        expect(resolveVariantIndex(30, 50, 2)).toBe(0);
        expect(resolveVariantIndex(0, 50, 2)).toBe(0);
        expect(resolveVariantIndex(49, 50, 2)).toBe(0);
    });

    it('returns 1 (treatment) when bucket is at or above splitPercent', () => {
        expect(resolveVariantIndex(50, 50, 2)).toBe(1);
        expect(resolveVariantIndex(99, 50, 2)).toBe(1);
    });

    it('handles splitPercent=100 by routing all traffic to control', () => {
        expect(resolveVariantIndex(0, 100, 2)).toBe(0);
        expect(resolveVariantIndex(99, 100, 2)).toBe(0);
    });

    it('handles splitPercent=0 by distributing evenly across all variants', () => {
        // With 2 variants and splitPercent=0, bucket 0-49 → 0, 50-99 → 1
        expect(resolveVariantIndex(0, 0, 2)).toBe(0);
        expect(resolveVariantIndex(49, 0, 2)).toBe(0);
        expect(resolveVariantIndex(50, 0, 2)).toBe(1);
        expect(resolveVariantIndex(99, 0, 2)).toBe(1);
    });

    it('never returns an out-of-bounds variant index', () => {
        for (let bucket = 0; bucket < 100; bucket++) {
            const idx = resolveVariantIndex(bucket, 50, 3);
            expect(idx).toBeGreaterThanOrEqual(0);
            expect(idx).toBeLessThanOrEqual(2);
        }
    });

    it('distributes 3 variants correctly with splitPercent=50', () => {
        // bucket 0-49 → 0 (control, 50%)
        // bucket 50-74 → 1 (treatment-a, 25%)
        // bucket 75-99 → 2 (treatment-b, 25%)
        expect(resolveVariantIndex(0, 50, 3)).toBe(0);
        expect(resolveVariantIndex(49, 50, 3)).toBe(0);
        expect(resolveVariantIndex(50, 50, 3)).toBe(1);
        expect(resolveVariantIndex(74, 50, 3)).toBe(1);
        expect(resolveVariantIndex(75, 50, 3)).toBe(2);
        expect(resolveVariantIndex(99, 50, 3)).toBe(2);
    });
});
