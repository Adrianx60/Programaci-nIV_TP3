import assert from "node:assert/strict";
import { after, test } from "node:test";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import {
  viajeValidators,
  vehiculoValidators,
} from "../src/validators/resources.js";
import { pool } from "../src/config/db.js";

const testSecret = "test-only-secret-that-is-at-least-32-bytes";
process.env.JWT_SECRET = testSecret;

const { default: app } = await import("../src/app.js");
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}/api`;

async function withMockedExecute(mock, callback) {
  const originalExecute = pool.execute;
  pool.execute = mock;
  try {
    return await callback();
  } finally {
    pool.execute = originalExecute;
  }
}

after(
  () =>
    new Promise((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    }),
);

test("health endpoint reports the API as available", async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

test("registration rejects invalid input without touching the database", async () => {
  const response = await fetch(`${baseUrl}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre: "",
      email: "not-an-email",
      contrasena: "short",
    }),
  });

  assert.equal(response.status, 400);
  const payload = await response.json();
  assert.equal(payload.error, "Datos inválidos");
  assert.ok(payload.detalles.length >= 3);
});

test("registration stores a bcrypt hash and never returns it", async () => {
  let insertedValues;
  const response = await withMockedExecute(
    async (sql, values) => {
      assert.match(sql, /^INSERT INTO usuarios/);
      insertedValues = values;
      return [{ insertId: 41 }, []];
    },
    () =>
      fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre: "Ana Pérez",
          email: "ANA@example.com",
          contrasena: "una-clave-segura-123",
        }),
      }),
  );

  assert.equal(response.status, 201);
  const payload = await response.json();
  assert.deepEqual(payload, {
    usuario: { id: 41, nombre: "Ana Pérez", email: "ana@example.com" },
  });
  assert.notEqual(insertedValues[2], "una-clave-segura-123");
  assert.equal(
    await bcrypt.compare("una-clave-segura-123", insertedValues[2]),
    true,
  );
});

test("login issues a four-hour JWT without returning the password hash", async () => {
  const passwordHash = await bcrypt.hash("una-clave-segura-123", 4);
  const response = await withMockedExecute(
    async (sql) => {
      assert.match(sql, /^SELECT id, nombre, email, contrasena FROM usuarios/);
      return [
        [
          {
            id: 41,
            nombre: "Ana Pérez",
            email: "ana@example.com",
            contrasena: passwordHash,
          },
        ],
        [],
      ];
    },
    () =>
      fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "ANA@example.com",
          contrasena: "una-clave-segura-123",
        }),
      }),
  );

  assert.equal(response.status, 200);
  const payload = await response.json();
  const claims = jwt.verify(payload.token, testSecret);
  assert.equal(claims.sub, "41");
  assert.equal(claims.exp - claims.iat, 4 * 60 * 60);
  assert.deepEqual(payload.usuario, {
    id: 41,
    nombre: "Ana Pérez",
    email: "ana@example.com",
  });
  assert.equal(Object.hasOwn(payload, "contrasena"), false);
});

test("vehicle validation accepts the numeric JSON values sent by React", async () => {
  const req = {
    body: {
      marca: "Mercedes-Benz",
      modelo: "Atego",
      patente: "AB123CD",
      anio: 2022,
      capacidad_carga: 2500,
    },
    params: {},
    query: {},
  };
  for (const validator of vehiculoValidators) await validator.run(req);

  assert.equal(validationResult(req).isEmpty(), true);
  assert.equal(req.body.anio, 2022);
  assert.equal(req.body.capacidad_carga, 2500);
});

test("trip validation rejects arrival before departure", async () => {
  const req = {
    body: {
      vehiculo_id: 1,
      conductor_id: 2,
      fecha_salida: "2026-01-02 12:00:00",
      fecha_llegada: "2026-01-02 11:59:00",
      origen: "La Rioja",
      destino: "Córdoba",
      kilometros: 300,
      observaciones: null,
    },
    params: {},
    query: {},
  };
  for (const validator of viajeValidators) await validator.run(req);

  assert.ok(
    validationResult(req)
      .array()
      .some((error) => error.msg === "La llegada debe ser igual o posterior a la salida."),
  );
});

test("protected CRUD endpoints reject requests without a JWT", async () => {
  const response = await fetch(`${baseUrl}/vehiculos`);
  assert.equal(response.status, 401);
});

test("authenticated vehicle list returns API rows", async () => {
  const token = jwt.sign({ sub: "41" }, testSecret, { expiresIn: "4h" });
  const vehicle = {
    id: 9,
    marca: "Mercedes-Benz",
    modelo: "Atego",
    patente: "AB123CD",
    anio: 2022,
    capacidad_carga: "2500.00",
  };
  const response = await withMockedExecute(
    async (sql) => {
      if (sql.startsWith("SELECT id, nombre, email FROM usuarios")) {
        return [[{ id: 41, nombre: "Ana Pérez", email: "ana@example.com" }], []];
      }
      assert.match(sql, /FROM `vehiculos` ORDER BY id ASC LIMIT \? OFFSET \?$/);
      return [[vehicle], []];
    },
    () =>
      fetch(`${baseUrl}/vehiculos?limit=1&offset=0`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), [vehicle]);
});

test("vehicle create, unchanged update, and delete return REST responses", async () => {
  const token = jwt.sign({ sub: "41" }, testSecret, { expiresIn: "4h" });
  const vehicleValues = {
    marca: "Mercedes-Benz",
    modelo: "Atego",
    patente: "ab123cd",
    anio: 2022,
    capacidad_carga: 2500,
  };
  let vehicle;
  const response = await withMockedExecute(
    async (sql, values) => {
      if (sql.startsWith("SELECT id, nombre, email FROM usuarios")) {
        return [[{ id: 41, nombre: "Ana Pérez", email: "ana@example.com" }], []];
      }
      if (sql.startsWith("INSERT INTO `vehiculos`")) {
        vehicle = {
          id: 55,
          marca: values[0],
          modelo: values[1],
          patente: values[2],
          anio: values[3],
          capacidad_carga: values[4],
        };
        return [{ insertId: vehicle.id }, []];
      }
      if (sql.startsWith("UPDATE `vehiculos`")) {
        return [{ affectedRows: 0 }, []];
      }
      if (sql.startsWith("SELECT id FROM `vehiculos`")) {
        return [vehicle ? [{ id: vehicle.id }] : [], []];
      }
      if (sql.startsWith("SELECT `id`, `marca`")) {
        return [vehicle ? [vehicle] : [], []];
      }
      if (sql.startsWith("DELETE FROM `vehiculos`")) {
        vehicle = null;
        return [{ affectedRows: 1 }, []];
      }
      throw new Error(`Unexpected SQL in test: ${sql}`);
    },
    async () => {
      const createResponse = await fetch(`${baseUrl}/vehiculos`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vehicleValues),
      });
      assert.equal(createResponse.status, 201);
      const createdVehicle = await createResponse.json();
      assert.equal(createdVehicle.patente, "AB123CD");

      const updateResponse = await fetch(`${baseUrl}/vehiculos/55`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...vehicleValues, patente: "AB123CD" }),
      });
      assert.equal(updateResponse.status, 200);
      assert.equal((await updateResponse.json()).id, 55);

      return fetch(`${baseUrl}/vehiculos/55`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    },
  );

  assert.equal(response.status, 204);
  assert.equal(vehicle, null);
});

test("malformed JSON receives a 400 response", async () => {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: '{"email":',
  });

  assert.equal(response.status, 400);
});
