import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import { type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants>
>({
  size: "default",
  variant: "default",
})

// Radix toggle groups had an explicit `type` ("single" | "multiple"). Base UI
// toggle groups always carry an array value, so single selection is enforced
// here by collapsing the incoming value array to its last entry.
type ToggleGroupType = "single" | "multiple"

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> & {
    type?: ToggleGroupType
  } &
    VariantProps<typeof toggleVariants>
>(({ className, variant, size, children, type = "multiple", value, onValueChange, ...props }, ref) => {
  const normalizeValue = (v: unknown): string[] => {
    if (v == null) return []
    return Array.isArray(v) ? (v as string[]) : [v as string]
  }
  const groupValue = type === "single" ? normalizeValue(value).slice(-1) : normalizeValue(value)
  const handleValueChange = (groupValue: unknown[]) => {
    if (!onValueChange) return
    if (type === "single") {
      const next = groupValue.slice(-1)
      onValueChange((next.length ? next[0] : "") as never)
    } else {
      onValueChange(groupValue as never)
    }
  }

  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      className={cn("flex items-center justify-center gap-1", className)}
      value={groupValue as never}
      onValueChange={handleValueChange as never}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
})

ToggleGroup.displayName = "ToggleGroup"

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> &
    VariantProps<typeof toggleVariants>
>(({ className, children, variant, size, ...props }, ref) => {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  )
})

ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem }
