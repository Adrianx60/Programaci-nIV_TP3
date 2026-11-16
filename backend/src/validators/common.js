import { body } from "express-validator";

export const requiredText = (field, label, max) =>
  body(field)
    .isString()
    .withMessage(`${label} debe ser texto.`)
    .bail()
    .trim()
    .isLength({ min: 1, max })
    .withMessage(`${label} es obligatorio y admite hasta ${max} caracteres.`);
