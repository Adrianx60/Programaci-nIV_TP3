import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/db.js";
import { jwtSecret } from "../config/jwt.js";
import { HttpError } from "../utils/httpError.js";
import { validate } from "../middlewares/validate.js";
import {
  authLoginValidators,
  authRegisterValidators,
} from "../validators/auth.js";

const router = Router();
const BCRYPT_ROUNDS = 12;

router.post(
  "/register",
  authRegisterValidators,
  validate,
  async (req, res) => {
    const passwordHash = await bcrypt.hash(req.body.contrasena, BCRYPT_ROUNDS);
    const [result] = await pool.execute(
      "INSERT INTO usuarios (nombre, email, contrasena) VALUES (?, ?, ?)",
      [req.body.nombre, req.body.email, passwordHash],
    );

    res.status(201).json({
      usuario: {
        id: result.insertId,
        nombre: req.body.nombre,
        email: req.body.email,
      },
    });
  },
);

router.post("/login", authLoginValidators, validate, async (req, res) => {
  const [users] = await pool.execute(
    "SELECT id, nombre, email, contrasena FROM usuarios WHERE email = ?",
    [req.body.email],
  );
  const user = users[0];
  const validPassword =
    user && (await bcrypt.compare(req.body.contrasena, user.contrasena));

  if (!validPassword) {
    throw new HttpError(401, "Correo electrónico o contraseña incorrectos.");
  }

  const usuario = { id: user.id, nombre: user.nombre, email: user.email };
  const token = jwt.sign({ sub: String(user.id) }, jwtSecret, {
    expiresIn: "4h",
  });

  res.json({ token, usuario });
});

export default router;
