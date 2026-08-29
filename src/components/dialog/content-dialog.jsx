import React from "react";

// ui components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { DialogHeaderTitle } from "../ui/section";

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
  icon = null,
  footer,
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
          "flex h-fit max-h-[92dvh] flex-col gap-0 overflow-hidden rounded-3xl border-none bg-white p-0 shadow-xl sm:max-w-2xl",
          className,
          desktopClassName,
        )}
      >
        <div className="px-6 py-4 border-b">
          <DialogHeaderTitle title={title} details={description} icon={icon} />
        </div>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <DialogDescription className="sr-only">
          {description || title}
        </DialogDescription>
        <div className="hidden-scrollbar min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </div>

        <DialogFooter className="border-t bg-muted/20 px-6 py-4">
          {footer}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContentDialog;
