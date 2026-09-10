// Lógica pura del diagnóstico: validación de entrada y construcción del prompt.
// Sin dependencias externas para poder testear con node:test.

const CAMPOS_RESPUESTA = [
  "tipoNegocio", "empleados", "contabilidad",
  "dgii", "ncf", "estados", "preocupacion",
];
const CAMPOS_CONTACTO = ["nombre", "empresa", "whatsapp"];
const MAX_LEN = 120;

export function validateInput(body) {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "Cuerpo de la solicitud inválido." };
  }
  const { contacto, respuestas } = body;
  if (!contacto || typeof contacto !== "object") {
    return { ok: false, error: "Faltan los datos de contacto." };
  }
  for (const campo of CAMPOS_CONTACTO) {
    const valor = contacto[campo];
    if (typeof valor !== "string" || valor.trim() === "") {
      return { ok: false, error: `Falta el campo de contacto: ${campo}.` };
    }
    if (valor.length > MAX_LEN) {
      return { ok: false, error: `El campo ${campo} es demasiado largo.` };
    }
  }
  if (!respuestas || typeof respuestas !== "object") {
    return { ok: false, error: "Faltan las respuestas del cuestionario." };
  }
  for (const campo of CAMPOS_RESPUESTA) {
    const valor = respuestas[campo];
    if (typeof valor !== "string" || valor.trim() === "") {
      return { ok: false, error: `Falta responder: ${campo}.` };
    }
    if (valor.length > MAX_LEN) {
      return { ok: false, error: `La respuesta ${campo} es demasiado larga.` };
    }
  }
  return { ok: true };
}

const SYSTEM_PROMPT = `Eres el asistente contable de Shalom Financial & Accounting, una firma dominicana de contabilidad, impuestos y finanzas. Generas un diagnóstico contable ORIENTATIVO para pymes y profesionales en República Dominicana, en español, con tono cercano y profesional.
Reglas:
- No inventes cifras, montos ni datos que no te dieron.
- No des asesoría legal o fiscal definitiva; recomienda validar con el equipo de Shalom.
- Sé concreto y accionable. Usa terminología local (DGII, ITBIS, ISR, NCF, TSS).
- Máximo unas 250 palabras.
Devuelve exactamente estas cuatro secciones con estos encabezados en negrita:
**Situación actual**
**Riesgos y oportunidades**
**Recomendaciones**
**Cómo te ayuda Shalom**`;

export function buildMessages(body) {
  const c = body.contacto;
  const r = body.respuestas;
  const userPrompt = `Genera el diagnóstico para este negocio:
- Nombre de contacto: ${c.nombre}
- Empresa: ${c.empresa}
- Tipo de negocio: ${r.tipoNegocio}
- Personas en nómina: ${r.empleados}
- Lleva contabilidad formal: ${r.contabilidad}
- Estado con la DGII (ITBIS/ISR): ${r.dgii}
- Emite comprobantes fiscales (NCF): ${r.ncf}
- Estados financieros: ${r.estados}
- Mayor preocupación: ${r.preocupacion}`;
  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: userPrompt },
  ];
}
