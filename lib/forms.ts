/** Lectura defensiva de campos de formulario en Server Actions. */
export function readField(
  formData: FormData,
  key: string,
  trim = true,
): string {
  const raw = formData.get(key);
  const value = typeof raw === "string" ? raw : "";

  return trim ? value.trim() : value;
}
