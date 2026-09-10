import { test } from "node:test";
import assert from "node:assert/strict";
import { validateInput, buildMessages } from "./diagnostico-core.js";

const validBody = {
  contacto: { nombre: "Ana", empresa: "Acme", whatsapp: "8090000000" },
  respuestas: {
    tipoNegocio: "SRL", empleados: "1–5", contabilidad: "No",
    dgii: "Con atrasos", ncf: "A veces", estados: "Solo anual",
    preocupacion: "Ordenar finanzas",
  },
};

test("validateInput acepta un cuerpo completo", () => {
  assert.deepEqual(validateInput(validBody), { ok: true });
});

test("validateInput rechaza contacto faltante", () => {
  const r = validateInput({ respuestas: validBody.respuestas });
  assert.equal(r.ok, false);
});

test("validateInput rechaza una respuesta faltante", () => {
  const respuestas = { ...validBody.respuestas };
  delete respuestas.dgii;
  const r = validateInput({ contacto: validBody.contacto, respuestas });
  assert.equal(r.ok, false);
});

test("validateInput rechaza valores demasiado largos", () => {
  const respuestas = { ...validBody.respuestas, tipoNegocio: "x".repeat(200) };
  const r = validateInput({ contacto: validBody.contacto, respuestas });
  assert.equal(r.ok, false);
});

test("buildMessages arma system + user con los datos", () => {
  const msgs = buildMessages(validBody);
  assert.equal(msgs.length, 2);
  assert.equal(msgs[0].role, "system");
  assert.equal(msgs[1].role, "user");
  assert.match(msgs[1].content, /Acme/);
  assert.match(msgs[1].content, /Con atrasos/);
});
