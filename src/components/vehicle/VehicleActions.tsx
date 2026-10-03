"use client";

import { useEffect } from "react";
import { MessageSquareText } from "lucide-react";
import type { Vehicle } from "@/types/vehicle";
import { track } from "@/lib/analytics";
import { whatsappHref, vehicleName } from "@/lib/whatsapp";
import { WhatsappIcon } from "../icons";
import { ShareVehicleButton } from "../ShareVehicleButton";
import { usePreferences } from "../providers/Preferences";

/** CTAs de la ficha (escritorio) + barra fija inferior (móvil) + evento vehicle_view. */
export function VehicleActions({ v }: { v: Vehicle }) {
  const { t } = usePreferences();
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
        <div className="grid grid-cols-2 gap-3">
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
      </div>

      {/* Barra fija móvil: WhatsApp | Compartir */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-line bg-bg/92 px-4 pt-3 backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom))" }}
      >
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => track("whatsapp_click", { source: "vehicle_sticky", vehicle_id: v.id })}
          className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[2px] bg-[#1fae55] text-[13px] font-semibold uppercase tracking-[0.1em] text-white"
        >
          <WhatsappIcon className="h-5 w-5" /> WhatsApp
        </a>
        <div className="flex min-h-12 items-center justify-center rounded-[2px] border border-line-strong px-2">
          <ShareVehicleButton vehicle={v} variant="labeled" className="[&>div]:bottom-full [&>div]:top-auto [&>div]:mb-2" />
        </div>
      </div>
    </>
  );
}
