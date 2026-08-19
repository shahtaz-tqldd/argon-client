import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Ellipsis } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Select, SelectItem, SelectContent, SelectTrigger } from "../ui/select";
import Pagination from "./pagination";
import DeleteDialog from "../dialog/delete-dialog";
import { useState } from "react";
import { Checkbox } from "../ui/checkbox";

function TableSkeleton({ columns, rows = 5 }) {
  return Array.from({ length: rows }).map((_, rowIndex) => (
    <TableRow key={rowIndex} className="border-slate-100 hover:bg-transparent">
      {columns.map((column, columnIndex) => (
        <TableCell
          key={column.accessorKey}
          className={`px-5 py-4 ${columnIndex === columns.length - 1 ? "text-right" : ""}`}
        >
          <div
            className={`h-4 animate-pulse rounded-full bg-slate-200 ${
              columnIndex === 0
                ? "w-44"
                : columnIndex === columns.length - 1
                  ? "ml-auto w-10"
                  : "w-28"
            }`}
          />
        </TableCell>
      ))}
    </TableRow>
  ));
}

const ReusableTable = ({
  data,
  columns,
  isLoading,
  totalItems,
  page,
  setPage,
  pageSize,
  setPageSize,
  table_options,
  onDeleteConfirm,
  deleteLoading,
  className,
  selectedIds = [],
  onSelectedIdsChange,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const openDeleteDialog = (id) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (!selectedId) return;
    await onDeleteConfirm(selectedId);
    setDeleteDialogOpen(false);
    setSelectedId(null);
  };

  const hasData = data?.length > 0;
  const itemStart = totalItems ? (page - 1) * pageSize + 1 : 0;
  const itemEnd = Math.min(page * pageSize, totalItems || 0);
  const shouldShowPagination = totalItems > pageSize;
  const selectable = Boolean(onSelectedIdsChange);
  const pageIds = data?.map((item) => item.id).filter(Boolean) || [];
  const selectedSet = new Set(selectedIds);
  const allPageSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedSet.has(id));
  const somePageSelected = pageIds.some((id) => selectedSet.has(id));

  const togglePage = (checked) => {
    const next = new Set(selectedIds);
    pageIds.forEach((id) => (checked ? next.add(id) : next.delete(id)));
    onSelectedIdsChange([...next]);
  };

  const toggleRow = (id, checked) => {
    const next = new Set(selectedIds);
    checked ? next.add(id) : next.delete(id);
    onSelectedIdsChange([...next]);
  };

  return (
    <section className={className}>
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
        <Table>
          <TableHeader className="bg-slate-50/90">
            <TableRow className="border-slate-200 hover:bg-transparent">
              {selectable && (
                <TableHead className="h-14 w-12 px-5">
                  <Checkbox
                    aria-label="Select all rows on this page"
                    checked={
                      allPageSelected
                        ? true
                        : somePageSelected
                          ? "indeterminate"
                          : false
                    }
                    onCheckedChange={(checked) => togglePage(checked === true)}
                  />
                </TableHead>
              )}
              {columns.map((column, i) => (
                <TableHead
                  key={column.accessorKey}
                  className={`h-14 px-5 text-xs font-semibold uppercase tracking-[0.04em] text-slate-500 ${
                    i === columns.length - 1 ? "text-right" : ""
                  }`}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton
                columns={
                  selectable
                    ? [
                        { header: "Select", accessorKey: "selection" },
                        ...columns,
                      ]
                    : columns
                }
                rows={Math.min(pageSize || 5, 5)}
              />
            ) : !hasData ? (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="h-56 p-5"
                >
                  <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 text-center">
                    <p className="text-sm font-semibold text-slate-700">
                      No entry found
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      There are no records to show right now.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, i) => (
                <TableRow
                  key={item.id || i}
                  className="border-slate-100 transition-colors hover:bg-primary/5"
                >
                  {selectable && (
                    <TableCell className="w-12 px-5 py-4">
                      <Checkbox
                        aria-label={`Select ${item.raw_name || item.id}`}
                        checked={selectedSet.has(item.id)}
                        onCheckedChange={(checked) =>
                          toggleRow(item.id, checked === true)
                        }
                      />
                    </TableCell>
                  )}
                  {columns.map((column, j) => (
                    <TableCell
                      key={j}
                      className={`px-5 py-4 text-slate-700 ${
                        j === columns.length - 1 ? "text-right" : ""
                      }`}
                    >
                      {column.accessorKey === "action" ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger className="rounded-full outline-none transition hover:bg-slate-100 focus-visible:ring-4 focus-visible:ring-primary/10">
                            <Ellipsis className="h-9 w-9 rounded-full p-2.5 text-slate-500" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-2xl border-slate-200 p-1 shadow-lg"
                          >
                            {table_options
                              ?.filter((option) => !option.hidden?.(item))
                              .map((option, idx) => (
                                <DropdownMenuItem
                                  key={idx}
                                  disabled={option.disabled?.(item)}
                                  onClick={() =>
                                    option.type === "delete"
                                      ? openDeleteDialog(item.id)
                                      : option?.action?.(item.id, item)
                                  }
                                  className={`rounded-xl px-3 py-2 ${
                                    option.type === "delete"
                                      ? "text-red-600 focus:text-red-600"
                                      : ""
                                  }`}
                                >
                                  {option.label}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        item[column.accessorKey]
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        {shouldShowPagination && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-white px-5 py-4">
            <div className="flx gap-3">
              <Select
                value={String(pageSize)}
                onValueChange={(value) => {
                  setPageSize(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="h-10 rounded-2xl border-slate-200 bg-slate-50 px-4">
                  {pageSize}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                Showing {itemStart} to {itemEnd} of {totalItems} items
              </p>
            </div>
            <Pagination
              page={page}
              setPage={setPage}
              pageSize={pageSize}
              total={totalItems}
            />
          </div>
        )}
      </div>
      <DeleteDialog
        open={deleteDialogOpen}
        setOpen={setDeleteDialogOpen}
        onConfirm={handleConfirm}
        isLoading={deleteLoading}
      />
    </section>
  );
};

export default ReusableTable;
