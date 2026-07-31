
import { cn } from "../../utils/cn";
import { STATUS_LABELS } from "../../utils/constants";

const Badge = ({ status, label, className }) => {
  const text = label ?? STATUS_LABELS[status] ?? status;
  return (
    <span className={cn("badge", `badge-${status?.replace(/\s/g,"_")}`, className)}>
      {text}
    </span>
  );
};
export default Badge;
