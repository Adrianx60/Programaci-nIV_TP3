import { Router } from "express";
import { pool } from "../config/db.js";
import { validate } from "../middlewares/validate.js";
import { HttpError } from "../utils/httpError.js";
import {
  idValidators,
  listQueryValidators,
} from "../validators/resources.js";

export function createResourceRouter({
  table,
  fields,
  validators,
  normalize = (values) => values,
}) {
  const router = Router();
  const columns = ["id", ...fields].map((field) => `\`${field}\``).join(", ");
  const tableName = `\`${table}\``;

  router.get("/", listQueryValidators, validate, async (req, res) => {
    const hasPagination =
      req.query.limit !== undefined || req.query.offset !== undefined;
    const sql = `SELECT ${columns} FROM ${tableName} ORDER BY id ASC${
      hasPagination ? " LIMIT ? OFFSET ?" : ""
    }`;
    const params = hasPagination
      ? [Number(req.query.limit) || 100, Number(req.query.offset) || 0]
      : [];
    const [rows] = await pool.execute(sql, params);
    res.json(rows);
  });

  router.get("/:id", idValidators, validate, async (req, res) => {
    const [rows] = await pool.execute(
      `SELECT ${columns} FROM ${tableName} WHERE id = ?`,
      [req.params.id],
    );
    if (rows.length === 0) {
      throw new HttpError(404, "Registro no encontrado.");
    }
    res.json(rows[0]);
  });

  router.post("/", validators, validate, async (req, res) => {
    const values = normalize(
      Object.fromEntries(fields.map((field) => [field, req.body[field]])),
    );
    const placeholders = fields.map(() => "?").join(", ");
    const [result] = await pool.execute(
      `INSERT INTO ${tableName} (${fields.map((field) => `\`${field}\``).join(", ")}) VALUES (${placeholders})`,
      fields.map((field) => values[field]),
    );
    const [rows] = await pool.execute(
      `SELECT ${columns} FROM ${tableName} WHERE id = ?`,
      [result.insertId],
    );
    res.status(201).json(rows[0]);
  });

  router.put("/:id", idValidators, validators, validate, async (req, res) => {
    const values = normalize(
      Object.fromEntries(fields.map((field) => [field, req.body[field]])),
    );
    const assignments = fields.map((field) => `\`${field}\` = ?`).join(", ");
    const [result] = await pool.execute(
      `UPDATE ${tableName} SET ${assignments} WHERE id = ?`,
      [...fields.map((field) => values[field]), req.params.id],
    );

    if (result.affectedRows === 0) {
      const [existing] = await pool.execute(
        `SELECT id FROM ${tableName} WHERE id = ?`,
        [req.params.id],
      );
      if (existing.length === 0) {
        throw new HttpError(404, "Registro no encontrado.");
      }
    }

    const [rows] = await pool.execute(
      `SELECT ${columns} FROM ${tableName} WHERE id = ?`,
      [req.params.id],
    );
    res.json(rows[0]);
  });

  router.delete("/:id", idValidators, validate, async (req, res) => {
    const [result] = await pool.execute(
      `DELETE FROM ${tableName} WHERE id = ?`,
      [req.params.id],
    );
    if (result.affectedRows === 0) {
      throw new HttpError(404, "Registro no encontrado.");
    }
    res.status(204).end();
  });

  return router;
}
