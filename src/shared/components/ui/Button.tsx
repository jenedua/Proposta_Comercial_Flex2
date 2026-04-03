import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary:
        "border border-black/5 bg-[linear-gradient(135deg,#151515_0%,#262933_100%)] text-white shadow-[0_14px_30px_rgba(17,17,17,0.16)] hover:opacity-95",
      secondary:
        "border border-[#10913d]/10 bg-[#149940] text-white shadow-[0_12px_24px_rgba(20,153,64,0.18)] hover:bg-[#108337]",
      outline:
        "border border-black/10 bg-white/75 text-black/68 hover:bg-white",
      ghost:
        "bg-transparent text-black/58 hover:bg-black/[0.04] hover:text-black",
    };
    
    const sizes = {
      sm: "h-9 px-3.5 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-8 text-base"
    };

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/15 disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
