export type TargetClass = "9" | "10" | "9_10";

export function formatTargetClass(c: TargetClass): string {
  if (c === "9_10") return "Class 9 & 10";
  return `Class ${c}`;
}

export function targetClassMatches(sessionClass: TargetClass, studentClass: "9" | "10"): boolean {
  return sessionClass === studentClass || sessionClass === "9_10";
}
