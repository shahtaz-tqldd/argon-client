import { Database, HardDrive, RefreshCw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import { cn } from "@/lib/utils";

const finiteNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : 0;
};

const formatBytes = (value) => {
  const bytes = finiteNumber(value);
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const unitIndex = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );
  const amount = bytes / 1024 ** unitIndex;

  return `${amount >= 10 || unitIndex === 0 ? amount.toFixed(0) : amount.toFixed(1)} ${units[unitIndex]}`;
};

const getPercentage = (used, limit) => {
  if (limit <= 0) return 0;
  return Math.min((used / limit) * 100, 100);
};

const formatPercentage = (percentage) => {
  if (percentage > 0 && percentage < 1) return "<1% used";
  return `${Math.round(percentage)}% used`;
};

function UsageMeter({ icon, label, used, limit, formatter, tone, isLoading }) {
  const UsageIcon = icon;
  const percentage = getPercentage(used, limit);

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-xl bg-current/10",
            tone,
          )}
        >
          <UsageIcon className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-foreground">{label}</p>
              {isLoading ? (
                <div className="mt-1 h-5 w-32 animate-pulse rounded-full bg-slate-200" />
              ) : (
                <p className="mt-1 text-sm font-bold text-foreground">
                  {formatter(used)}
                  <span className="font-medium text-muted-foreground">
                    {" "}/ {formatter(limit)}
                  </span>
                </p>
              )}
            </div>
            {!isLoading && (
              <span className="text-xs font-semibold text-muted-foreground">
                {formatPercentage(percentage)}
              </span>
            )}
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
            role="progressbar"
            aria-label={`${label} usage`}
            aria-valuemin={0}
            aria-valuemax={limit}
            aria-valuenow={used}
          >
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-500",
                isLoading ? "animate-pulse bg-slate-300" : "bg-primary",
              )}
              style={{ width: isLoading ? "35%" : `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const KnowledgeSourceUsage = ({
  usage,
  isLoading,
  isError,
  onRetry,
  onSearchContent,
}) => {
  const totalChunks = finiteNumber(usage?.total_chunks);
  const chunkLimit = finiteNumber(usage?.chunk_limit);
  const totalFileSize = finiteNumber(usage?.total_file_size_bytes);
  const fileSizeLimit = finiteNumber(usage?.file_size_limit_bytes);

  return (
    <Card className="grid overflow-hidden p-0 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-4 p-5 md:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-foreground">
              Knowledge usage
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Indexed content currently used against this chatbot&apos;s limits.
            </p>
          </div>
          {isError && (
            <Button size="sm" variant="outline" onClick={onRetry}>
              <RefreshCw />
              Retry usage
            </Button>
          )}
        </div>

        {isError ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.05] p-4 text-sm text-red-600">
            Knowledge usage is unavailable right now. Your source list is
            unaffected.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <UsageMeter
              icon={Database}
              label="Indexed chunks"
              used={totalChunks}
              limit={chunkLimit}
              formatter={(value) => finiteNumber(value).toLocaleString()}
              tone="text-primary"
              isLoading={isLoading}
            />
            <UsageMeter
              icon={HardDrive}
              label="File storage"
              used={totalFileSize}
              limit={fileSizeLimit}
              formatter={formatBytes}
              tone="text-violet-500"
              isLoading={isLoading}
            />
          </div>
        )}
      </div>

      <aside className="flex flex-col justify-center border-t bg-primary/[0.035] p-5 lg:border-l lg:border-t-0 lg:p-6">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Search className="size-5" />
        </span>
        <h2 className="mt-4 text-base font-bold text-foreground">
          Test indexed content
        </h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          Search the vector index to verify what your chatbot can retrieve from
          its knowledge sources.
        </p>
        <Button className="mt-5 w-full" onClick={onSearchContent}>
          <Search />
          Search Content
        </Button>
      </aside>
    </Card>
  );
};

export default KnowledgeSourceUsage;
