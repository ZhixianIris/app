import React from 'react'
import { Tooltip } from '@base-ui/react/tooltip'

type TooltipProps = {
  sideOffset?: number
  content: React.ReactNode
  children: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  slateBlack?: boolean
  unstyled?: boolean
}

const ToolTip = (props: TooltipProps) => {
  return (
    <Tooltip.Provider delay={200}>
      <Tooltip.Root>
        <Tooltip.Trigger render={props.children as React.ReactElement} />
        <Tooltip.Portal>
          <Tooltip.Positioner
            side={props.side ? props.side : 'top'}
            sideOffset={props.sideOffset ?? 6}
          >
            <Tooltip.Popup
              className={
                props.unstyled
                  ? 'z-[var(--z-tooltip)] transition-[opacity] duration-200 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0'
                  : `z-[var(--z-tooltip)] select-none will-change-[transform,opacity]
                  transition-[opacity,transform] duration-200
                  data-[side=top]:data-[starting-style]:translate-y-0.5
                  data-[side=right]:data-[starting-style]:-translate-x-0.5
                  data-[side=bottom]:data-[starting-style]:-translate-y-0.5
                  data-[side=left]:data-[starting-style]:translate-x-0.5
                  data-[side=top]:data-[ending-style]:translate-y-0.5
                  data-[side=right]:data-[ending-style]:-translate-x-0.5
                  data-[side=bottom]:data-[ending-style]:-translate-y-0.5
                  data-[side=left]:data-[ending-style]:translate-x-0.5
                  data-[starting-style]:opacity-0 data-[ending-style]:opacity-0
                  rounded-md px-2.5 py-[5px] text-[11px] font-medium leading-none
                  shadow-[0_10px_15px_-3px_rgba(0,0,0,0.08),0_4px_6px_-4px_rgba(0,0,0,0.05)]
                  outline outline-1 outline-black/[0.06]
                  ${props.slateBlack
                    ? 'bg-[#0d0d0d] text-white'
                    : 'bg-white/95 text-gray-600'
                  }`
              }
            >
              {props.content}
            </Tooltip.Popup>
          </Tooltip.Positioner>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  )
}

export default ToolTip
