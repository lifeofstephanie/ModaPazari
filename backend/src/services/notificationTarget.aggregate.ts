import { PipelineStage } from "mongoose";

/**
 * Polymorphic populate for notifications.
 *
 * A notification has { targetType: 'Order' | 'Product' | 'User', targetId }, and
 * we want to resolve `targetId` against the correct collection and attach it as
 * `target`.
 *
 * IMPORTANT: MongoDB's $lookup.from must be a constant — it cannot be chosen at
 * runtime from a field value. So there is no single dynamic $lookup stage. The
 * working pattern is one guarded $lookup per possible collection: each sub-
 * pipeline only matches when BOTH the id matches AND targetType names that
 * collection, so at most one lookup yields a document. We then coalesce the
 * three (mutually exclusive) result arrays into a single `target`.
 *
 * `from` values are the physical Mongoose collection names (lower-cased plural),
 * not the model names: Order -> orders, Product -> products, User -> users.
 */
const lookupForType = (
    from: string,
    targetType: string,
    as: string
): PipelineStage.Lookup => ({
    $lookup: {
        from,
        // Pass both fields in so the sub-pipeline can guard on targetType and
        // stay a no-op (empty array) for every other notification.
        let: { tid: "$targetId", ttype: "$targetType" },
        pipeline: [
            {
                $match: {
                    $expr: {
                        $and: [
                            { $eq: ["$$ttype", targetType] },
                            { $eq: ["$_id", "$$tid"] },
                        ],
                    },
                },
            },
        ],
        as,
    },
});

/**
 * Stages that add a populated `target` field to each notification. Spread these
 * into any Notification aggregation, e.g.:
 *
 *   Notification.aggregate([{ $match: { user } }, ...populateNotificationTarget]);
 */
export const populateNotificationTarget: PipelineStage[] = [
    lookupForType("orders", "Order", "_targetOrder"),
    lookupForType("products", "Product", "_targetProduct"),
    lookupForType("users", "User", "_targetUser"),
    {
        // Exactly one of the three arrays is non-empty, so concatenating them
        // and taking the first element yields the single matched target (or null
        // if the referenced doc was deleted).
        $addFields: {
            target: {
                $first: {
                    $concatArrays: [
                        "$_targetOrder",
                        "$_targetProduct",
                        "$_targetUser",
                    ],
                },
            },
        },
    },
    {
        // Drop the scratch arrays; keep the doc otherwise intact.
        $project: {
            _targetOrder: 0,
            _targetProduct: 0,
            _targetUser: 0,
        },
    },
];
