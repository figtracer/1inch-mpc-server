import { z } from 'zod';
/**
 * Input parameters for the Common ETH Prices endpoint
 */
export const GetCommonEthPricesSchema = z.object({
    /** Optional fiat currency code, e.g. USD */
    currency: z.string().optional(),
});
