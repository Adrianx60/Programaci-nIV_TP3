import { body } from "express-validator";
import { requiredText } from "./common.js";

const validEmail = () =>
  body("email")
    .isString()
    .withMessage("El correo electrónico es obligatorio.")
    .bail()
    .trim()
    .isEmail()
    .withMessage("El correo electrónico no es válido.")
    .bail()
    .isLength({ max: 150 })
    .withMessage("El correo electrónico admite hasta 150 caracteres.")
    .bail()
    .toLowerCase();

export const authRegisterValidators = [
  requiredText("nombre", "El nombre", 100),
  validEmail(),
  body("contrasena")
    .isString()
    .withMessage("La contraseña es obligatoria.")
    .bail()
    .isLength({ min: 8, max: 72 })
    .withMessage("La contraseña debe tener entre 8 y 72 caracteres.")
    .bail()
    .custom((value) => Buffer.byteLength(value, "utf8") <= 72)
    .withMessage("La contraseña supera el máximo admitido por bcrypt."),
];

export const authLoginValidators = [
  validEmail(),
  body("contrasena")
    .isString()
    .withMessage("La contraseña es obligatoria.")
    .bail()
    .isLength({ min: 1, max: 72 })
    .withMessage("La contraseña no es válida.")
    .bail()
    .custom((value) => Buffer.byteLength(value, "utf8") <= 72)
    .withMessage("La contraseña no es válida."),
];
