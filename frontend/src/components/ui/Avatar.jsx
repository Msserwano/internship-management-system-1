// src/components/ui/Avatar.jsx
import { cn } from "../../utils/cn";
import { initials } from "../../utils/formatters";

const COLORS = [
  "bg-primary-500","bg-accent-500","bg-secondary-500","bg-purple-500",
  "bg-pink-500","bg-indigo-500","bg-teal-500","bg-orange-500",
];

const Avatar = ({ name = "", src, size = "md", className }) => {
  const sizes = { xs:"w-6 h-6 text-xs", sm:"w-8 h-8 text-xs", md:"w-10 h-10 text-sm", lg:"w-12 h-12 text-base", xl:"w-16 h-16 text-xl" };
  const color = COLORS[name.charCodeAt(0) % COLORS.length];
  if (src) return <img src={src} alt={name} className={cn("rounded-full object-cover", sizes[size], className)} />;
  return (
    <div className={cn("rounded-full flex items-center justify-center text-white font-bold flex-shrink-0", sizes[size], color, className)}>
      {initials(name)}
    </div>
  );
};
export default Avatar;
