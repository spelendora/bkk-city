"use client";

import * as Tooltip from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

interface Props {
  term: string;     // the visible text
  hint: string;     // the tooltip content
  children?: ReactNode;
}

export default function GlossaryTooltip({ term, hint, children }: Props) {
  return (
    <Tooltip.Provider delayDuration={200} skipDelayDuration={500}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span className="gloss-term" tabIndex={0}>
            {children ?? term}
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            className="gloss-tooltip"
            sideOffset={6}
            collisionPadding={12}
          >
            {hint}
            <Tooltip.Arrow className="gloss-tooltip__arrow" width={10} height={5} />
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
