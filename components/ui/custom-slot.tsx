// components/ui/custom-slot.tsx
import * as React from 'react'

interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

export const CustomSlot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, ref) => {
    if (!children) {
      return null
    }

    if (React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...props,
        ...children.props,
      })
    }

    return (
      <span {...props}>
        {children}
      </span>
    )
  }
)

CustomSlot.displayName = 'CustomSlot'