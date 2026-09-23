export function validarNombre(valor: string): string | null {
  const v = valor.trim();
  if (v.length < 2) return "Ingresá tu nombre.";
  if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s'.-]{2,60}$/.test(v)) return "Usá solo letras.";
  return null;
}

export function validarTelefono(valor: string): string | null {
  const raw = valor.trim();
  if (!raw) return "Ingresá tu número de teléfono.";
  const digitos = raw.replace(/\D/g, "");
  if (digitos.length < 8 || digitos.length > 13) {
    return "Ingresá un número válido (8 a 13 dígitos, con código de área).";
  }
  if (/^(\d)\1+$/.test(digitos)) return "Ese número no parece válido.";
  if (/^(0123456789|1234567890|987654321)/.test(digitos)) return "Ese número no parece válido.";
  return null;
}
