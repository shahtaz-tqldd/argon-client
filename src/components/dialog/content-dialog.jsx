import React from "react";

// ui components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/lib/mobile-visible";

/**
 * Responsive modal for rich preview and form content.
 *
 * It is centered on desktop and presented as a rounded bottom drawer on
 * mobile. Content scrolls inside the surface so the drawer never exceeds the
 * available viewport height.
 */
const ContentDialog = ({
  open,
  onOpenChange,
  children,
  title = "Preview",
  description,
  className,
  desktopClassName,
  mobileClassName,
}) => {
  const isMobile = useMediaQuery();

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="bottom"
          className={cn(
            "max-h-[90dvh] gap-0 overflow-hidden rounded-t-3xl border-x-0 border-b-0 bg-white p-0 pt-4",
            className,
            mobileClassName,
          )}
        >
          <SheetTitle className="sr-only">{title}</SheetTitle>
          <SheetDescription className="sr-only">
            {description || title}
          </SheetDescription>
          <div className="hidden-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
            {children}
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "flex h-[92dvh] max-h-[92dvh] flex-col gap-0 overflow-hidden rounded-3xl border-none bg-white p-0 shadow-xl sm:max-w-2xl",
          className,
          desktopClassName,
        )}
      >
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          {description || title}
        </DialogDescription>
        <div className="hidden-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentDialog;
