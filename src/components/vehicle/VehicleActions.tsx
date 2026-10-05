"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, MessageSquareText } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { track } from "@/lib/analytics";
import { whatsappHref, vehicleName } from "@/lib/whatsapp";
import { CompareButton } from "../CompareButton";
import { FavoriteButton } from "../FavoriteButton";
import { WhatsappIcon } from "../icons";
import { ShareVehicleButton } from "../ShareVehicleButton";
import { usePreferences } from "../providers/Preferences";
import { TestDriveDialog } from "./TestDriveDialog";

/** CTAs de la ficha + evento vehicle_view. */
export function VehicleActions({ v }: { v: Vehicle }) {
  const { t } = usePreferences();
  const [testDrive, setTestDrive] = useState(false);
  const name = vehicleName(v);

  useEffect(() => {
    track("vehicle_view", { vehicle_id: v.id });
  }, [v.id]);

  const wa = whatsappHref(t.whatsapp.vehicle(name));

  return (
    <>
      <div className="mt-8 flex flex-col gap-3">
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_click", { source: "vehicle_page", vehicle_id: v.id })}
          className="btn-primary group w-full"
        >
          <WhatsappIcon className="h-4 w-4" /> {t.vehicle.whatsapp}
        </a>
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href={whatsappHref(t.vehicle.infoMessage(name))}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track("whatsapp_click", { source: "vehicle_info", vehicle_id: v.id })}
            className="btn-ghost w-full !px-3"
          >
            <MessageSquareText className="h-4 w-4" strokeWidth={1.5} /> {t.vehicle.info}
          </a>
          <div className="btn-ghost w-full !px-0">
            <ShareVehicleButton vehicle={v} variant="labeled" className="w-full [&>button]:w-full [&>button]:justify-center" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <FavoriteButton vehicle={v} variant="labeled" />
          <CompareButton vehicle={v} variant="labeled" />
        </div>
        <button type="button" onClick={() => setTestDrive(true)} className="btn-ghost w-full !px-3">
          <CalendarCheck className="h-4 w-4" strokeWidth={1.5} /> {t.testDrive.open}
          <span className="rounded-full border border-line-strong/60 px-2 py-0.5 text-[10px] tracking-[0.14em] text-muted">{t.testDrive.demoTag}</span>
        </button>
      </div>
      {testDrive && <TestDriveDialog vehicle={v} onClose={() => setTestDrive(false)} />}
    </>
  );
}

/**
 * Barra fija inferior (móvil): WhatsApp | Compartir. Se renderiza al nivel de la página,
 * fuera de contenedores animados (un ancestro con transform la dejaría a media pantalla).
 */
export function VehicleStickyBar({ v }: { v: Vehicle }) {
  const { t } = usePreferences();
  const wa = whatsappHref(t.whatsapp.vehicle(vehicleName(v)));
  return (
      <div
        className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-line bg-bg/92 px-4 pt-3 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
      >
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_click", { source: "vehicle_sticky", vehicle_id: v.id })}
          className="wa-shine relative flex min-h-12 flex-1 items-center justify-center gap-2 overflow-hidden rounded-[2px] bg-[linear-gradient(145deg,#3ee283_0%,#1fae55_55%,#128c4a_100%)] text-[13px] font-semibold uppercase tracking-[0.1em] text-white shadow-[0_8px_22px_-10px_rgb(31_174_85/0.9)]"
        >
          <WhatsappIcon className="wa-icon h-5 w-5" /> WhatsApp
        </a>
        <div className="flex min-h-12 items-center justify-center rounded-[2px] border border-line-strong px-2">
          <ShareVehicleButton vehicle={v} variant="labeled" className="[&>div]:bottom-full [&>div]:top-auto [&>div]:mb-2" />
        </div>
      </div>
  );
}
