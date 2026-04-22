"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import type { LocationEntry } from "@/lib/locations";
import { mapsUrl } from "@/lib/locations";

interface Props {
  location: LocationEntry;
  children: React.ReactNode;
}

export default function LocationTooltip({ location, children }: Props) {
  return (
    <Tooltip.Provider delayDuration={200} skipDelayDuration={500}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="location-term" tabIndex={0}>
            {children}
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="location-tooltip"
            sideOffset={6}
            collisionPadding={12}
          >
            <div className="location-tooltip__type">{location.category_ru}</div>
            <div className="location-tooltip__name">{location.canonical}</div>
            <a
              href={mapsUrl(location)}
              target="_blank"
              rel="noopener noreferrer"
              className="location-tooltip__link"
            >
              Открыть в Google Maps ↗
            </a>
            <Tooltip.Arrow className="gloss-tooltip__arrow" width={10} height={5} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
