# Diseño: Diagnóstico contable automatizado con IA

**Fecha:** 2026-09-09
**Proyecto:** Shalom Financial & Accounting — landing page
**Estado:** Aprobado por el usuario (pendiente revisión del spec)

## 1. Objetivo

Convertir el "diagnóstico contable gratis" (hoy un formulario que solo abre
WhatsApp) en una herramienta interactiva: el visitante responde un breve
cuestionario, pulsa **"Generar diagnóstico"**, y una IA produce un diagnóstico
personalizado que se muestra en pantalla. Luego puede enviarlo a Shalom por
WhatsApp y se le ofrece la asesoría de Julissa y su equipo.

Meta de negocio: captar leads más calificados y demostrar valor antes del
primer contacto.

## 2. Alcance

**Incluye:**
- Cuestionario paso a paso (wizard) de opción múltiple + datos de contacto.
- Backend serverless en Vercel que llama al endpoint OpenAI-compatible de
  NVIDIA (`gpt-oss-20b`) y devuelve el diagnóstico.
- Presentación del diagnóstico en pantalla.
- Botón de entrega por WhatsApp (deep link `wa.me`) al número de Shalom.
- Bloque CTA final: "Agenda tu asesoría con Julissa y su equipo".

**No incluye (fuera de alcance):**
- Envío por correo electrónico (requiere servicio de email; posible fase 2).
- WhatsApp Business API / envío automático server-side (solo deep link).
- Persistencia de leads en base de datos / CRM.
- Autenticación de usuarios.

## 3. Flujo del usuario

1. Clic en cualquier botón **"Quiero mi diagnóstico gratis"** (ya existen:
   `#hero-diagnostic-btn`, `#banner-diagnostic-btn`).
2. Se abre el **wizard** (dentro del modal existente, ampliado a varios pasos).
3. El usuario responde 7 preguntas de opción múltiple + nombre, empresa y
   WhatsApp.
4. Pulsa **"Generar diagnóstico"** → estado de carga ("Analizando tus
   respuestas…").
5. El frontend llama a `POST /api/diagnostico` con las respuestas.
6. Se muestra el **diagnóstico generado** en pantalla, con aviso legal.
7. Debajo:
   - Botón **"Enviar mi diagnóstico a Shalom por WhatsApp"**.
   - Bloque **CTA de asesoría** con Julissa y su equipo.

## 4. Cuestionario

Cada pregunta es de selección única salvo indicación. Valores enviados al
backend como texto legible.

1. **Tipo de negocio:** Persona física · EIRL · SRL · SA · Aún no formalizado
2. **Personas en nómina:** 0 · 1–5 · 6–20 · +20
3. **¿Llevas contabilidad formal hoy?:** Sí, con contador · Sí, yo mismo/Excel · No
4. **¿Al día con la DGII (ITBIS/ISR)?:** Al día · Con atrasos · No sé · No declaro
5. **¿Emites comprobantes fiscales (NCF) correctamente?:** Sí · A veces · No · No sé qué es
6. **¿Estados financieros actualizados?:** Sí, mensual · Solo anual · No
7. **Mayor preocupación ahora:** Multas/DGII · Ordenar finanzas · Nómina y TSS · Crecer/planificar · Otra

**Datos de contacto:** nombre (texto), empresa (texto), WhatsApp (tel).
Validación: todos requeridos antes de habilitar "Generar diagnóstico".

## 5. Generación con IA

- **Endpoint:** `https://integrate.api.nvidia.com/v1` (OpenAI-compatible),
  modelo `openai/gpt-oss-20b`. Configurable por env (`NVIDIA_BASE_URL`,
  `NVIDIA_MODEL`).
- **Prompt del sistema:** rol de asistente contable de Shalom para pymes en
  República Dominicana; tono cercano y profesional; español; NO inventar
  cifras; NO dar asesoría legal/fiscal definitiva; recomendar contactar al
  equipo para el detalle.
- **Prompt del usuario:** las 7 respuestas + nombre/empresa, con instrucción
  de estructura de salida.
- **Estructura de salida esperada (texto/markdown ligero):**
  1. Situación actual (2–3 frases).
  2. Riesgos u oportunidades detectados (viñetas).
  3. 3–4 recomendaciones concretas y accionables.
  4. Servicios de Shalom que aplican.
- **Aviso obligatorio** (añadido por el frontend, no por la IA): "Diagnóstico
  orientativo generado automáticamente. No sustituye la asesoría profesional
  de un contador."
- **Parámetros:** `temperature` moderada (~0.5), `max_tokens` acotado (~800)
  para controlar costo y longitud.

## 6. Entrega por WhatsApp + CTA

- **Número destino:** `18494836468` (constante `WHATSAPP_NUMBER` ya existente).
- **Mensaje prellenado** (deep link `wa.me`): saludo + nombre + empresa +
  resumen de las respuestas clave + "Generé mi diagnóstico en la web y quiero
  avanzar". (No se incrusta el texto completo de la IA para evitar mensajes
  excesivamente largos; el diagnóstico completo ya lo vio en pantalla.)
- **CTA de asesoría:** bloque visual con título "Agenda tu asesoría con Julissa
  y su equipo", texto breve y botón que abre WhatsApp con un mensaje de
  solicitud de asesoría.

## 7. Arquitectura

### Frontend
- Se extiende el modal actual (`#diagnostic-modal`) a un **wizard multipaso**
  en un **módulo nuevo** `js/diagnostico.js` (mantiene `main.js` enfocado);
  `main.js` solo lo inicializa.
- Estados: cuestionario → cargando → resultado / error.
- Sin dependencias nuevas en el navegador; JS vanilla como el resto del sitio.
- La key **nunca** está en el frontend.

### Backend (Vercel Serverless Function)
- Archivo `api/diagnostico.js` (Node.js runtime).
- Método `POST`, body JSON con las respuestas + contacto.
- Valida entrada (campos presentes, longitudes máximas).
- Llama al endpoint NVIDIA usando el **SDK `openai`** (con `baseURL` =
  `NVIDIA_BASE_URL`); lee `NVIDIA_API_KEY` de `process.env`.
- Devuelve `{ diagnostico: "..." }` o `{ error: "..." }` con código HTTP
  adecuado.
- CORS: mismo origen (no requiere apertura), pero se maneja explícitamente.

### Dependencias / configuración
- Nuevo `package.json` con dependencia `openai` (cliente OpenAI-compatible).
- Variables de entorno (en `.env` local y en el **panel de Vercel**):
  `NVIDIA_API_KEY`, `NVIDIA_BASE_URL`, `NVIDIA_MODEL`.

### Cambio en el despliegue
- Hoy el sitio se publica como **salida estática pre-construida**
  (`.vercel/output/`), que no ejecuta funciones.
- Se migra a un **proyecto Vercel estándar** (deploy conectado a GitHub o
  `vercel` sin `--prebuilt`): Vercel sirve los estáticos del repo y detecta
  automáticamente `api/diagnostico.js` como función serverless.
- Acción manual del usuario: registrar las variables de entorno en Vercel y
  confirmar que el proyecto despliega desde el repo (no prebuilt).

## 8. Flujo de datos

```
Navegador (wizard)
  --> POST /api/diagnostico  { respuestas, nombre, empresa, whatsapp }
        --> Función Vercel valida + arma prompt
              --> NVIDIA /v1/chat/completions  (Authorization: Bearer NVIDIA_API_KEY)
              <-- texto del diagnóstico
        <-- { diagnostico }
  <-- Render en pantalla + aviso
  --> (opcional) Botón WhatsApp: wa.me/18494836468?text=...
```

## 9. Manejo de errores

- **Validación fallida (400):** el frontend muestra qué falta; no llama a la IA.
- **Fallo del proveedor IA / timeout (502/504):** mensaje amable ("No pudimos
  generar tu diagnóstico ahora; escríbenos por WhatsApp y lo hacemos contigo")
  + botón de WhatsApp como salida garantizada. El lead no se pierde.
- **Respuesta vacía de la IA:** se trata como fallo del proveedor.
- **Timeout del frontend:** límite ~30 s; luego muestra el fallback de WhatsApp.

## 10. Seguridad y costo

- La API key vive solo en el backend (env var), nunca en el cliente ni en git
  (`.env` está en `.gitignore`).
- La key compartida en chat se considera **expuesta**; debe rotarse antes de
  producción.
- Validación y longitudes máximas de entrada para evitar prompts abusivos.
- `max_tokens` acotado para limitar costo por solicitud.
- Rate limiting básico: fuera de alcance en v1; anotado como mejora futura si
  hay abuso.

## 11. Pruebas

- **Backend:** invocar `/api/diagnostico` con respuestas de ejemplo (local vía
  `vercel dev`); verificar que devuelve texto y maneja errores (key inválida,
  body incompleto).
- **Frontend:** recorrer el wizard, generar diagnóstico, ver resultado, probar
  el fallback de error y el botón de WhatsApp.
- **Manual:** revisar que el diagnóstico sea coherente y en español para varias
  combinaciones de respuestas.

## 12. Criterios de aceptación

- [ ] El wizard recoge las 7 respuestas + contacto y valida antes de enviar.
- [ ] "Generar diagnóstico" produce un texto personalizado en pantalla en < 30 s.
- [ ] La API key no aparece en el frontend ni en el repo.
- [ ] Existe botón de WhatsApp con mensaje prellenado al número de Shalom.
- [ ] Existe bloque CTA de asesoría con Julissa y su equipo.
- [ ] Si la IA falla, el usuario recibe un mensaje claro y una salida por
      WhatsApp.
- [ ] El sitio sigue desplegándose correctamente en Vercel con la función activa.
