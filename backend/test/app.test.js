import assert from "node:assert/strict";
import { after, test } from "node:test";

process.env.JWT_SECRET = "test-only-secret-that-is-at-least-32-bytes";

const { default: app } = await import("../src/app.js");
const server = app.listen(0, "127.0.0.1");
await new Promise((resolve) => server.once("listening", resolve));
const address = server.address();
const baseUrl = `http://127.0.0.1:${address.port}/api`;

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

test("malformed JSON receives a 400 response", async () => {
  const response = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: '{"email":',
  });

  assert.equal(response.status, 400);
});
