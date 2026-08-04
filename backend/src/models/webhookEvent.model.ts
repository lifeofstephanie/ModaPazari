import mongoose, { Document, Schema } from "mongoose";

/**
 * Idempotency ledger for inbound payment webhooks. One row per provider event
 * id. The unique index is what makes duplicate/concurrent deliveries safe: the
 * insert is performed inside the same transaction that fulfils the order, so a
 * second delivery of the same event fails the unique index and the whole
 * transaction rolls back with nothing double-applied.
 */
export interface IWebhookEvent extends Document {
    eventId: string;
    provider: string;
    type: string;
}

const webhookEventSchema = new Schema<IWebhookEvent>(
    {
        eventId: {
            type: String,
            required: true,
            unique: true,
        },
        provider: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

const WebhookEvent = mongoose.model<IWebhookEvent>(
    "WebhookEvent",
    webhookEventSchema
);
export default WebhookEvent;
