import * as React from "react"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import { Toggle as ToggleItemPrimitive } from "@base-ui/react/toggle"
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

interface ToggleGroupProps
  extends Omit<
      React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive>,
      "value" | "defaultValue" | "onValueChange"
    >,
  VariantProps<typeof toggleVariants> {
  type?: ToggleGroupType
  value?: string | string[]
  defaultValue?: string | string[]
  onValueChange?: (value: string | string[]) => void
}

const ToggleGroup = React.forwardRef<HTMLDivElement, ToggleGroupProps>(
  ({ className, variant, size, children, type = "multiple", value, defaultValue, onValueChange, ...props }, ref) => {
    const normalizeValue = (v: unknown): string[] => {
      if (v == null) return []
      return Array.isArray(v) ? (v as string[]) : [v as string]
    }
    const groupValue = type === "single" ? normalizeValue(value).slice(-1) : normalizeValue(value)
    const groupDefault = type === "single" ? normalizeValue(defaultValue).slice(-1) : normalizeValue(defaultValue)
    const handleValueChange = (next: unknown[]) => {
      if (!onValueChange) return
      if (type === "single") {
        const last = next.slice(-1)
        onValueChange(last.length ? (last[0] as string) : "")
      } else {
        onValueChange(next as string[])
      }
    }

    return (
      <ToggleGroupPrimitive
        ref={ref}
        className={cn("flex items-center justify-center gap-1", className)}
        value={groupValue}
        defaultValue={groupDefault}
        onValueChange={handleValueChange}
        {...props}
      >
        <ToggleGroupContext.Provider value={{ variant, size }}>
          {children}
        </ToggleGroupContext.Provider>
      </ToggleGroupPrimitive>
    )
  }
)

ToggleGroup.displayName = "ToggleGroup"

interface ToggleGroupItemProps
  extends React.ComponentPropsWithoutRef<typeof ToggleItemPrimitive>,
    VariantProps<typeof toggleVariants> {}

const ToggleGroupItem = React.forwardRef<HTMLButtonElement, ToggleGroupItemProps>(
  ({ className, children, variant, size, ...props }, ref) => {
    const context = React.useContext(ToggleGroupContext)

    return (
      <ToggleItemPrimitive
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
      </ToggleItemPrimitive>
    )
  }
)

ToggleGroupItem.displayName = "ToggleGroupItem"

export { ToggleGroup, ToggleGroupItem }
