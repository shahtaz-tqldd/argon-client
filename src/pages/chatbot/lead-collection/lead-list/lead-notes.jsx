import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

import ConfirmDialog from "@/components/dialog/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateLeadNoteMutation,
  useDeleteLeadNoteMutation,
  useLeadNoteDetailQuery,
  useLeadNoteListQuery,
  useUpdateLeadNoteMutation,
} from "@/features/lead_captures/leadCaptureApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { getInitials } from "@/lib/utils";

import { formatDateTime } from "./lead-utils";

const NOTE_PAGE_SIZE = 10;

const unwrapData = (response) => response?.data ?? response;

function NoteSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading notes">
      {[0, 1, 2].map((item) => (
        <div key={item} className="animate-pulse rounded-2xl border p-4">
          <div className="h-3 w-28 rounded bg-muted" />
          <div className="mt-4 h-3 w-full rounded bg-muted" />
          <div className="mt-2 h-3 w-3/4 rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

function EditNoteDialog({ chatbotSlug, leadId, noteId, onClose }) {
  const [content, setContent] = useState(null);
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useLeadNoteDetailQuery(
    { chatbotSlug, leadId, noteId },
    { skip: !chatbotSlug || !leadId || !noteId },
  );
  const [updateNote, { isLoading: isUpdating }] =
    useUpdateLeadNoteMutation();
  const note = unwrapData(data);
  const editorContent = content ?? note?.content ?? "";

  const save = async () => {
    const nextContent = editorContent.trim();
    if (!nextContent || nextContent === note?.content) return;

    try {
      await updateNote({
        chatbotSlug,
        leadId,
        noteId,
        payload: { content: nextContent },
      }).unwrap();
      toast.success("Note updated");
      onClose();
    } catch (updateError) {
      toast.error(getApiErrorMessage(updateError, "Unable to update this note."));
    }
  };

  return (
    <Dialog open={Boolean(noteId)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit note</DialogTitle>
          <DialogDescription>
            Update this internal note for everyone managing the lead.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="h-32 animate-pulse rounded-xl bg-muted" />
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{getApiErrorMessage(error, "Unable to load this note.")}</p>
            <Button className="mt-3" size="sm" variant="outline" onClick={refetch}>
              <RefreshCw /> Retry
            </Button>
          </div>
        ) : (
          <Textarea
            value={editorContent}
            onChange={(event) => setContent(event.target.value)}
            className="min-h-36 resize-y rounded-xl"
            aria-label="Note content"
            autoFocus
          />
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={save}
            disabled={
              isLoading ||
              isError ||
              isUpdating ||
              !editorContent.trim() ||
              editorContent.trim() === note?.content
            }
          >
            {isUpdating ? <span className="spinner spinner-white" /> : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NoteCard({ note, onEdit, onDelete }) {
  const authorName = note.author?.name || note.author?.email || "Team member";
  const wasEdited =
    note.updated_at &&
    note.created_at &&
    new Date(note.updated_at).getTime() > new Date(note.created_at).getTime();

  return (
    <article className="group rounded-2xl border bg-background p-4 transition-colors hover:border-primary/20">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
            {getInitials(authorName)}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold">{authorName}</p>
            <p className="text-[10px] text-muted-foreground">
              {formatDateTime(note.created_at)}{wasEdited ? " · Edited" : ""}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center opacity-70 transition-opacity group-hover:opacity-100">
          <Button
            size="icon-xs"
            variant="ghost"
            onClick={() => onEdit(note.id)}
            aria-label="Edit note"
            title="Edit note"
          >
            <Pencil />
          </Button>
          <Button
            size="icon-xs"
            variant="ghost"
            className="text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={() => onDelete(note)}
            aria-label="Delete note"
            title="Delete note"
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-foreground/90">
        {note.content}
      </p>
    </article>
  );
}

function LeadNotes({ chatbotSlug, leadId, startComposing = false }) {
  const [page, setPage] = useState(1);
  const [content, setContent] = useState("");
  const [composerOpen, setComposerOpen] = useState(startComposing);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [deletingNote, setDeletingNote] = useState(null);
  const composerRef = useRef(null);
  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useLeadNoteListQuery(
    { chatbotSlug, leadId, page, pageSize: NOTE_PAGE_SIZE },
    { skip: !chatbotSlug || !leadId },
  );
  const [createNote, { isLoading: isCreating }] = useCreateLeadNoteMutation();
  const [deleteNote, { isLoading: isDeleting }] = useDeleteLeadNoteMutation();
  const notes = Array.isArray(data?.data) ? data.data : [];
  const total = data?.meta?.count ?? notes.length;
  const totalPages = data?.meta?.num_pages ?? Math.max(1, Math.ceil(total / NOTE_PAGE_SIZE));

  useEffect(() => {
    if (composerOpen) composerRef.current?.focus();
  }, [composerOpen]);

  const submitNote = async () => {
    const nextContent = content.trim();
    if (!nextContent) return;

    try {
      await createNote({
        chatbotSlug,
        leadId,
        payload: { content: nextContent },
      }).unwrap();
      setContent("");
      setComposerOpen(false);
      setPage(1);
      toast.success("Note added");
    } catch (createError) {
      toast.error(getApiErrorMessage(createError, "Unable to add this note."));
    }
  };

  const confirmDelete = async () => {
    if (!deletingNote) return;

    try {
      await deleteNote({
        chatbotSlug,
        leadId,
        noteId: deletingNote.id,
      }).unwrap();
      setDeletingNote(null);
      if (notes.length === 1 && page > 1) setPage((current) => current - 1);
      toast.success("Note deleted");
    } catch (deleteError) {
      toast.error(getApiErrorMessage(deleteError, "Unable to delete this note."));
    }
  };

  return (
    <section aria-labelledby="lead-notes-title">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 id="lead-notes-title" className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
              Notes
            </h3>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
              {total}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Private to your team</p>
        </div>
        {!composerOpen && (
          <Button size="sm" onClick={() => setComposerOpen(true)}>
            <Plus /> Add note
          </Button>
        )}
      </div>

      {composerOpen && (
        <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/[0.025] p-3">
          <Textarea
            ref={composerRef}
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Add context, a follow-up reminder, or the outcome of a call…"
            className="min-h-28 resize-y border-0 bg-background shadow-none focus-visible:ring-2"
            aria-label="New note"
          />
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-[10px] text-muted-foreground">Visible to lead managers only</p>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setComposerOpen(false);
                  setContent("");
                }}
                disabled={isCreating}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={submitNote} disabled={isCreating || !content.trim()}>
                {isCreating ? <span className="spinner spinner-white" /> : "Save note"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4">
        {isLoading ? (
          <NoteSkeleton />
        ) : isError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <p>{getApiErrorMessage(error, "Unable to load notes.")}</p>
            <Button className="mt-3" size="sm" variant="outline" onClick={refetch}>
              <RefreshCw /> Retry
            </Button>
          </div>
        ) : notes.length ? (
          <div className={isFetching ? "space-y-3 opacity-60" : "space-y-3"}>
            {notes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={setEditingNoteId}
                onDelete={setDeletingNote}
              />
            ))}
          </div>
        ) : (
          <div className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-dashed bg-muted/20 p-5 text-center">
            <span className="flex size-9 items-center justify-center rounded-full bg-muted">
              <FileText className="size-4 text-muted-foreground" />
            </span>
            <p className="mt-3 text-sm font-semibold">No notes yet</p>
            <p className="mt-1 max-w-64 text-xs text-muted-foreground">
              Add useful context so anyone can continue the conversation.
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between border-t pt-3">
          <p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p>
          <div className="flex gap-1">
            <Button
              size="icon-sm"
              variant="outline"
              disabled={page <= 1 || isFetching}
              onClick={() => setPage((current) => current - 1)}
              aria-label="Previous notes page"
            >
              <ChevronLeft />
            </Button>
            <Button
              size="icon-sm"
              variant="outline"
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((current) => current + 1)}
              aria-label="Next notes page"
            >
              <ChevronRight />
            </Button>
          </div>
        </div>
      )}

      {editingNoteId && (
        <EditNoteDialog
          chatbotSlug={chatbotSlug}
          leadId={leadId}
          noteId={editingNoteId}
          onClose={() => setEditingNoteId(null)}
        />
      )}

      <ConfirmDialog
        open={Boolean(deletingNote)}
        setOpen={(open) => !open && !isDeleting && setDeletingNote(null)}
        title="Delete this note?"
        description="This note will be permanently removed from the lead history."
        confirmText="Delete note"
        confirmVariant="destructive"
        onConfirm={confirmDelete}
        isLoading={isDeleting}
      />
    </section>
  );
}

export default LeadNotes;
