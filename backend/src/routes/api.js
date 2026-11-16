import { Router } from "express";
import { authenticate } from "../config/passport.js";
import authRouter from "./auth.js";
import { createResourceRouter } from "./resources.js";
import {
  conductorValidators,
  viajeValidators,
  vehiculoValidators,
} from "../validators/resources.js";

const router = Router();

router.use("/auth", authRouter);
router.use(
  "/vehiculos",
  authenticate,
  createResourceRouter({
    table: "vehiculos",
    fields: ["marca", "modelo", "patente", "anio", "capacidad_carga"],
    validators: vehiculoValidators,
  }),
);
router.use(
  "/conductores",
  authenticate,
  createResourceRouter({
    table: "conductores",
    fields: [
      "nombre",
      "apellido",
      "numero_documento",
      "numero_licencia",
      "fecha_alta_licencia",
      "fecha_vencimiento_licencia",
    ],
    validators: conductorValidators,
  }),
);
router.use(
  "/viajes",
  authenticate,
  createResourceRouter({
    table: "viajes",
    fields: [
      "vehiculo_id",
      "conductor_id",
      "fecha_salida",
      "fecha_llegada",
      "origen",
      "destino",
      "kilometros",
      "observaciones",
    ],
    validators: viajeValidators,
    normalize: (values) => ({
      ...values,
      fecha_salida: values.fecha_salida.replace("T", " "),
      fecha_llegada: values.fecha_llegada.replace("T", " "),
    }),
  }),
);

export default router;
