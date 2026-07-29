// src/components/ui/StatCard.jsx
import { motion } from "framer-motion";
import { cn } from "../../utils/cn";

const StatCard = ({ title, value, icon: Icon, change, changeLabel, color = "primary", index = 0 }) => {
  const colors = {
    primary:   { bg: "bg-primary-50  dark:bg-primary-900/20",   icon: "bg-primary-500",   text: "text-primary-600  dark:text-primary-400"  },
    secondary: { bg: "bg-yellow-50   dark:bg-yellow-900/20",    icon: "bg-secondary-500", text: "text-yellow-600   dark:text-yellow-400"   },
    accent:    { bg: "bg-green-50    dark:bg-green-900/20",     icon: "bg-accent-500",    text: "text-green-600    dark:text-green-400"    },
    danger:    { bg: "bg-red-50      dark:bg-red-900/20",       icon: "bg-danger",        text: "text-red-600      dark:text-red-400"      },
    purple:    { bg: "bg-purple-50   dark:bg-purple-900/20",    icon: "bg-purple-500",    text: "text-purple-600   dark:text-purple-400"   },
    orange:    { bg: "bg-orange-50   dark:bg-orange-900/20",    icon: "bg-orange-500",    text: "text-orange-600   dark:text-orange-400"   },
    info:      { bg: "bg-sky-50      dark:bg-sky-900/20",       icon: "bg-info",          text: "text-sky-600      dark:text-sky-400"      },
  };
  const c = colors[color] || colors.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, type: "spring", stiffness: 300, damping: 24 }}
      whileHover={{ y: -2, boxShadow: "0 8px 25px rgba(0,0,0,.1)" }}
      className="card p-5 cursor-default"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{title}</p>
          <p className="text-3xl font-bold text-slate-800 dark:text-white">{value}</p>
          {(change !== undefined || changeLabel) && (
            <p className={cn("text-xs font-medium", c.text)}>
              {changeLabel || (change >= 0 ? `+${change}` : change)}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn("p-3 rounded-xl", c.icon)}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>
    </motion.div>
  );
};
export default StatCard;
