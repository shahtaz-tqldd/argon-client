import React from "react";

import { Ban, Download, MoreHorizontal, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SessionDropdown = ({
  setDeleteDialogOpen,
  setForceReturnDialogOpen,
  showForceReturnToAI = false,
  canForceReturnToAI = false,
  isOwnershipUpdating = false,
  isDeleting,
  onDelete,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon-sm" aria-label="More actions">
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="">
        <DropdownMenuItem>
          <Download />
          Download transcript
        </DropdownMenuItem>
        {showForceReturnToAI && (
          <DropdownMenuItem
            disabled={!canForceReturnToAI || isOwnershipUpdating}
            onSelect={() => setForceReturnDialogOpen(true)}
          >
            <Sparkles />
            Force return to AI
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive">
          <Ban />
          Block visitor
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          disabled={!onDelete || isDeleting}
          onSelect={() => setDeleteDialogOpen(true)}
        >
          <Trash2 />
          Delete Chat
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default SessionDropdown;
