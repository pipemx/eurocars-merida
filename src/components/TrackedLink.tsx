"use client";

import { track, type AnalyticsEvent } from "@/lib/analytics";

type Props = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  event: AnalyticsEvent;
  eventParams?: Record<string, string | number>;
};

/** Enlace que registra un evento analytics al hacer clic (externos en pestaña nueva). */
export function TrackedLink({ event, eventParams, onClick, ...rest }: Props) {
  const external = rest.href?.startsWith("http");
  return (
    <a
      {...rest}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      onClick={(e) => {
        track(event, eventParams);
        onClick?.(e);
      }}
    />
  );
}
