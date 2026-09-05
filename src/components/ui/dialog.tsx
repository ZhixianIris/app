import * as React from "react"
import { Dialog } from "@base-ui/react/dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const DialogRoot = Dialog.Root

const DialogTrigger = Dialog.Trigger

const DialogPortal = Dialog.Portal

const DialogClose = Dialog.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof Dialog.Backdrop>,
  React.ComponentPropsWithoutRef<typeof Dialog.Backdrop>
>(({ className, ...props }, ref) => (
  <Dialog.Backdrop
    ref={ref}
    className={cn(
      "app-modal-overlay fixed inset-0 bg-black/40",
      "transition-opacity duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0",
      className
    )}
    style={{ zIndex: 'var(--z-modal-backdrop)', willChange: 'opacity' }}
    {...props}
  />
))
DialogOverlay.displayName = "DialogOverlay"

const DialogContent = React.forwardRef<
  React.ElementRef<typeof Dialog.Popup>,
  React.ComponentPropsWithoutRef<typeof Dialog.Popup>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <Dialog.Viewport
      className="fixed inset-0 grid place-items-center overflow-y-auto p-4"
      style={{ zIndex: 'var(--z-modal)' as React.CSSProperties['zIndex'] }}
    >
      <Dialog.Popup
        ref={ref}
        // The Viewport centers the popup via `grid place-items-center`, so the
        // popup itself only carries sizing/shaping classes.
        onKeyDown={(e: React.KeyboardEvent) => {
          // Prevent the dialog from swallowing keystrokes (e.g. "D") inside
          // form inputs
          const target = e.target as HTMLElement
          const tag = target.tagName
          if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable) {
            e.stopPropagation()
          }
        }}
        className={cn(
          "app-modal-content grid w-full max-w-lg gap-0 border border-gray-200/80 bg-white shadow-2xl shadow-black/10 rounded-2xl",
          "transition-[opacity,transform] duration-200 will-change-[transform,opacity] [backface-visibility:hidden]",
          "data-[starting-style]:scale-95 data-[starting-style]:opacity-0",
          "data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
          className
        )}
        {...props}
      >
        {children}
        <Dialog.Close
          className="absolute end-4 top-4 p-1.5 rounded-lg bg-gray-100/80 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Dialog.Close>
      </Dialog.Popup>
    </Dialog.Viewport>
  </DialogPortal>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-0 text-center sm:text-start",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof Dialog.Title>,
  React.ComponentPropsWithoutRef<typeof Dialog.Title>
>(({ className, ...props }, ref) => (
  <Dialog.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-tight tracking-tight text-gray-900",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof Dialog.Description>,
  React.ComponentPropsWithoutRef<typeof Dialog.Description>
>(({ className, ...props }, ref) => (
  <Dialog.Description
    ref={ref}
    className={cn("text-sm text-gray-500", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  DialogRoot as Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
