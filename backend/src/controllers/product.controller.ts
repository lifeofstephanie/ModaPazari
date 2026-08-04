import { Request, Response } from "express";
import Product from "../models/product.model";
import { getProductFeed, FeedError } from "../services/productFeed.service";

export const getFeed = async (req: Request, res: Response) => {
  try {
    const { cursor, limit, category, minPrice, maxPrice } = req.query;
    const result = await getProductFeed({
      cursor: cursor as string | undefined,
      limit: limit !== undefined ? Number(limit) : undefined,
      category: category as string | undefined,
      minPrice: minPrice !== undefined ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined ? Number(maxPrice) : undefined,
    });
    res.json(result);
  } catch (err: any) {
    const status = err instanceof FeedError ? err.status : 400;
    res.status(status).json({ message: err.message });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getProducts = async (_req: Request, res: Response) => {
  const products = await Product.find().populate("brand category");
  res.json(products);
};

export const getProductById = async (req: Request, res: Response) => {
  const product = await Product.findById(req.params.id).populate("brand category");
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

export const updateProduct = async (req: Request, res: Response) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
};

export const deleteProduct = async (req: Request, res: Response) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json({ message: "Product removed" });
};
