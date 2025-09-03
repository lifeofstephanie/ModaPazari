import { Request, Response } from "express";
import Brand from "../models/brand.model";

export const createBrand = async (req: Request, res: Response) => {
  try {
    const brand = new Brand(req.body);
    await brand.save();
    res.status(201).json(brand);
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export const getBrands = async (_req: Request, res: Response) => {
  const brands = await Brand.find();
  res.json(brands);
};

export const updateBrand = async (req: Request, res: Response) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!brand) return res.status(404).json({ message: "Brand not found" });
  res.json(brand);
};

export const deleteBrand = async (req: Request, res: Response) => {
  const brand = await Brand.findByIdAndDelete(req.params.id);
  if (!brand) return res.status(404).json({ message: "Brand not found" });
  res.json({ message: "Brand removed" });
};
