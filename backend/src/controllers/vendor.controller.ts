import { Response } from "express";
import Product from "../models/product.model";
import { AuthRequest } from "../middleware/auth";
import Order from "../models/order.model";

// Only these fields may be set by a vendor. `vendor` is forced from the token
// and `status` is forced to "pending" so a vendor can't self-approve a listing.
const pickProductFields = (body: any) => ({
  name: body.name,
  description: body.description,
  price: body.price,
  stock: body.stock,
  images: body.images,
  brand: body.brand,
  category: body.category,
});

export const createProduct = async (req: AuthRequest, res: Response) => {
  const product = await Product.create({
    ...pickProductFields(req.body),
    vendor: req.user?._id,
    status: "pending",
  });
  res.status(201).json(product);
};

export const updateProduct = async (req: AuthRequest, res: Response) => {
  const product = await Product.findOneAndUpdate(
    { _id: req.params.id, vendor: req.user?._id },
    pickProductFields(req.body),
    { new: true, runValidators: true }
  );

  if (!product) {
    return res.status(404).json({ message: "product not found" });
  }
  res.json(product);
};

export const deleteProduct = async (req: AuthRequest, res: Response) => {
  const product = await Product.findOneAndDelete({
    _id: req.params.id,
    vendor: req.user?._id,
  });
  if (!product) {
    return res.status(404).json({ message: "product not found" });
  }
  res.json({ message: "product deleted" });
};

export const getVendorProducts = async (req: AuthRequest, res: Response) => {
  const products = await Product.find({ vendor: req.user?._id });
  res.json(products);
};

export const getVendorOrders = async (req: AuthRequest, res: Response) => {
  // Orders don't carry a vendor field, so first resolve this vendor's product
  // ids, then find orders containing any of them.
  const productIds = await Product.find({ vendor: req.user?._id }).distinct(
    "_id"
  );

  const orders = await Order.find({ "orderItems.product": { $in: productIds } })
    .populate("buyer")
    .populate("orderItems.product");

  res.json(orders);
};
