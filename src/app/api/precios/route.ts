import { NextResponse } from "next/server";
import { getPrecios } from "@/lib/sheets";

export const dynamic = "force-dynamic";

export async function GET() {
  const { precios, fuente } = await getPrecios();
  return NextResponse.json({ precios, fuente });
}
