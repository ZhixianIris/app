import * as React from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"

import { cn } from "@/lib/utils"

const Popover = PopoverPrimitive.Root

const PopoverTrigger = PopoverPrimitive.Trigger

const popoverTransitionClasses =
  "transition-[opacity,transform] duration-150 ease-out " +
  "data-[starting-style]:opacity-0 data-[starting-style]:scale-95 " +
  "data-[ending-style]:opacity-0 data-[ending-style]:scale-95 " +
  "data-[side=bottom]:data-[starting-style]:-translate-y-2 data-[side=left]:data-[starting-style]:translate-x-2 " +
  "data-[side=right]:data-[starting-style]:-translate-x-2 data-[side=top]:data-[starting-style]:translate-y-2 " +
  "data-[side=bottom]:data-[ending-style]:-translate-y-2 data-[side=left]:data-[ending-style]:translate-x-2 " +
  "data-[side=right]:data-[ending-style]:-translate-x-2 data-[side=top]:data-[ending-style]:translate-y-2"

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Popup>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Popup> & {
    align?: "start" | "center" | "end"
    side?: "top" | "right" | "bottom" | "left"
    sideOffset?: number
  }
>(({ className, align = "center", side, sideOffset = 4, style, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Positioner align={align} side={side} sideOffset={sideOffset}>
      <PopoverPrimitive.Popup
        ref={ref}
        style={{ zIndex: 'var(--z-popover)', ...style }}
        className={cn(
          "w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-hidden",
          popoverTransitionClasses,
          className
        )}
        {...props}
      />
    </PopoverPrimitive.Positioner>
  </PopoverPrimitive.Portal>
))
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
