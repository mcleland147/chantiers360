/** Conducteurs disponibles — alignés sur le seed PostgreSQL */
export const conductorOptions = [
  { id: "u-conducteur", name: "Marc Dupont" },
] as const;

export function frenchDateToIso(value: string): string {
  const [day, month, year] = value.split("/");
  if (!day || !month || !year) return value;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

export function isoDateToInput(value: string): string {
  if (value.includes("/")) return frenchDateToIso(value);
  return value.slice(0, 10);
}

export function inputDateToIso(value: string): string {
  return value;
}
