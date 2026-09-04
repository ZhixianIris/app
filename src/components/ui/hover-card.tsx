import * as React from "react"
import { PreviewCard } from "@base-ui/react/preview-card"

import { cn } from "@/lib/utils"

// Base UI has no dedicated hover-card primitive; PreviewCard is its
// open-on-hover popup with delay handling, which is what a hover card is.
function HoverCard({
  ...props
}: React.ComponentProps<typeof PreviewCard.Root>) {
  return <PreviewCard.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({
  ...props
}: React.ComponentProps<typeof PreviewCard.Trigger>) {
  return (
    <PreviewCard.Trigger data-slot="hover-card-trigger" {...props} />
  )
}

function HoverCardContent({
  className,
  align = "center",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof PreviewCard.Popup> & {
  align?: "start" | "center" | "end"
  sideOffset?: number
}) {
  return (
    <PreviewCard.Portal data-slot="hover-card-portal">
      <PreviewCard.Positioner align={align} sideOffset={sideOffset}>
        <PreviewCard.Popup
          data-slot="hover-card-content"
          className={cn(
            "bg-popover text-popover-foreground w-64 origin-(--transform-origin) rounded-md border p-4 shadow-md outline-hidden",
            "transition-[opacity,transform] duration-150 ease-out",
            "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
            "data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
            "data-[side=bottom]:data-[starting-style]:-translate-y-2 data-[side=left]:data-[starting-style]:translate-x-2 " +
            "data-[side=right]:data-[starting-style]:-translate-x-2 data-[side=top]:data-[starting-style]:translate-y-2 " +
            "data-[side=bottom]:data-[ending-style]:-translate-y-2 data-[side=left]:data-[ending-style]:translate-x-2 " +
            "data-[side=right]:data-[ending-style]:-translate-x-2 data-[side=top]:data-[ending-style]:translate-y-2",
            className
          )}
          style={{ zIndex: 'var(--z-popover)' }}
          {...props}
        />
      </PreviewCard.Positioner>
    </PreviewCard.Portal>
  )
}

export { HoverCard, HoverCardTrigger, HoverCardContent }
