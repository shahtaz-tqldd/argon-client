import {
  ListFilter,
  RotateCcw,
  Search,
  Sparkles,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sourceTypes = ["destination", "attraction", "cuisine", "activity"];

const VectorFilter = ({
  queryInput,
  sourceType,
  destinationId,
  sourceId,
  onQueryInputChange,
  onSearch,
  onClearSearch,
  onSourceTypeChange,
  onDestinationIdChange,
  onSourceIdChange,
  onReset,
}) => {
  const hasFilters = sourceType !== "all" || destinationId || sourceId;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/60">
      <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex shrink-0 items-center gap-2 text-sm font-semibold text-slate-700">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ListFilter className="h-4 w-4" />
          </span>
          Filter and search
        </div>

        <form
          onSubmit={onSearch}
          className="flex w-full gap-2 lg:max-w-xl"
        >
          <div className="relative min-w-0 flex-1">
            <Sparkles
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-primary"
              aria-hidden="true"
            />
            <Input
              value={queryInput}
              onChange={(event) => onQueryInputChange(event.target.value)}
              placeholder="Search by meaning, topic, or phrase…"
              aria-label="Semantic search query"
              className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-10 pr-10 shadow-none"
            />
            {queryInput && (
              <button
                type="button"
                onClick={onClearSearch}
                aria-label="Clear semantic search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            type="submit"
            className="h-11 rounded-xl px-4"
            disabled={!queryInput.trim()}
          >
            <Search /> Search
          </Button>
        </form>
      </div>

      <div
        className={cn(
          "grid gap-3 md:grid-cols-3",
          hasFilters &&
            "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto]",
        )}
      >
        <Select value={sourceType} onValueChange={onSourceTypeChange}>
          <SelectTrigger className="!h-11 w-full rounded-xl border-slate-200 bg-slate-50 px-3 shadow-none">
            <SelectValue placeholder="All source types" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">All source types</SelectItem>
            {sourceTypes.map((type) => (
              <SelectItem key={type} value={type} className="capitalize">
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          value={destinationId}
          onChange={(event) => onDestinationIdChange(event.target.value)}
          placeholder="Destination ID"
          aria-label="Filter by destination ID"
          className="h-11 rounded-xl border-slate-200 bg-slate-50 shadow-none"
        />
        <Input
          value={sourceId}
          onChange={(event) => onSourceIdChange(event.target.value)}
          placeholder="Source ID"
          aria-label="Filter by source ID"
          className="h-11 rounded-xl border-slate-200 bg-slate-50 shadow-none"
        />
        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            className="h-11 rounded-xl"
            onClick={onReset}
          >
            <RotateCcw /> Reset filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default VectorFilter;
