import { NextResponse } from "next/server";
import { appendLead, getPrecios } from "@/lib/sheets";
import { buscarFila, calcularPrecio, BATERIA_OPTS, ESTADO_OPTS, type TramoBateria, type TramoEstado } from "@/lib/precios";
import { validarNombre, validarTelefono } from "@/lib/validacion";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: "Cuerpo inválido." }, { status: 400 });
  }

  const { modelo, capacidad, bateria, estado, nombre, telefono } = body as Record<string, string>;

  if (!modelo || !capacidad || !bateria || !estado) {
    return NextResponse.json({ error: "Faltan datos de la cotización." }, { status: 400 });
  }
  if (!BATERIA_OPTS.some((o) => o.key === bateria) || !ESTADO_OPTS.some((o) => o.key === estado)) {
    return NextResponse.json({ error: "Opción inválida." }, { status: 400 });
  }

  const errorNombre = validarNombre(nombre ?? "");
  if (errorNombre) return NextResponse.json({ error: errorNombre }, { status: 400 });

  const errorTelefono = validarTelefono(telefono ?? "");
  if (errorTelefono) return NextResponse.json({ error: errorTelefono }, { status: 400 });

  // El precio se recalcula en el server con los datos reales de Sheets: nunca
  // se confia en un precio que venga del cliente.
  const { precios } = await getPrecios();
  const fila = buscarFila(precios, modelo, capacidad);
  if (!fila) {
    return NextResponse.json({ error: "No encontramos esa combinación de modelo y capacidad." }, { status: 400 });
  }
  const { final } = calcularPrecio(fila, bateria as TramoBateria, estado as TramoEstado);

  const estadoLabel = ESTADO_OPTS.find((o) => o.key === estado)?.title ?? estado;
  const bateriaLabel = BATERIA_OPTS.find((o) => o.key === bateria)?.label ?? bateria;

  const { guardado } = await appendLead({
    modelo,
    capacidad,
    bateria: bateriaLabel,
    estado: estadoLabel,
    precioEstimado: final,
    nombre: nombre.trim(),
    telefono: telefono.trim(),
  });

  return NextResponse.json({ precioEstimado: final, guardado });
}
