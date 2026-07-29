// src/components/ui/Select.jsx
import { forwardRef } from "react";
import { cn } from "../../utils/cn";

const Select = forwardRef(({ label, error, className, required, options = [], placeholder, ...props }, ref) => (
  <div className="space-y-1">
    {label && (
      <label className="form-label">
        {label} {required && <span className="text-danger">*</span>}
      </label>
    )}
    <select
      ref={ref}
      className={cn("form-input", error && "form-input-error", className)}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) =>
        typeof opt === "string"
          ? <option key={opt} value={opt}>{opt}</option>
          : <option key={opt.value} value={opt.value}>{opt.label}</option>
      )}
    </select>
    {error && <p className="form-error">{error}</p>}
  </div>
));
Select.displayName = "Select";
export default Select;
