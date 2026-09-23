import { google } from "googleapis";
import { PRECIOS_FALLBACK, type FilaPrecio } from "./precios";

const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
// En Vercel, la clave privada se pega con \n literales; hay que convertirlos a saltos de linea reales.
const PRIVATE_KEY = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");

const TAB_PRECIOS = "Precios usados";
const TAB_LEADS = "Leads";

function credencialesConfiguradas() {
  return Boolean(SHEET_ID && CLIENT_EMAIL && PRIVATE_KEY);
}

// Algunas celdas del Sheet quedan cargadas como texto con coma decimal
// (ej. "0,95" en vez de 0.95), tal cual las tipea alguien manualmente.
// Number() no entiende la coma, asi que la normalizamos antes.
function parseNumero(valor: unknown): number {
  if (typeof valor === "number") return valor;
  if (typeof valor === "string") return Number(valor.trim().replace(",", "."));
  return NaN;
}

function getSheetsClient() {
  const auth = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

// Lee la pestana "Precios usados" tal como la arma el cliente: Modelo, Capacidad,
// >90%, 80/90%, <80%, Excelente, Muy bueno, A revisar. Si no hay credenciales
// configuradas (todavia no se compartio el Sheet real), usa los datos locales
// para que el sitio siga funcionando en desarrollo o en el primer deploy.
export async function getPrecios(): Promise<{ precios: FilaPrecio[]; fuente: "sheets" | "fallback" }> {
  if (!credencialesConfiguradas()) {
    return { precios: PRECIOS_FALLBACK, fuente: "fallback" };
  }

  try {
    const sheets = getSheetsClient();
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: SHEET_ID,
      range: `${TAB_PRECIOS}!A2:H`,
      // Sin esto, Sheets devuelve los valores ya formateados como texto
      // (ej. "80%" o "$80"), lo que rompe el Number() de mas abajo.
      valueRenderOption: "UNFORMATTED_VALUE",
    });

    const filas = res.data.values ?? [];
    const precios: FilaPrecio[] = filas
      .filter((fila) => fila[0])
      .map((fila) => ({
        modelo: String(fila[0]).trim(),
        capacidad: String(fila[1]).trim(),
        masDe90: parseNumero(fila[2]),
        entre80y90: parseNumero(fila[3]),
        menosDe80: parseNumero(fila[4]),
        excelente: parseNumero(fila[5]),
        muyBueno: parseNumero(fila[6]),
        aRevisar: parseNumero(fila[7]),
      }));

    if (precios.length === 0) {
      return { precios: PRECIOS_FALLBACK, fuente: "fallback" };
    }
    return { precios, fuente: "sheets" };
  } catch (error) {
    console.error("No se pudo leer Google Sheets, usando precios de respaldo:", error);
    return { precios: PRECIOS_FALLBACK, fuente: "fallback" };
  }
}

export interface Lead {
  modelo: string;
  capacidad: string;
  bateria: string;
  estado: string;
  precioEstimado: number;
  nombre: string;
  telefono: string;
}

// Agrega una fila a la pestana "Leads". Si todavia no hay credenciales
// configuradas, solo lo deja registrado en el log del server (no bloquea
// el flujo del usuario: igual puede seguir a WhatsApp).
// Devuelve el numero de fila donde quedo guardado, para poder despues
// marcar si esa persona efectivamente continuo por WhatsApp o no.
export async function appendLead(lead: Lead): Promise<{ guardado: boolean; fila: number | null }> {
  if (!credencialesConfiguradas()) {
    console.warn("GOOGLE_SHEET_ID / credenciales no configuradas. Lead no guardado:", lead);
    return { guardado: false, fila: null };
  }

  try {
    const sheets = getSheetsClient();
    const fecha = new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Cordoba" });
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: SHEET_ID,
      range: `${TAB_LEADS}!A:I`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        // La columna G (antes "Busca", pregunta que ya no existe) se
        // reutiliza para registrar si continuo la conversacion por
        // WhatsApp. Arranca en "No" y se actualiza a "Sí" desde
        // marcarClickWhatsapp() si hace click en el boton.
        values: [[
          fecha,
          lead.modelo,
          lead.capacidad,
          lead.bateria,
          lead.estado,
          lead.precioEstimado,
          "No",
          lead.nombre,
          lead.telefono,
        ]],
      },
    });

    // updatedRange llega como "Leads!A15:I15"; de ahi sacamos el numero de fila
    // (los caracteres no numericos entre el "!" y el primer digito son las
    // letras de columna, ej. "A").
    const rango = res.data.updates?.updatedRange ?? "";
    const match = rango.match(/!\D*(\d+)/);
    const fila = match ? Number(match[1]) : null;

    return { guardado: true, fila };
  } catch (error) {
    console.error("No se pudo guardar el lead en Google Sheets:", error);
    return { guardado: false, fila: null };
  }
}

// Actualiza la columna G de una fila puntual de "Leads" a "Sí", cuando
// la persona hace click en el boton de WhatsApp del resultado.
export async function marcarClickWhatsapp(fila: number): Promise<{ ok: boolean }> {
  if (!credencialesConfiguradas() || !Number.isInteger(fila) || fila < 2) {
    return { ok: false };
  }

  try {
    const sheets = getSheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${TAB_LEADS}!G${fila}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [["Sí"]] },
    });
    return { ok: true };
  } catch (error) {
    console.error("No se pudo marcar el click de WhatsApp en Google Sheets:", error);
    return { ok: false };
  }
}
