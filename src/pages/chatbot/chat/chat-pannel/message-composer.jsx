import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  FileText,
  LoaderCircle,
  MessageCircleMore,
  Mic,
  Paperclip,
  Send,
  Smile,
  Sparkles,
  UserRound,
  X,
} from "lucide-react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

import ConfirmDialog from "@/components/dialog/confirm-dialog";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useResolveSessionMutation } from "@/features/chat/chatApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { toast } from "sonner";
import {
  MAX_FILE_SIZE,
  MAX_FILE_COUNT,
  ACCEPTED_FILES,
  DOCUMENT_EXTENSIONS,
} from "@/constants/constraints";
import { EMOJIS } from "@/constants/emojis";

function getFileExtension(name) {
  return name.split(".").pop()?.toLowerCase() || "";
}

function isAcceptedFile(file) {
  return (
    file.type.startsWith("image/") ||
    DOCUMENT_EXTENSIONS.has(getFileExtension(file.name))
  );
}

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

const MessageComposer = ({
  chatbotSlug,
  sessionId,
  conversation,
  onSend,
  isSending = false,
  onTakeover,
  canTakeOver = false,
  canRelease = false,
  isOwnershipUpdating = false,
}) => {
  const [draft, setDraft] = useState("");
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [resolutionNote, setResolutionNote] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const draftRef = useRef("");
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const selectionRef = useRef({ start: 0, end: 0 });
  const [resolveSession, resolveState] = useResolveSessionMutation();
  const appendVoicePhrase = useCallback(
    (spokenPhrase, { resetTranscript: clearTranscript }) => {
      const phrase = spokenPhrase.trim();
      if (!phrase) return;

      setDraft((currentDraft) => {
        const nextDraft = `${currentDraft}${
          currentDraft && !currentDraft.endsWith(" ") ? " " : ""
        }${phrase}`;
        draftRef.current = nextDraft;
        return nextDraft;
      });
      clearTranscript();
    },
    [],
  );
  const voiceCommands = useMemo(
    () => [
      {
        command: "*",
        callback: appendVoicePhrase,
        matchInterim: false,
      },
    ],
    [appendVoicePhrase],
  );
  const {
    transcript,
    interimTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition({ commands: voiceCommands });

  useEffect(
    () => () => {
      SpeechRecognition.abortListening();
    },
    [],
  );

  const submitMessage = async () => {
    if (!onSend || isSending) return;

    if (listening) await SpeechRecognition.stopListening();
    const text = draftRef.current.trim();
    if (!text && attachments.length === 0) return;

    const succeeded = await onSend(text, attachments);
    if (succeeded !== false) {
      setDraft("");
      draftRef.current = "";
      setAttachments([]);
      setEmojiOpen(false);
      resetTranscript();
    }
  };

  const rememberSelection = (event) => {
    selectionRef.current = {
      start: event.currentTarget.selectionStart ?? draft.length,
      end: event.currentTarget.selectionEnd ?? draft.length,
    };
  };

  const insertEmoji = (emoji) => {
    const { start, end } = selectionRef.current;
    const safeStart = Math.min(start, draft.length);
    const safeEnd = Math.min(end, draft.length);
    const nextCaretPosition = safeStart + emoji.length;

    const nextDraft = `${draft.slice(0, safeStart)}${emoji}${draft.slice(safeEnd)}`;
    setDraft(nextDraft);
    draftRef.current = nextDraft;
    selectionRef.current = {
      start: nextCaretPosition,
      end: nextCaretPosition,
    };
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(
        nextCaretPosition,
        nextCaretPosition,
      );
    });
  };

  const handleFilesSelected = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";
    const acceptedFiles = [];

    selectedFiles.forEach((file) => {
      if (!isAcceptedFile(file)) {
        toast.error(`${file.name} is not a supported file type.`);
      } else if (file.size > MAX_FILE_SIZE) {
        toast.error(`${file.name} is larger than 5 MB.`);
      } else {
        acceptedFiles.push(file);
      }
    });

    setAttachments((currentAttachments) => {
      const availableSlots = MAX_FILE_COUNT - currentAttachments.length;
      if (acceptedFiles.length > availableSlots) {
        toast.error(`You can attach up to ${MAX_FILE_COUNT} files.`);
      }
      return [
        ...currentAttachments,
        ...acceptedFiles.slice(0, Math.max(0, availableSlots)),
      ];
    });
  };

  const toggleVoiceInput = async () => {
    if (!browserSupportsSpeechRecognition || isMicrophoneAvailable === false) {
      toast.error("Speech input is not available in this browser.");
      return;
    }

    if (listening) {
      await SpeechRecognition.stopListening();
      return;
    }

    try {
      resetTranscript();
      await SpeechRecognition.startListening({ continuous: true });
    } catch {
      toast.error("Unable to start voice input. Check microphone access.");
    }
  };

  const handleResolve = async () => {
    if (resolveState.isLoading) return;

    try {
      const response = await resolveSession({
        chatbotSlug,
        sessionId,
        payload: {
          note: resolutionNote.trim(),
          resolution_type: "resolved",
        },
      }).unwrap();

      setResolveDialogOpen(false);
      setResolutionNote("");
      toast.success(response?.message || "Session resolved successfully.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Unable to resolve this session."));
    }
  };

  return (
    <>
      <footer className="shrink-0 border-t bg-card p-4">
        <div className="mx-auto max-w-3xl rounded-xl border bg-background shadow-sm transition focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10">
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              draftRef.current = event.target.value;
              rememberSelection(event);
            }}
            onSelect={rememberSelection}
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                !event.shiftKey &&
                !event.nativeEvent.isComposing
              ) {
                event.preventDefault();
                void submitMessage();
              }
            }}
            disabled={isSending}
            className="min-h-20 w-full resize-none bg-transparent px-4 py-3 text-sm outline-none placeholder:text-muted-foreground"
            placeholder={`Reply to ${conversation.name.split(" ")[0]}…`}
          />
          {listening && (
            <div
              className="mx-3 mb-2 flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive"
              aria-live="polite"
            >
              <span className="size-2 animate-pulse rounded-full bg-destructive" />
              <span className="min-w-0 flex-1 truncate">
                Listening
                {transcript || interimTranscript
                  ? `: ${transcript || interimTranscript}`
                  : "…"}
              </span>
            </div>
          )}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 border-t px-3 py-2">
              {attachments.map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex min-w-0 max-w-64 items-center gap-2 rounded-lg border bg-muted/40 px-2.5 py-1.5"
                >
                  <FileText className="size-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-medium">
                      {file.name}
                    </span>
                    <span className="block text-[10px] text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    aria-label={`Remove ${file.name}`}
                    onClick={() =>
                      setAttachments((currentAttachments) =>
                        currentAttachments.filter(
                          (_, attachmentIndex) => attachmentIndex !== index,
                        ),
                      )
                    }
                  >
                    <X className="size-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center gap-0.5">
              <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label="Insert emoji"
                    disabled={isSending}
                  >
                    <Smile />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  align="start"
                  className="grid w-64 grid-cols-6 gap-1 p-2"
                >
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="flex size-8 items-center justify-center rounded-md text-lg hover:bg-muted"
                      onClick={() => insertEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </PopoverContent>
              </Popover>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept={ACCEPTED_FILES}
                multiple
                onChange={handleFilesSelected}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                aria-label="Attach files"
                disabled={isSending}
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip />
              </Button>
              <span className="relative inline-flex">
                {listening && (
                  <span className="pointer-events-none absolute inset-0 animate-ping rounded-full bg-rose-500/35" />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className={
                    listening
                      ? "relative z-10 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 dark:bg-rose-950/50 dark:text-rose-400 dark:hover:bg-rose-950"
                      : "relative z-10 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                  }
                  aria-label={
                    listening ? "Stop voice input" : "Start voice input"
                  }
                  title={
                    browserSupportsSpeechRecognition
                      ? listening
                        ? "Stop voice input"
                        : "Start voice input"
                      : "Speech input is not supported by this browser"
                  }
                  disabled={isSending}
                  onClick={toggleVoiceInput}
                >
                  <Mic />
                </Button>
              </span>
            </div>
            <div className="flex items-center gap-2">
              {conversation.requires_attention && (
                <Button
                  onClick={() => setResolveDialogOpen(true)}
                  disabled={resolveState.isLoading}
                  variant="outline"
                  size="icon-sm"
                  aria-label="Resolve session"
                  title="Resolve session"
                >
                  <Check />
                </Button>
              )}
              <Button
                onClick={() => onTakeover?.()}
                disabled={
                  !onTakeover ||
                  isOwnershipUpdating ||
                  (!canTakeOver && !canRelease)
                }
                variant={canTakeOver ? "default" : "outline"}
                size="sm"
              >
                {isOwnershipUpdating ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    Updating
                  </>
                ) : canRelease ? (
                  <>
                    <Sparkles />
                    Return to AI
                  </>
                ) : (
                  <>
                    <UserRound />
                    Assigned
                  </>
                )}
              </Button>
              <Button
                onClick={submitMessage}
                disabled={
                  (!draft.trim() &&
                    !transcript.trim() &&
                    attachments.length === 0) ||
                  isSending
                }
                size="sm"
              >
                {isSending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <Send />
                )}
                {isSending ? "Sending" : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </footer>

      <ConfirmDialog
        open={resolveDialogOpen}
        setOpen={(open) => {
          setResolveDialogOpen(open);
          if (!open && !resolveState.isLoading) setResolutionNote("");
        }}
        title="Resolve session?"
        description="Add an optional note describing how this session was resolved."
        confirmText="Resolve session"
        onConfirm={handleResolve}
        isLoading={resolveState.isLoading}
      >
        <div className="space-y-2">
          <Textarea
            value={resolutionNote}
            onChange={(event) => setResolutionNote(event.target.value)}
            maxLength={512}
            rows={4}
            placeholder="Resolution note (optional)"
            aria-label="Resolution note"
            disabled={resolveState.isLoading}
          />
          <p className="text-right text-xs text-muted-foreground">
            {resolutionNote.length}/512
          </p>
        </div>
      </ConfirmDialog>
    </>
  );
};

export default MessageComposer;
