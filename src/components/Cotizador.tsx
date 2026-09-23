"use client";

import { useMemo, useState } from "react";
import IbrosLogo from "./IbrosLogo";
import {
  BATERIA_OPTS,
  BUSCA_OPTS,
  ESTADO_OPTS,
  buscarFila,
  calcularPrecio,
  capacidadesPorModelo,
  modelos,
  type BuscaKey,
  type FilaPrecio,
  type TramoBateria,
  type TramoEstado,
} from "@/lib/precios";
import { validarNombre, validarTelefono } from "@/lib/validacion";

const TOTAL_STEPS = 6;
const STEP_LABELS = ["Modelo", "Capacidad", "Batería", "Estado", "Búsqueda", "Contacto"];
const WHATSAPP_NUMERO = "5493513571526";
const INSTAGRAM_USUARIO = "ibros_cba";

type EstadoFormulario = {
  modelo: string | null;
  capacidad: string | null;
  bateria: TramoBateria | null;
  estado: TramoEstado | null;
  busca: BuscaKey | null;
  nombre: string;
  telefono: string;
};

const ESTADO_INICIAL: EstadoFormulario = {
  modelo: null,
  capacidad: null,
  bateria: null,
  estado: null,
  busca: null,
  nombre: "",
  telefono: "",
};

function OptionButton({
  title,
  desc,
  selected,
  onClick,
  center,
}: {
  title: string;
  desc?: string;
  selected: boolean;
  onClick: () => void;
  center?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex flex-col gap-1 rounded-xl border-[1.5px] px-3.5 py-3.5 text-left transition-colors
        ${selected ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]" : "border-[var(--color-border-strong)] bg-[var(--color-surface-2)] hover:border-[var(--color-accent)]"}`}
    >
      <span
        className={`font-[family-name:var(--font-label)] font-bold text-[0.92rem] ${center ? "w-full text-center" : ""} ${selected ? "text-[var(--color-accent)]" : ""}`}
      >
        {title}
      </span>
      {desc && <span className="font-[family-name:var(--font-body)] text-[0.8rem] leading-snug text-[var(--color-text-muted)]">{desc}</span>}
    </button>
  );
}

export default function Cotizador({ preciosIniciales }: { preciosIniciales: FilaPrecio[] }) {
  const [precios] = useState<FilaPrecio[]>(preciosIniciales);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<EstadoFormulario>(ESTADO_INICIAL);
  const [tocado, setTocado] = useState({ nombre: false, telefono: false });
  const [enviando, setEnviando] = useState(false);
  const [errorEnvio, setErrorEnvio] = useState<string | null>(null);
  const [resultado, setResultado] = useState<number | null>(null);

  const listaModelos = useMemo(() => modelos(precios), [precios]);
  const listaCapacidades = useMemo(
    () => (form.modelo ? capacidadesPorModelo(precios, form.modelo) : []),
    [precios, form.modelo]
  );

  const filaActual = form.modelo && form.capacidad ? buscarFila(precios, form.modelo, form.capacidad) : undefined;
  const detalle =
    filaActual && form.bateria && form.estado ? calcularPrecio(filaActual, form.bateria, form.estado) : null;

  const bateriaLabel = BATERIA_OPTS.find((o) => o.key === form.bateria)?.label ?? null;
  const estadoOpt = ESTADO_OPTS.find((o) => o.key === form.estado) ?? null;
  const buscaLabel = BUSCA_OPTS.find((o) => o.key === form.busca)?.title ?? null;

  const errorNombre = tocado.nombre ? validarNombre(form.nombre) : null;
  const errorTelefono = tocado.telefono ? validarTelefono(form.telefono) : null;

  function canAdvance(): boolean {
    switch (step) {
      case 0:
        return !!form.modelo;
      case 1:
        return !!form.capacidad;
      case 2:
        return !!form.bateria;
      case 3:
        return !!form.estado;
      case 4:
        return !!form.busca;
      case 5:
        return !validarNombre(form.nombre) && !validarTelefono(form.telefono);
      default:
        return true;
    }
  }

  function actualizar<K extends keyof EstadoFormulario>(campo: K, valor: EstadoFormulario[K]) {
    setForm((prev) => {
      const next = { ...prev, [campo]: valor };
      if (campo === "modelo") {
        const capacidadesValidas = capacidadesPorModelo(precios, valor as string);
        if (!capacidadesValidas.includes(prev.capacidad ?? "")) {
          next.capacidad = null;
        }
      }
      return next;
    });
  }

  async function handleVerResultado() {
    setTocado({ nombre: true, telefono: true });
    if (validarNombre(form.nombre) || validarTelefono(form.telefono)) return;

    setEnviando(true);
    setErrorEnvio(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorEnvio(data.error ?? "No pudimos calcular tu cotización. Probá de nuevo.");
        return;
      }
      setResultado(data.precioEstimado);
      setStep(TOTAL_STEPS);
    } catch {
      setErrorEnvio("No pudimos conectar con el servidor. Probá de nuevo en un momento.");
    } finally {
      setEnviando(false);
    }
  }

  function reiniciar() {
    setForm(ESTADO_INICIAL);
    setTocado({ nombre: false, telefono: false });
    setResultado(null);
    setErrorEnvio(null);
    setStep(0);
  }

  function railValor(idx: number): string | null {
    switch (idx) {
      case 0:
        return form.modelo;
      case 1:
        return form.capacidad;
      case 2:
        return bateriaLabel;
      case 3:
        return estadoOpt?.title ?? null;
      case 4:
        return buscaLabel;
      case 5:
        return form.nombre ? `${form.nombre}${form.telefono ? " · " + form.telefono : ""}` : null;
      default:
        return null;
    }
  }

  const mensajeWhatsapp =
    resultado !== null
      ? `Hola! Coticé mi equipo en la web:\n` +
        `• Modelo: ${form.modelo} ${form.capacidad}\n` +
        `• Batería: ${bateriaLabel}\n` +
        `• Estado general: ${estadoOpt?.title}\n` +
        `• Estoy buscando: ${buscaLabel}\n` +
        `• Valor estimado: USD ${resultado.toLocaleString("es-AR")}\n` +
        `• Nombre: ${form.nombre}\n` +
        `• Teléfono: ${form.telefono}\n\n` +
        `Quiero coordinar la revisión del equipo.`
      : "";

  return (
    <div className="mx-auto flex h-full max-w-[1100px] flex-col px-4 sm:px-6">
      <header className="flex flex-none items-center gap-3 py-3 sm:py-4">
        <div className="flex items-center gap-2.5">
          <IbrosLogo className="h-10 w-auto text-[var(--color-text)] md:h-12" />
          <span className="h-4 w-px flex-none bg-[var(--color-border)] md:h-[22px]" />
          <span className="font-[family-name:var(--font-label)] text-[0.7rem] font-bold uppercase tracking-[0.1em] text-[var(--color-text-muted)]">
            Cotizador
          </span>
        </div>

        {step < TOTAL_STEPS && (
          <div className="flex flex-1 gap-1.5 md:hidden">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-[var(--color-border)]">
                <div
                  className="h-full bg-[var(--color-accent)] transition-all duration-200"
                  style={{ width: i <= step ? "100%" : "0%" }}
                />
              </div>
            ))}
          </div>
        )}

        <div className="whitespace-nowrap text-xs text-[var(--color-text-muted)] md:hidden">
          {step < TOTAL_STEPS ? `${step + 1} / ${TOTAL_STEPS}` : "Listo"}
        </div>
      </header>

      <main className="grid flex-1 grid-cols-1 gap-5 pb-4 md:min-h-0 md:grid-cols-[1.4fr_0.9fr]">
        <div className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.07)]">
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-2 pt-6">
          <div className="my-auto w-full py-2">
            {step === 0 && (
              <StepShell eyebrow="Paso 1 de 6" titulo="¿Qué iPhone tenés?">
                <select
                  id="modeloSelect"
                  className="w-full appearance-none rounded-xl border-[1.5px] border-[var(--color-border-strong)] bg-[var(--color-surface-2)] bg-[length:16px] bg-[right_16px_center] bg-no-repeat px-4 py-3.5 font-[family-name:var(--font-body)] text-base text-[var(--color-text)] focus:outline-2 focus:outline-[var(--color-accent)]"
                  style={{
                    backgroundImage:
                      "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23000000%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22></polyline></svg>')",
                  }}
                  value={form.modelo ?? ""}
                  onChange={(e) => actualizar("modelo", e.target.value)}
                >
                  <option value="" disabled>
                    Seleccioná un modelo
                  </option>
                  {listaModelos.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </StepShell>
            )}

            {step === 1 && (
              <StepShell eyebrow={`Paso 2 de 6 · ${form.modelo}`} titulo="Capacidad (GB)">
                <select
                  id="capacidadSelect"
                  className="w-full appearance-none rounded-xl border-[1.5px] border-[var(--color-border-strong)] bg-[var(--color-surface-2)] bg-[length:16px] bg-[right_16px_center] bg-no-repeat px-4 py-3.5 font-[family-name:var(--font-body)] text-base text-[var(--color-text)] focus:outline-2 focus:outline-[var(--color-accent)]"
                  style={{
                    backgroundImage:
                      "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23000000%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22></polyline></svg>')",
                  }}
                  value={form.capacidad ?? ""}
                  onChange={(e) => actualizar("capacidad", e.target.value)}
                >
                  <option value="" disabled>
                    Seleccioná la capacidad
                  </option>
                  {listaCapacidades.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </StepShell>
            )}

            {step === 2 && (
              <StepShell eyebrow="Paso 3 de 6" titulo="Estado de batería">
                <div className="grid grid-cols-3 gap-2.5">
                  {BATERIA_OPTS.map((o) => (
                    <OptionButton
                      key={o.key}
                      title={o.label}
                      selected={form.bateria === o.key}
                      onClick={() => actualizar("bateria", o.key)}
                      center
                    />
                  ))}
                </div>
              </StepShell>
            )}

            {step === 3 && (
              <StepShell eyebrow="Paso 4 de 6" titulo="Estado general">
                <div className="flex flex-col gap-2.5">
                  {ESTADO_OPTS.map((o) => (
                    <OptionButton
                      key={o.key}
                      title={o.title}
                      desc={o.desc}
                      selected={form.estado === o.key}
                      onClick={() => actualizar("estado", o.key)}
                    />
                  ))}
                </div>
              </StepShell>
            )}

            {step === 4 && (
              <StepShell eyebrow="Paso 5 de 6" titulo="¿Qué andás buscando?">
                <div className="flex flex-col gap-2.5">
                  {BUSCA_OPTS.map((o) => (
                    <OptionButton
                      key={o.key}
                      title={o.title}
                      selected={form.busca === o.key}
                      onClick={() => actualizar("busca", o.key)}
                    />
                  ))}
                </div>
              </StepShell>
            )}

            {step === 5 && (
              <StepShell eyebrow="Paso 6 de 6" titulo="Nombre y número de teléfono">
                <div className="flex flex-col gap-3.5">
                  <div>
                    <label htmlFor="nombreInput" className="mb-1.5 block font-[family-name:var(--font-label)] text-[0.72rem] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Nombre
                    </label>
                    <input
                      id="nombreInput"
                      type="text"
                      placeholder="Ej: Marcos Pérez"
                      value={form.nombre}
                      onChange={(e) => actualizar("nombre", e.target.value)}
                      onBlur={() => setTocado((t) => ({ ...t, nombre: true }))}
                      className={`w-full rounded-xl border-[1.5px] px-4 py-3.5 font-[family-name:var(--font-body)] text-base text-[var(--color-text)] focus:outline-2 focus:outline-[var(--color-accent)]
                        ${errorNombre ? "border-[var(--color-danger)] bg-[var(--color-danger-soft)]" : "border-[var(--color-border-strong)] bg-[var(--color-surface-2)]"}`}
                    />
                    <div className="mt-1.5 min-h-[1em] text-[0.78rem] text-[var(--color-danger)]">{errorNombre}</div>
                  </div>
                  <div>
                    <label htmlFor="telefonoInput" className="mb-1.5 block font-[family-name:var(--font-label)] text-[0.72rem] font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
                      Teléfono (WhatsApp)
                    </label>
                    <input
                      id="telefonoInput"
                      type="tel"
                      placeholder="Ej: 11 3456 7890"
                      value={form.telefono}
                      onChange={(e) => actualizar("telefono", e.target.value)}
                      onBlur={() => setTocado((t) => ({ ...t, telefono: true }))}
                      className={`w-full rounded-xl border-[1.5px] px-4 py-3.5 font-[family-name:var(--font-body)] text-base text-[var(--color-text)] focus:outline-2 focus:outline-[var(--color-accent)]
                        ${errorTelefono ? "border-[var(--color-danger)] bg-[var(--color-danger-soft)]" : "border-[var(--color-border-strong)] bg-[var(--color-surface-2)]"}`}
                    />
                    <div className="mt-1.5 min-h-[1em] text-[0.78rem] text-[var(--color-danger)]">{errorTelefono}</div>
                  </div>
                  {errorEnvio && <div className="text-[0.8rem] text-[var(--color-danger)]">{errorEnvio}</div>}
                </div>
              </StepShell>
            )}

            {step === TOTAL_STEPS && (
              <StepShell eyebrow="Resultado" titulo={`${form.modelo} · ${form.capacidad}`}>
                {resultado === null ? (
                  <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 font-[family-name:var(--font-body)] text-[0.8rem] text-[var(--color-text-muted)]">
                    No encontramos esa combinación de modelo y capacidad. Volvé atrás y probá con otra opción.
                  </div>
                ) : (
                  <>
                    <div className="mb-0.5 mt-1.5 font-[family-name:var(--font-display)] text-[2.6rem] font-extrabold leading-none tracking-tight">
                      USD {resultado.toLocaleString("es-AR")}
                    </div>
                    <div className="mb-4.5 font-[family-name:var(--font-body)] text-[0.85rem] text-[var(--color-text-muted)]">
                      Valor estimado de recompra
                    </div>

                    <div className="mb-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4 font-[family-name:var(--font-body)] text-[0.8rem] leading-relaxed text-[var(--color-text-muted)]">
                      Este valor es una estimación y está sujeto a revisión final por uno de nuestros
                      asesores al verificar el equipo en persona. No implica obligación de compra ni de
                      venta para ninguna de las partes.
                    </div>

                    <a
                      href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensajeWhatsapp)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-4.5 py-3.5 font-[family-name:var(--font-label)] text-[0.9rem] font-bold uppercase tracking-wide text-white"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.04 2c-5.46 0-9.9 4.44-9.9 9.9 0 1.75.46 3.45 1.32 4.95L2 22l5.29-1.39a9.87 9.87 0 0 0 4.75 1.21h.01c5.46 0 9.9-4.44 9.9-9.9 0-2.64-1.03-5.13-2.9-7-1.87-1.87-4.36-2.9-7-2.9zm0 18.02c-1.5 0-2.97-.4-4.25-1.16l-.3-.18-3.14.82.84-3.07-.2-.32a8.16 8.16 0 0 1-1.25-4.32c0-4.51 3.67-8.18 8.18-8.18 2.19 0 4.24.85 5.79 2.4a8.13 8.13 0 0 1 2.4 5.79c0 4.51-3.67 8.18-8.18 8.18z" />
                      </svg>
                      Enviar por WhatsApp
                    </a>

                    <a
                      href={`https://instagram.com/${INSTAGRAM_USUARIO}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3.5 flex items-center justify-center gap-2 font-[family-name:var(--font-label)] text-[0.8rem] font-semibold text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                        <rect x="3" y="3" width="18" height="18" rx="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
                      </svg>
                      Seguinos en Instagram · @{INSTAGRAM_USUARIO}
                    </a>

                    {detalle && (
                      <details className="mt-4 font-[family-name:var(--font-body)] text-[0.78rem] text-[var(--color-text-muted)]">
                        <summary className="cursor-pointer font-bold">Ver detalle del cálculo</summary>
                        <table className="mt-2.5 w-full border-collapse">
                          <tbody>
                            <tr className="border-b border-dashed border-[var(--color-border)]">
                              <td className="py-1">Precio base ({bateriaLabel})</td>
                              <td className="py-1 text-right font-semibold text-[var(--color-text)]">USD {detalle.base}</td>
                            </tr>
                            <tr className="border-b border-dashed border-[var(--color-border)]">
                              <td className="py-1">Multiplicador ({estadoOpt?.title})</td>
                              <td className="py-1 text-right font-semibold text-[var(--color-text)]">x {detalle.multiplicador}</td>
                            </tr>
                            <tr>
                              <td className="py-1">Precio final</td>
                              <td className="py-1 text-right font-semibold text-[var(--color-text)]">USD {resultado}</td>
                            </tr>
                          </tbody>
                        </table>
                      </details>
                    )}
                  </>
                )}
              </StepShell>
            )}
          </div>
          </div>

          <div className="flex flex-none gap-2.5 border-t border-[var(--color-border)] px-5 pb-[calc(16px+env(safe-area-inset-bottom,0px))] pt-3.5">
            {step > 0 && step <= 5 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="rounded-xl border-[1.5px] border-[var(--color-border)] px-4.5 py-3.5 font-[family-name:var(--font-label)] text-[0.9rem] font-bold uppercase tracking-wide text-[var(--color-text)]"
              >
                Atrás
              </button>
            )}
            {step === TOTAL_STEPS && (
              <button
                type="button"
                onClick={reiniciar}
                className="rounded-xl border-[1.5px] border-[var(--color-border)] px-4.5 py-3.5 font-[family-name:var(--font-label)] text-[0.9rem] font-bold uppercase tracking-wide text-[var(--color-text)]"
              >
                Atrás
              </button>
            )}
            {step < 5 && (
              <button
                type="button"
                disabled={!canAdvance()}
                onClick={() => setStep((s) => s + 1)}
                className="flex-1 rounded-xl bg-[var(--color-accent)] px-4.5 py-3.5 font-[family-name:var(--font-label)] text-[0.9rem] font-bold uppercase tracking-wide text-[var(--color-accent-contrast)] disabled:opacity-40"
              >
                Siguiente
              </button>
            )}
            {step === 5 && (
              <button
                type="button"
                disabled={!canAdvance() || enviando}
                onClick={handleVerResultado}
                className="flex-1 rounded-xl bg-[var(--color-accent)] px-4.5 py-3.5 font-[family-name:var(--font-label)] text-[0.9rem] font-bold uppercase tracking-wide text-[var(--color-accent-contrast)] disabled:opacity-40"
              >
                {enviando ? "Calculando..." : "Ver resultado"}
              </button>
            )}
            {step === TOTAL_STEPS && (
              <button
                type="button"
                onClick={reiniciar}
                className="flex-1 rounded-xl bg-[var(--color-accent)] px-4.5 py-3.5 font-[family-name:var(--font-label)] text-[0.9rem] font-bold uppercase tracking-wide text-[var(--color-accent-contrast)]"
              >
                Empezar de nuevo
              </button>
            )}
          </div>
        </div>

        <aside className="hidden flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5.5 py-5.5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.07)] md:flex">
          <h2 className="mb-1 font-[family-name:var(--font-label)] text-xs font-bold uppercase tracking-wide text-[var(--color-text-muted)]">
            Tu cotización
          </h2>
          {STEP_LABELS.map((label, idx) => {
            const valor = railValor(idx);
            const activo = idx === step;
            return (
              <div
                key={label}
                className={`flex items-start gap-2.5 border-b border-[var(--color-border)] py-3 last:border-b-0`}
              >
                <div
                  className={`flex h-5.5 w-5.5 flex-none items-center justify-center rounded-full border-[1.5px] text-[0.7rem]
                    ${valor ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-[var(--color-accent-contrast)]" : activo ? "border-[var(--color-accent)] text-[var(--color-accent)]" : "border-[var(--color-border)] text-[var(--color-text-muted)]"}`}
                >
                  {valor ? "✓" : idx + 1}
                </div>
                <div>
                  <div className="font-[family-name:var(--font-label)] text-[0.7rem] uppercase tracking-wide text-[var(--color-text-muted)]">
                    {label}
                  </div>
                  <div className={`mt-0.5 font-[family-name:var(--font-body)] text-[0.92rem] font-semibold ${valor ? "" : "font-normal text-[var(--color-text-muted)]"}`}>
                    {valor ?? "Pendiente"}
                  </div>
                </div>
              </div>
            );
          })}
        </aside>
      </main>
    </div>
  );
}

function StepShell({ eyebrow, titulo, children }: { eyebrow: string; titulo: string; children: React.ReactNode }) {
  return (
    <>
      <p className="mb-1.5 font-[family-name:var(--font-label)] text-[0.72rem] font-bold uppercase tracking-[0.08em] text-[var(--color-text-muted)]">
        {eyebrow}
      </p>
      <h1 className="mb-4.5 text-balance font-[family-name:var(--font-display)] text-2xl font-extrabold leading-tight md:text-[1.6rem]">
        {titulo}
      </h1>
      {children}
    </>
  );
}
