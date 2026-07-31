
import { cn } from "../../utils/cn";

export const Skeleton = ({ className }) => <div className={cn("skeleton", className)} />;

export const CardSkeleton = () => (
  <div className="card p-5 space-y-3">
    <Skeleton className="h-4 w-1/3" />
    <Skeleton className="h-8 w-1/2" />
    <Skeleton className="h-3 w-2/3" />
  </div>
);

export const TableSkeleton = ({ rows = 5, cols = 5 }) => (
  <div className="space-y-2">
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className={`h-4 flex-1 ${j === 0 ? "max-w-[120px]" : ""}`} />
        ))}
      </div>
    ))}
  </div>
);

export const PageSkeleton = () => (
  <div className="page-container space-y-6">
    <div className="flex items-center justify-between">
      <Skeleton className="h-7 w-48" />
      <Skeleton className="h-9 w-32 rounded-xl" />
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_,i)=><CardSkeleton key={i}/>)}
    </div>
    <div className="card p-5"><TableSkeleton /></div>
  </div>
);

export default Skeleton;
