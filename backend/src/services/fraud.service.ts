import axios from "axios";

export interface FraudCheckInput {
    userId: string;
    amount: number;
    items: {
        product: string;
        quantity: number;
        price: number;
    }[];
}

export interface FraudCheckResult {
    score: number;
    flagged: boolean;
}

/**
 * Calls the external fraud-scoring microservice.
 *
 * This is deliberately a plain async function (NOT a Mongoose hook) so it can be
 * awaited inside a service before any state is committed. A network call must
 * never live inside a DB lifecycle hook: it couples write latency to a third
 * party and can't participate in a transaction.
 *
 * The call is given a short timeout so a slow dependency fails fast. If the
 * service URL isn't configured we treat the order as not flagged, so local/dev
 * environments still function without the microservice running.
 */
export const scoreOrder = async (input: FraudCheckInput): Promise<FraudCheckResult> => {
    const fraudServiceUrl = process.env.FRAUD_SERVICE_URL;
    if (!fraudServiceUrl) {
        return { score: 0, flagged: false };
    }

    const { data } = await axios.post(fraudServiceUrl, input, { timeout: 3000 });

    const score = typeof data?.score === "number" ? data.score : 0;
    const threshold = Number(process.env.FRAUD_SCORE_THRESHOLD ?? 0.8);

    return { score, flagged: score >= threshold };
};
