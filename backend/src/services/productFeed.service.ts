import mongoose from "mongoose";
import Product, { IProduct } from "../models/product.model";

export class FeedError extends Error {
    status: number;
    constructor(message: string, status = 400) {
        super(message);
        this.name = "FeedError";
        this.status = status;
    }
}

export interface FeedFilters {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
}

export interface FeedInput extends FeedFilters {
    cursor?: string;
    limit?: number;
}

export interface FeedResult {
    items: IProduct[];
    nextCursor: string | null;
    hasMore: boolean;
}

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

// The feed's total ordering. createdAt gives "newest first"; _id is the
// tie-breaker that makes the order strict (no two rows compare equal), which is
// what keeps the feed duplicate-free at page boundaries.
type Anchor = { createdAt: Date; id: mongoose.Types.ObjectId };

/**
 * Opaque cursor = base64url({ t: <createdAt ms>, i: <_id hex> }).
 *
 * Encoding the sort key (not just the id) is deliberate: it means paging does
 * not depend on the boundary product still existing, so a delete mid-scroll
 * can't strand the reader.
 */
const encodeCursor = (anchor: Anchor): string =>
    Buffer.from(
        JSON.stringify({ t: anchor.createdAt.getTime(), i: String(anchor.id) })
    ).toString("base64url");

const decodeCursor = (raw: string): Anchor => {
    // Convenience: allow a bare product ObjectId ("last seen product id"). We
    // resolve its createdAt via a lookup below.
    if (mongoose.isValidObjectId(raw) && raw.length === 24) {
        return { createdAt: new Date(0), id: new mongoose.Types.ObjectId(raw) };
    }
    try {
        const parsed = JSON.parse(Buffer.from(raw, "base64url").toString());
        if (
            typeof parsed.t !== "number" ||
            typeof parsed.i !== "string" ||
            !mongoose.isValidObjectId(parsed.i)
        ) {
            throw new Error("malformed");
        }
        return {
            createdAt: new Date(parsed.t),
            id: new mongoose.Types.ObjectId(parsed.i),
        };
    } catch {
        throw new FeedError("Invalid cursor");
    }
};

/**
 * Resolve the paging anchor. For a bare-ObjectId cursor we must look the row up
 * to learn its createdAt; if that row was deleted we can't place the reader, so
 * we ask them to page with the opaque nextCursor token instead (which never
 * needs the row).
 */
const resolveAnchor = async (raw: string): Promise<Anchor> => {
    const anchor = decodeCursor(raw);
    const isBareId = anchor.createdAt.getTime() === 0;
    if (!isBareId) return anchor;

    const doc = await Product.findById(anchor.id).select("createdAt").lean();
    if (!doc) {
        throw new FeedError(
            "Cursor product no longer exists; page using the nextCursor token from the previous response"
        );
    }
    return { createdAt: (doc as any).createdAt as Date, id: anchor.id };
};

/**
 * Cursor-based (keyset) feed over the product catalogue, newest first.
 *
 * Stable and duplicate-free under concurrent inserts/deletes because it seeks on
 * the immutable (createdAt, _id) boundary rather than using skip/offset — the
 * window is defined by *content*, not by a numeric position that shifts when
 * rows appear or disappear.
 *
 * Backed by the compound index { status, createdAt: -1, _id: -1 } (see
 * product.model.ts) so both the sort and the keyset predicate are index-served.
 */
export const getProductFeed = async (input: FeedInput): Promise<FeedResult> => {
    const limit = Math.min(
        Math.max(1, Math.floor(input.limit ?? DEFAULT_LIMIT)),
        MAX_LIMIT
    );

    // Public catalogue feed only surfaces approved products.
    const query: Record<string, any> = { status: "approved" };

    if (input.category) {
        if (!mongoose.isValidObjectId(input.category)) {
            throw new FeedError("Invalid category id");
        }
        query.category = input.category;
    }

    if (input.minPrice !== undefined || input.maxPrice !== undefined) {
        const price: Record<string, number> = {};
        if (input.minPrice !== undefined) {
            if (!Number.isFinite(input.minPrice) || input.minPrice < 0) {
                throw new FeedError("Invalid minPrice");
            }
            price.$gte = input.minPrice;
        }
        if (input.maxPrice !== undefined) {
            if (!Number.isFinite(input.maxPrice) || input.maxPrice < 0) {
                throw new FeedError("Invalid maxPrice");
            }
            price.$lte = input.maxPrice;
        }
        if (
            price.$gte !== undefined &&
            price.$lte !== undefined &&
            price.$gte > price.$lte
        ) {
            throw new FeedError("minPrice cannot exceed maxPrice");
        }
        query.price = price;
    }

    // Keyset predicate: everything strictly "after" the anchor in (createdAt DESC,
    // _id DESC) order. Kept in $and so it composes with the filters above without
    // clobbering any $or.
    if (input.cursor) {
        const anchor = await resolveAnchor(input.cursor);
        query.$and = [
            {
                $or: [
                    { createdAt: { $lt: anchor.createdAt } },
                    {
                        createdAt: anchor.createdAt,
                        _id: { $lt: anchor.id },
                    },
                ],
            },
        ];
    }

    // Fetch one extra to detect whether another page exists, without a count.
    const docs = await Product.find(query)
        .sort({ createdAt: -1, _id: -1 })
        .limit(limit + 1)
        .populate("brand category");

    const hasMore = docs.length > limit;
    const items = hasMore ? docs.slice(0, limit) : docs;

    const last = items[items.length - 1];
    const nextCursor =
        hasMore && last
            ? encodeCursor({
                  createdAt: (last as any).createdAt as Date,
                  id: last._id as mongoose.Types.ObjectId,
              })
            : null;

    return { items, nextCursor, hasMore };
};
