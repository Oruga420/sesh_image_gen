import * as React from "react"
import { cn } from "@/lib/utils"

interface DialogProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  ({ className, open, onOpenChange, children, ...props }, ref) => {
    if (!open) return null
    
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black/50" 
          onClick={() => onOpenChange?.(false)}
        />
        
        {/* Content */}
        <div
          ref={ref}
          className={cn(
            "relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6",
            className
          )}
          {...props}
        >
          {children}
        </div>
      </div>
    )
  }
)
Dialog.displayName = "Dialog"

export { Dialog }