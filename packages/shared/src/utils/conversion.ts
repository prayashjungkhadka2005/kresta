import crypto from 'crypto';

/**
 * Accurately calculate the Creator earning and Platform fee based on sale amount and commission rate.
 * @param saleAmount User checkout cart total
 * @param commissionRate Brand's defined commission rate (e.g., 10.5 for 10.5%)
 * @param platformFeeRate Global platform fee rate (e.g., 0.025 for 2.5%)
 */
export const calculateEarnings = (
    saleAmount: number,
    commissionRate: number,
    platformFeeRate: number
) => {
    // 1. Total Commission the Brand pays
    const totalCommission = saleAmount * (commissionRate / 100);

    // 2. Kresta's Platform Fee (cut from the commission, not the sale)
    const platformFee = totalCommission * platformFeeRate;

    // 3. Creator's Net Earnings
    const creatorEarning = totalCommission - platformFee;

    // 4. TDS Deduction (Future, for now 0)
    const tdsAmount = 0;

    return {
        totalCommission,
        platformFee,
        creatorEarning,
        tdsAmount
    };
};

/**
 * Generate a cryptographically secure, URL-safe short ID for referrers and clicks
 */
export const generateTrackId = (length: number = 8): string => {
    return crypto.randomBytes(length).toString('base64url').substring(0, length);
};
