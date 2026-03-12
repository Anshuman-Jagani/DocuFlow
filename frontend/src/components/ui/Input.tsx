import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../utils/helpers';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string; error?: string; helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label className="block text-[10px] font-bold text-[#333333] tracking-[0.15em] uppercase mb-1.5">
          {label}
          {props.required && <span className="text-[#F87171] ml-1">*</span>}
        </label>
      )}
      <input type={type} ref={ref}
        className={cn(
          'w-full px-3 py-2.5 bg-[#0A0A0A] border rounded-md text-white placeholder-[#333333] outline-none transition-all duration-200 text-sm',
          'focus:border-white/30 focus:shadow-glow-white-sm disabled:opacity-40 disabled:cursor-not-allowed',
          error ? 'border-[#F87171]/40 focus:border-[#F87171]/60' : 'border-[#1A1A1A]',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-[11px] text-[#F87171]">{error}</p>}
      {helperText && !error && <p className="mt-1.5 text-[11px] text-[#333333]">{helperText}</p>}
    </div>
  )
);

Input.displayName = 'Input';
export default Input;
