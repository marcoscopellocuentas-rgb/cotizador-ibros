import { NextResponse } from "next/server";
import { marcarClickWhatsapp } from "@/lib/sheets";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const fila = body?.fila;

  if (!Number.isInteger(fila) || fila < 2) {
    return NextResponse.json({ error: "Fila inválida." }, { status: 400 });
  }

  const { ok } = await marcarClickWhatsapp(fila);
  return NextResponse.json({ ok });
}
