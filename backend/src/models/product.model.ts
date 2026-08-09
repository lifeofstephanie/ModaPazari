import mongoose, { Document, Schema } from 'mongoose'

export interface IProduct extends Document {
    name:string;
    description:string;
    price:number;
    brand:mongoose.Types.ObjectId;
    category:mongoose.Types.ObjectId;
    // Aggregate stock. For sized products this is kept in sync as the sum of
    // the per-size variant stocks; for non-sized products it's the source of truth.
    stock:number;
    vendor:mongoose.Types.ObjectId;
    images:string[];
    // Available colours (hex or CSS colour names). Optional.
    colors:string[];
    // Per-size stock. When non-empty, the product is sold by size and stock is
    // tracked at this level; when empty, the flat `stock` field is used.
    variants:{ size:string; stock:number }[];
    // Top-level department the buyer browses by.
    department:'clothes'|'accessories'|'footwear'|'bags'|'jewelry'|'beauty'|'other';
    // Season — only meaningful for clothes; 'none' otherwise.
    season:'winter'|'summer'|'autumn'|'spring'|'none';
    status:'pending'|'approved'|'rejected'
}

export const DEPARTMENTS = [
    'clothes','accessories','footwear','bags','jewelry','beauty','other',
] as const;
export const SEASONS = ['winter','summer','autumn','spring','none'] as const;

const productSchema = new Schema<IProduct>(
    {
        name:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        price:{
            type:Number,
            required:true,
            min:0
        },
        stock:{
            type:Number,
            required:true,
            min:0
        },
        images:[{type:String}],
        colors:[{type:String}],
        variants:[
            {
                size:{ type:String, required:true },
                stock:{ type:Number, default:0, min:0 },
                _id:false
            }
        ],
        department:{
            type:String,
            enum:['clothes','accessories','footwear','bags','jewelry','beauty','other'],
            default:'other',
            index:true
        },
        season:{
            type:String,
            enum:['winter','summer','autumn','spring','none'],
            default:'none'
        },
        category:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Category'
        },
        brand:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Brand'
        },
        vendor:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        status:{
            type:String,
            enum:['pending', 'approved','rejected'],
            default:'pending'
        }
    },
    {timestamps:true}
)

// Feed indexes: the compound (createdAt, _id) suffix serves both the DESC sort
// and the keyset predicate for GET /products/feed. The leading field matches the
// common filter so each is a single index scan.
productSchema.index({ status: 1, createdAt: -1, _id: -1 })
productSchema.index({ category: 1, createdAt: -1, _id: -1 })
// Vendor catalogue lookups (getVendorProducts / distinct vendor product ids).
productSchema.index({ vendor: 1 })

export default mongoose.model('Product', productSchema)