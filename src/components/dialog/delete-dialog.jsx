import React from "react";
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

const DeleteDialog = ({ open, setOpen, onConfirm, isLoading = false }) => {
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[468px]">
        <DialogHeader>
          <DialogTitle>Are you Sure</DialogTitle>
          <DialogDescription className="mt-4">
            Please confirm that you really want to delete this item? Once you
            delete this item, there are no undo options.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-4">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={onConfirm} className="w-28" variant="destructive">
            {isLoading ? (
              <span className="spinner spinner-white"></span>
            ) : (
              "Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteDialog;
