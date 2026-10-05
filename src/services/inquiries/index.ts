"use client";

/**
 * Solicitudes del sitio (prueba de manejo). DEMO: no se envía a ningún servidor ni correo;
 * se guarda en localStorage para que el CRM demo (Fase 5) pueda leerlas.
 * Mañana: POST a la API/CRM real con la misma firma.
 */
export type TestDriveRequest = {
  vehicleSlug: string;
  name: string;
  phone: string;
  preferredDate: string;
  preferredSlot: "morning" | "afternoon";
  notes: string;
};

const KEY = "ec-demo-inquiries";

export async function submitTestDriveRequest(input: TestDriveRequest): Promise<{ ok: true; demo: true }> {
  try {
    const raw = window.localStorage.getItem(KEY);
    const list: unknown[] = raw ? JSON.parse(raw) : [];
    list.push({ type: "test_drive", isDemo: true, createdAt: new Date().toISOString(), ...input });
    window.localStorage.setItem(KEY, JSON.stringify(list.slice(-50)));
  } catch {}
  return { ok: true, demo: true };
}
