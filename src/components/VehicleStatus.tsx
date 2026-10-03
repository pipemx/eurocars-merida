import type { VehicleStatus as Status } from "@/types/vehicle";

const dot: Record<Status, string> = { available: "bg-[#4caf7a]", reserved: "bg-accent", sold: "bg-muted" };

export function VehicleStatus({ status, label }: { status: Status; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-[12px] tracking-[0.08em] text-muted">
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot[status]}`} />
      {label}
    </span>
  );
}
