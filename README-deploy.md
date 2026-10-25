# Despliegue en Vercel — Diagnóstico con IA

Este sitio incluye una función serverless (`api/diagnostico.js`). Debe
desplegarse como **proyecto Vercel estándar** (no como salida pre-construida),
para que Vercel detecte la carpeta `api/` y ejecute la función.

## Variables de entorno (Vercel → Project → Settings → Environment Variables)
- `GROQ_API_KEY` = (tu clave de Groq; **rotarla** si se expuso)

La base URL (`https://api.groq.com/openai/v1`) y el modelo (`openai/gpt-oss-20b`)
están fijos en `api/diagnostico.js`; no hace falta configurarlos.

Definirla para Production y Preview. NO subir `.env` a git (ya está ignorado).

## Configuración del proyecto
- Framework Preset: **Other**
- Build Command: (vacío)
- Output Directory: (raíz)
- Vercel instala dependencias desde `package.json` y detecta `api/` como funciones.

## Verificación
1. Deploy (push a `master` si el repo está conectado a Vercel, o `npx vercel --prod`).
2. Abrir el sitio, generar un diagnóstico y confirmar que aparece el texto.
3. Probar `POST /api/diagnostico` con un cuerpo válido y uno inválido (400).
