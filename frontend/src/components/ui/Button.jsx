
import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import { Loader2 } from "lucide-react";

const Button = forwardRef(({
  children, className, variant = "primary", size = "md",
  loading = false, icon: Icon, iconRight: IconRight, ...props
}, ref) => {
  const variants = {
    primary: "btn-primary", secondary: "btn-secondary", accent: "btn-accent",
    outline: "btn-outline", ghost: "btn-ghost", danger: "btn-danger", warning: "btn-warning",
  };
  const sizes = { xs: "btn-xs", sm: "btn-sm", md: "btn-md", lg: "btn-lg" };

  return (
    <button
      ref={ref}
      className={cn("btn", variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : Icon && <Icon className="w-4 h-4" />}
      {children}
      {!loading && IconRight && <IconRight className="w-4 h-4" />}
    </button>
  );
});
Button.displayName = "Button";
export default Button;
