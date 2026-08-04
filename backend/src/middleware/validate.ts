import { Request, Response, NextFunction } from "express";
import { ObjectSchema } from "joi";

/**
 * Validates req.body against a Joi schema before the controller runs.
 * `stripUnknown` drops fields the schema doesn't declare, which also closes
 * mass-assignment (e.g. a client trying to smuggle `role` or `status`).
 */
export const validateBody =
  (schema: ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    if (error) {
      return res.status(400).json({
        message: "Validation failed",
        errors: error.details.map((d) => ({ field: d.path.join("."), msg: d.message })),
      });
    }
    req.body = value;
    next();
  };
