// src/components/ui/EmptyState.jsx
import { motion } from "framer-motion";

const EmptyState = ({ icon: Icon, title, description, action }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 px-6 text-center"
  >
    {Icon && (
      <div className="p-4 bg-slate-100 dark:bg-slate-700 rounded-full mb-4">
        <Icon className="w-8 h-8 text-slate-400 dark:text-slate-500" />
      </div>
    )}
    <h3 className="text-base font-semibold text-slate-700 dark:text-slate-300 mb-1">{title}</h3>
    {description && <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-4">{description}</p>}
    {action}
  </motion.div>
);
export default EmptyState;
