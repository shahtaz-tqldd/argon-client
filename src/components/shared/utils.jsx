const DetailRow = ({ icon, label, value }) => {
  const DetailIcon = icon;
  return (
    <div className="flex gap-3">
      <DetailIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 truncate text-xs font-medium">{value}</p>
      </div>
    </div>
  );
};

export { DetailRow };
