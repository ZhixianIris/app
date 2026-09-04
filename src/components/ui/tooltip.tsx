import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"
import { cn } from "@/lib/utils"

const TooltipProvider = function TooltipProvider({
  delayDuration,
  delay,
  ...props
}: React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider> & {
  delayDuration?: number
}) {
  // Radix called the open delay `delayDuration`; Base UI calls it `delay`.
  return <TooltipPrimitive.Provider delay={delay ?? delayDuration} {...props} />
}

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipPortal = TooltipPrimitive.Portal

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Popup>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Popup> & {
    side?: "top" | "right" | "bottom" | "left"
    sideOffset?: number
  }
>(({ className, side, sideOffset = 4, ...props }, ref) => (
  <TooltipPortal>
    <TooltipPrimitive.Positioner side={side} sideOffset={sideOffset}>
      <TooltipPrimitive.Popup
        ref={ref}
        className={cn(
          "overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md",
          "transition-[opacity,transform] duration-150 ease-out",
          "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
          "data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
          className
        )}
        style={{ zIndex: 'var(--z-tooltip)' }}
        {...props}
      />
    </TooltipPrimitive.Positioner>
  </TooltipPortal>
))
TooltipContent.displayName = "TooltipContent"

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider, TooltipPortal }
