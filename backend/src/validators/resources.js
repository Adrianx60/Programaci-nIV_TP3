import { body, param, query } from "express-validator";
import { requiredText } from "./common.js";

const MAX_UNSIGNED_INT = 4294967295;

function isDateOnly(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  if (year < 1000 || month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isDateTime(value) {
  if (typeof value !== "string") return false;

  const match = /^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
    value,
  );
  if (!match || !isDateOnly(match[1])) return false;

  const [, , hours, minutes, seconds = "0"] = match;
  return (
    Number(hours) <= 23 &&
    Number(minutes) <= 59 &&
    Number(seconds) <= 59
  );
}

function dateTimeKey(value) {
  const normalized = value.replace(" ", "T");
  return normalized.length === 16 ? `${normalized}:00` : normalized;
}

const positiveInteger = (field, label, min, max = MAX_UNSIGNED_INT) =>
  body(field)
    .custom((value) => {
      if (typeof value === "string" && !/^\d+$/.test(value)) return false;
      if (typeof value !== "string" && typeof value !== "number") return false;
      const number = Number(value);
      return Number.isSafeInteger(number) && number >= min && number <= max;
    })
    .withMessage(`${label} no es válido.`)
    .bail()
    .toInt();

const positiveNumber = (field, label) =>
  body(field)
    .custom((value) => {
      if (typeof value === "string" && value.trim() === "") return false;
      if (typeof value !== "string" && typeof value !== "number") return false;
      return Number.isFinite(Number(value)) && Number(value) > 0;
    })
    .withMessage(`${label} debe ser un número mayor que cero.`)
    .bail()
    .toFloat();

export const idValidators = [
  param("id")
    .isInt({ min: 1, max: MAX_UNSIGNED_INT })
    .withMessage("El id debe ser un entero positivo válido.")
    .bail()
    .toInt(),
];

export const listQueryValidators = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage("limit debe ser un entero entre 1 y 500.")
    .bail()
    .toInt(),
  query("offset")
    .optional()
    .isInt({ min: 0 })
    .withMessage("offset debe ser un entero mayor o igual a cero.")
    .bail()
    .toInt(),
];

export const vehiculoValidators = [
  requiredText("marca", "La marca", 60),
  requiredText("modelo", "El modelo", 60),
  body("patente")
    .isString()
    .withMessage("La patente es obligatoria.")
    .bail()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage("La patente debe tener hasta 10 caracteres.")
    .bail()
    .toUpperCase(),
  positiveInteger(
    "anio",
    "El año del vehículo",
    1950,
    new Date().getFullYear() + 1,
  ),
  positiveNumber("capacidad_carga", "La capacidad de carga"),
];

export const conductorValidators = [
  requiredText("nombre", "El nombre", 80),
  requiredText("apellido", "El apellido", 80),
  requiredText("numero_documento", "El número de documento", 15),
  requiredText("numero_licencia", "El número de licencia", 20),
  body("fecha_alta_licencia")
    .isString()
    .withMessage("La fecha de alta de licencia es obligatoria.")
    .bail()
    .custom(isDateOnly)
    .withMessage("La fecha de alta debe tener formato AAAA-MM-DD."),
  body("fecha_vencimiento_licencia")
    .isString()
    .withMessage("La fecha de vencimiento de licencia es obligatoria.")
    .bail()
    .custom(isDateOnly)
    .withMessage("La fecha de vencimiento debe tener formato AAAA-MM-DD.")
    .bail()
    .custom((value, { req }) => {
      const startDate = req.body?.fecha_alta_licencia;
      return typeof startDate !== "string" || value > startDate;
    })
    .withMessage("El vencimiento debe ser posterior al alta de la licencia."),
];

export const viajeValidators = [
  positiveInteger("vehiculo_id", "El vehículo seleccionado", 1),
  positiveInteger("conductor_id", "El conductor seleccionado", 1),
  body("fecha_salida")
    .isString()
    .withMessage("La fecha de salida es obligatoria.")
    .bail()
    .custom(isDateTime)
    .withMessage("La fecha de salida no es válida."),
  body("fecha_llegada")
    .isString()
    .withMessage("La fecha de llegada es obligatoria.")
    .bail()
    .custom(isDateTime)
    .withMessage("La fecha de llegada no es válida.")
    .bail()
    .custom((value, { req }) => {
      const departure = req.body?.fecha_salida;
      if (typeof departure !== "string" || !isDateTime(departure)) return true;
      return dateTimeKey(value) >= dateTimeKey(departure);
    })
    .withMessage("La llegada debe ser igual o posterior a la salida."),
  requiredText("origen", "El origen", 120),
  requiredText("destino", "El destino", 120),
  positiveNumber("kilometros", "Los kilómetros"),
  body("observaciones")
    .optional({ nullable: true })
    .isString()
    .withMessage("Las observaciones deben ser texto.")
    .bail()
    .trim()
    .isLength({ max: 5000 })
    .withMessage("Las observaciones admiten hasta 5000 caracteres."),
];
