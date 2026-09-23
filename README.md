# Cotizador IBROS

Cotizador de recompra de iPhones usados para IBROS. Flujo de 6 pasos (modelo,
capacidad, batería, estado, búsqueda, contacto) que termina en un valor
estimado y un botón de WhatsApp con el resumen precargado.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind CSS v4
- Tipografías: Garet (local, licencia libre de Spacetype) + Montserrat + Open Sans (Google Fonts)
- Datos de precios y leads: Google Sheets, vía una service account de Google Cloud

## Correr en local

```bash
npm install
npm run dev
```

Sin el archivo `.env.local` configurado, el sitio funciona igual: usa los
precios de respaldo embebidos en `src/lib/precios.ts` y no guarda leads (solo
un warning en la consola del servidor). Es el mismo dataset que ya validamos
en el mockup.

## Conectar el Google Sheet real

1. Crear un proyecto en Google Cloud Console (con la cuenta que se prefiera,
   no necesita ser la del cliente) y habilitar la "Google Sheets API".
2. Crear una service account en ese proyecto y generar una clave JSON.
3. En el Google Sheet real del cliente (con las pestañas "Precios usados" y
   "Leads", mismo formato que `Cotizador_Base_Datos_Modelo.xlsx`), compartirlo
   como Editor con el email de la service account
   (`algo@proyecto.iam.gserviceaccount.com`).
4. Copiar `.env.local.example` a `.env.local` y completar:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL`: el email de la service account.
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`: el campo `private_key` del JSON descargado.
   - `GOOGLE_SHEET_ID`: el ID de la planilla (está en la URL, entre `/d/` y `/edit`).
5. Reiniciar `npm run dev`. La página empieza a leer y escribir en el Sheet real.

La pestaña "Precios usados" se lee con las columnas en este orden exacto:
Modelo, Capacidad, >90%, 80/90%, <80%, Excelente, Muy bueno, A revisar.

## Deploy a Vercel

1. Conectar el repo a Vercel (plan Hobby por ahora).
2. Cargar las mismas tres variables de entorno en Project Settings > Environment Variables.
3. Deploy. El botón de WhatsApp y el número de IBROS ya están cargados en
   `src/components/Cotizador.tsx` (`WHATSAPP_NUMERO`).

## Estructura relevante

- `src/lib/precios.ts` — tipos, datos de respaldo y funciones de cálculo de precio.
- `src/lib/sheets.ts` — lectura/escritura contra Google Sheets (con fallback local).
- `src/lib/validacion.ts` — validación de nombre y teléfono (se usa en el cliente y se repite en el server).
- `src/app/api/leads/route.ts` — recibe la cotización, revalida todo en el server y guarda el lead.
- `src/components/Cotizador.tsx` — todo el flujo de pasos del formulario.
- `src/components/IbrosLogo.tsx` / `IbrosBoton.tsx` — el isotipo de marca como componentes SVG recoloreables.
