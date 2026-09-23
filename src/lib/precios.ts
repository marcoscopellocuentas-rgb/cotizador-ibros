export type TramoBateria = "masDe90" | "entre80y90" | "menosDe80";
export type TramoEstado = "excelente" | "muyBueno" | "aRevisar";

export interface FilaPrecio {
  modelo: string;
  capacidad: string;
  masDe90: number;
  entre80y90: number;
  menosDe80: number;
  excelente: number;
  muyBueno: number;
  aRevisar: number;
}

// Respaldo local: se usa si las variables de entorno de Google Sheets no
// estan configuradas todavia, o si la llamada a la API de Sheets falla.
// Mantiene el sitio funcionando durante desarrollo y en el primer deploy.
export const PRECIOS_FALLBACK: FilaPrecio[] = [
  { modelo: "iPhone 11", capacidad: "64GB", masDe90: 80, entre80y90: 70, menosDe80: 60, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 11", capacidad: "128GB", masDe90: 110, entre80y90: 100, menosDe80: 90, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 11 PRO", capacidad: "64GB", masDe90: 130, entre80y90: 120, menosDe80: 110, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 11 PRO", capacidad: "256GB", masDe90: 140, entre80y90: 130, menosDe80: 120, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 11 PRO MAX", capacidad: "128GB", masDe90: 170, entre80y90: 160, menosDe80: 150, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 11 PRO MAX", capacidad: "256GB", masDe90: 200, entre80y90: 190, menosDe80: 180, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 12", capacidad: "64GB", masDe90: 110, entre80y90: 100, menosDe80: 90, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 12", capacidad: "128GB", masDe90: 130, entre80y90: 120, menosDe80: 110, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 12 PRO", capacidad: "128GB", masDe90: 170, entre80y90: 160, menosDe80: 150, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 12 PRO", capacidad: "256GB", masDe90: 230, entre80y90: 220, menosDe80: 210, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 12 PRO MAX", capacidad: "256GB", masDe90: 260, entre80y90: 250, menosDe80: 240, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 13", capacidad: "128GB", masDe90: 260, entre80y90: 240, menosDe80: 230, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 13", capacidad: "256GB", masDe90: 290, entre80y90: 270, menosDe80: 260, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 13 PRO", capacidad: "128GB", masDe90: 300, entre80y90: 280, menosDe80: 270, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 13 PRO MAX", capacidad: "128GB", masDe90: 340, entre80y90: 330, menosDe80: 320, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 13 PRO MAX", capacidad: "256GB", masDe90: 350, entre80y90: 340, menosDe80: 330, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 14", capacidad: "128GB", masDe90: 300, entre80y90: 270, menosDe80: 260, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 14 PLUS", capacidad: "128GB", masDe90: 290, entre80y90: 280, menosDe80: 260, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 14 PLUS", capacidad: "256GB", masDe90: 310, entre80y90: 300, menosDe80: 290, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 14 PRO", capacidad: "128GB", masDe90: 420, entre80y90: 410, menosDe80: 400, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 14 PRO", capacidad: "256GB", masDe90: 440, entre80y90: 430, menosDe80: 420, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 14 PRO MAX", capacidad: "128GB", masDe90: 460, entre80y90: 440, menosDe80: 430, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 14 PRO MAX", capacidad: "256GB", masDe90: 460, entre80y90: 440, menosDe80: 430, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 15", capacidad: "128GB", masDe90: 440, entre80y90: 420, menosDe80: 410, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 15 PLUS", capacidad: "128GB", masDe90: 440, entre80y90: 420, menosDe80: 410, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 15 PLUS", capacidad: "256GB", masDe90: 440, entre80y90: 420, menosDe80: 410, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 15 PRO", capacidad: "128GB", masDe90: 560, entre80y90: 550, menosDe80: 540, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 15 PRO", capacidad: "256GB", masDe90: 600, entre80y90: 580, menosDe80: 560, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 15 PRO MAX", capacidad: "128GB", masDe90: 630, entre80y90: 620, menosDe80: 610, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 16", capacidad: "128GB", masDe90: 550, entre80y90: 530, menosDe80: 510, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 16 PRO", capacidad: "128GB", masDe90: 660, entre80y90: 640, menosDe80: 630, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 16 PRO", capacidad: "256GB", masDe90: 680, entre80y90: 670, menosDe80: 660, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 16 PRO MAX", capacidad: "256GB", masDe90: 820, entre80y90: 810, menosDe80: 790, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
  { modelo: "iPhone 16 PRO MAX", capacidad: "512GB", masDe90: 840, entre80y90: 820, menosDe80: 810, excelente: 1, muyBueno: 0.95, aRevisar: 0.9 },
];

export function modelos(precios: FilaPrecio[]): string[] {
  const vistos = new Set<string>();
  const lista: string[] = [];
  for (const fila of precios) {
    if (!vistos.has(fila.modelo)) {
      vistos.add(fila.modelo);
      lista.push(fila.modelo);
    }
  }
  return lista;
}

export function capacidadesPorModelo(precios: FilaPrecio[], modelo: string): string[] {
  return precios.filter((f) => f.modelo === modelo).map((f) => f.capacidad);
}

export function buscarFila(precios: FilaPrecio[], modelo: string, capacidad: string): FilaPrecio | undefined {
  return precios.find((f) => f.modelo === modelo && f.capacidad === capacidad);
}

export function calcularPrecio(fila: FilaPrecio, bateria: TramoBateria, estado: TramoEstado) {
  const base = fila[bateria];
  const multiplicador = fila[estado];
  const final = Math.round(base * multiplicador);
  return { base, multiplicador, final };
}

export const BATERIA_OPTS: { key: TramoBateria; label: string }[] = [
  { key: "masDe90", label: "Más de 90%" },
  { key: "entre80y90", label: "Entre 80% y 90%" },
  { key: "menosDe80", label: "Menos de 80%" },
];

export const ESTADO_OPTS: { key: TramoEstado; title: string; desc: string }[] = [
  {
    key: "excelente",
    title: "Excelente",
    desc: "No presenta marcas ni rayas, funciona correctamente y todas sus partes son originales.",
  },
  {
    key: "muyBueno",
    title: "Muy bueno",
    desc: "Presenta algún detalle estético pero funciona correctamente y todas sus partes son originales.",
  },
  {
    key: "aRevisar",
    title: "Bueno",
    desc: "Presenta daños, alguna de sus partes no es original o no funciona correctamente.",
  },
];
