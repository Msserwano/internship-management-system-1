// src/components/ui/Input.jsx
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

const Input = forwardRef(({ label, error, className, icon: Icon, required, hint, ...props }, ref) => (
  <div className="space-y-1">
    {label && (
      <label className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="w-4 h-4 text-slate-400" />
        </div>
      )}
      <input
        ref={ref}
        className={cn("form-input", Icon && "pl-9", error && "form-input-error", className)}
        {...props}
      />
    </div>
    {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
    {error && <p className="form-error">{error}</p>}
  </div>
));
Input.displayName = "Input";
export default Input;
