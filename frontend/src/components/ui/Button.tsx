import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "../../utils/helpers";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost" | "outline" | "gray";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md font-semibold transition-all duration-200 " +
      "focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.97] tracking-tight";

    const variants = {
      primary:
        "bg-white text-black hover:bg-white/90 shadow-sm",
      gray:
        "bg-transparent border border-white/15 text-white/60 hover:border-white/40 hover:text-white hover:shadow-glow-white-sm",
      secondary:
        "bg-[#0A0A0A] border border-[#1A1A1A] text-white hover:bg-[#111111] hover:border-[#333333]",
      danger:
        "bg-[#F87171]/10 border border-[#F87171]/20 text-[#F87171] hover:bg-[#F87171]/20",
      ghost:
        "bg-transparent text-[#444444] hover:bg-[#0A0A0A] hover:text-white",
      outline:
        "border border-[#1A1A1A] bg-transparent text-[#555555] hover:border-white/20 hover:text-white",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs",
      md: "px-4 py-2 text-sm",
      lg: "px-6 py-3 text-base",
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
export default Button;
