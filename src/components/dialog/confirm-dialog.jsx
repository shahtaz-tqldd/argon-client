import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ConfirmDialog = ({
  open,
  setOpen,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "default",
  onConfirm,
  isLoading = false,
}) => (
  <Dialog open={open} onOpenChange={setOpen}>
    <DialogContent className="sm:max-w-[468px]">
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="mt-4">{description}</DialogDescription>
      </DialogHeader>

      <DialogFooter className="mt-4">
        <DialogClose asChild>
          <Button variant="outline" disabled={isLoading}>
            {cancelText}
          </Button>
        </DialogClose>
        <Button
          onClick={onConfirm}
          variant={confirmVariant}
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="spinner spinner-white" />
          ) : (
            confirmText
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);

export default ConfirmDialog;
