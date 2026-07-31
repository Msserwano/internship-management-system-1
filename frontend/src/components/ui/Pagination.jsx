
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../utils/cn";

const Pagination = ({ page, total, perPage = 10, onChange }) => {
  const totalPages = Math.ceil(total / perPage);
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const visible = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-700">
      <p className="text-sm text-slate-500">
        Showing {Math.min((page-1)*perPage+1, total)}–{Math.min(page*perPage, total)} of {total}
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange(page-1)} disabled={page === 1}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {visible.map((p, i) => (
          <>
            {i > 0 && visible[i-1] !== p-1 && <span key={`e${p}`} className="px-1 text-slate-400">…</span>}
            <button
              key={p} onClick={() => onChange(p)}
              className={cn("w-8 h-8 rounded-lg text-sm font-medium transition",
                p === page ? "bg-primary-500 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
              )}
            >{p}</button>
          </>
        ))}
        <button
          onClick={() => onChange(page+1)} disabled={page === totalPages}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
export default Pagination;
