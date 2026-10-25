import { test } from "node:test";
import assert from "node:assert/strict";
import { createHandler } from "./diagnostico-handler.js";

function fakeRes() {
  return {
    statusCode: 0,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    json(obj) { this.payload = obj; return this; },
  };
}

const validBody = {
  contacto: { nombre: "Ana", empresa: "Acme", whatsapp: "8090000000" },
  respuestas: {
    tipoNegocio: "SRL", empleados: "1–5", contabilidad: "No",
    dgii: "Con atrasos", ncf: "A veces", estados: "Solo anual",
    preocupacion: "Ordenar finanzas",
  },
};

test("responde 405 si no es POST", async () => {
  const res = fakeRes();
  await createHandler({})({ method: "GET", body: {} }, res);
  assert.equal(res.statusCode, 405);
});

test("responde 400 si el cuerpo es inválido", async () => {
  const res = fakeRes();
  await createHandler({})({ method: "POST", body: {} }, res);
  assert.equal(res.statusCode, 400);
});

test("responde 200 con el diagnóstico cuando la IA responde", async () => {
  const client = { chat: { completions: {
    create: async () => ({ choices: [{ message: { content: "Diagnóstico de prueba" } }] }),
  } } };
  const res = fakeRes();
  await createHandler(client)({ method: "POST", body: validBody }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.diagnostico, "Diagnóstico de prueba");
});

test("responde 502 si la IA devuelve vacío", async () => {
  const client = { chat: { completions: {
    create: async () => ({ choices: [{ message: { content: "" } }] }),
  } } };
  const res = fakeRes();
  await createHandler(client)({ method: "POST", body: validBody }, res);
  assert.equal(res.statusCode, 502);
});

test("responde 502 si la IA lanza error", async () => {
  const client = { chat: { completions: {
    create: async () => { throw new Error("boom"); },
  } } };
  const res = fakeRes();
  await createHandler(client)({ method: "POST", body: validBody }, res);
  assert.equal(res.statusCode, 502);
});

test("responde 429 cuando una IP excede el límite", async () => {
  const { createRateLimiter } = await import("./rate-limit.js");
  const client = { chat: { completions: {
    create: async () => ({ choices: [{ message: { content: "ok" } }] }),
  } } };
  const handler = createHandler(client, { rateLimiter: createRateLimiter({ max: 2 }) });
  const req = { method: "POST", body: validBody, headers: { "x-forwarded-for": "1.2.3.4" } };
  const codes = [];
  for (let i = 0; i < 3; i++) {
    const res = fakeRes();
    await handler(req, res);
    codes.push(res.statusCode);
  }
  assert.deepEqual(codes, [200, 200, 429]);
});
