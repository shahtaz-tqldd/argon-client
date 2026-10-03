import { useEffect, useRef, useState } from "react";
import {
  Check,
  FileText,
  LoaderCircle,
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

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const MAX_FILE_COUNT = 5;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ACCEPTED_FILES = ".pdf,.doc,.docx,.xls,.xlsx,.csv,image/*";
const EMOJIS = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😂",
  "🙂",
  "😉",
  "😊",
  "😍",
  "🥳",
  "😎",
  "🤔",
  "🤗",
  "😴",
  "😢",
  "😭",
  "😮",
  "👍",
  "👎",
  "👏",
  "🙏",
  "💪",
  "👋",
  "🎉",
  "❤️",
  "✨",
  "⭐",
  "🔥",
  "💡",
  "✅",
  "❌",
  "☕",
];

function formatFileSize(size) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function MessageComposer({
  conversation,
  onSend,
  isSending = false,
  onResolve,
  isResolving = false,
  onOwnershipChange,
  isOwnershipUpdating = false,
  canTakeOver = false,
  canRelease = false,
}) {
  const [draft, setDraft] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [attachmentError, setAttachmentError] = useState("");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const emojiButtonRef = useRef(null);
  const selectionRef = useRef({ start: 0, end: 0 });
  const {
    browserSupportsSpeechRecognition,
    finalTranscript,
    interimTranscript,
    isMicrophoneAvailable,
    listening,
    resetTranscript,
  } = useSpeechRecognition();

  const voiceText = finalTranscript.trim();
  const composedValue = `${draft}${
    voiceText ? `${draft && !draft.endsWith(" ") ? " " : ""}${voiceText}` : ""
  }`;
  const canUseVoice =
    browserSupportsSpeechRecognition && isMicrophoneAvailable !== false;
  const canSubmit = composedValue.trim().length > 0 && !isSending;
  const recipientName = conversation.name?.split(" ")[0] || "customer";

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 176)}px`;
  }, [composedValue]);

  useEffect(() => {
    if (!attachmentError) return undefined;
    const timeout = window.setTimeout(() => setAttachmentError(""), 4000);
    return () => window.clearTimeout(timeout);
  }, [attachmentError]);

  useEffect(() => {
    if (!isEmojiOpen) return undefined;

    const closeEmojiPicker = (event) => {
      if (
        event.key === "Escape" ||
        (event.type === "pointerdown" &&
          !emojiPickerRef.current?.contains(event.target) &&
          !emojiButtonRef.current?.contains(event.target))
      ) {
        setIsEmojiOpen(false);
      }
    };

    document.addEventListener("keydown", closeEmojiPicker);
    document.addEventListener("pointerdown", closeEmojiPicker);
    return () => {
      document.removeEventListener("keydown", closeEmojiPicker);
      document.removeEventListener("pointerdown", closeEmojiPicker);
    };
  }, [isEmojiOpen]);

  const rememberSelection = (event) => {
    selectionRef.current = {
      start: event.currentTarget.selectionStart ?? composedValue.length,
      end: event.currentTarget.selectionEnd ?? composedValue.length,
    };
  };

  const updateDraft = (event) => {
    if (listening) SpeechRecognition.stopListening();
    resetTranscript();
    setDraft(event.target.value);
    rememberSelection(event);
  };

  const insertEmoji = (emoji) => {
    const currentValue = composedValue;
    const start = Math.min(selectionRef.current.start, currentValue.length);
    const end = Math.min(selectionRef.current.end, currentValue.length);
    const nextValue =
      currentValue.slice(0, start) + emoji + currentValue.slice(end);
    const nextPosition = start + emoji.length;

    if (listening) SpeechRecognition.stopListening();
    resetTranscript();
    setDraft(nextValue);
    selectionRef.current = { start: nextPosition, end: nextPosition };
    window.requestAnimationFrame(() => {
      if (!textareaRef.current) return;
      textareaRef.current.focus();
      textareaRef.current.selectionStart = nextPosition;
      textareaRef.current.selectionEnd = nextPosition;
    });
  };

  const selectFiles = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    event.target.value = "";
    const validFiles = selectedFiles.filter((file) => {
      if (file.size <= MAX_FILE_SIZE) return true;
      setAttachmentError(`${file.name} is larger than 5 MB.`);
      return false;
    });
    const availableSlots = Math.max(0, MAX_FILE_COUNT - attachments.length);

    if (validFiles.length > availableSlots) {
      setAttachmentError(`You can attach up to ${MAX_FILE_COUNT} files.`);
    }
    setAttachments((current) => [
      ...current,
      ...validFiles.slice(0, availableSlots),
    ]);
  };

  const toggleVoiceInput = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      return;
    }
    if (voiceText) {
      setDraft(composedValue);
      resetTranscript();
    }
    void SpeechRecognition.startListening({
      continuous: true,
      language: navigator.language,
    });
  };

  const submitMessage = async () => {
    const text = composedValue.trim();
    if (!text || !onSend || isSending) return;
    if (listening) SpeechRecognition.stopListening();

    const succeeded = await onSend(text, attachments);
    if (succeeded === false) return;

    setDraft("");
    setAttachments([]);
    setIsEmojiOpen(false);
    resetTranscript();
    selectionRef.current = { start: 0, end: 0 };
  };

  return (
    <footer className="shrink-0 border-t bg-card p-4">
      <div className="relative mx-auto max-w-3xl rounded-2xl border bg-background shadow-sm transition focus-within:border-primary focus-within:ring-3 focus-within:ring-primary/10">
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 border-b px-3 py-2.5">
            {attachments.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${index}`}
                className="flex min-w-0 max-w-56 items-center gap-2 rounded-lg border bg-muted/40 py-1.5 pl-2 pr-1.5"
              >
                <span className="center size-7 shrink-0 rounded-md bg-primary/10 text-primary">
                  <FileText className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[11px] font-semibold">
                    {file.name}
                  </span>
                  <span className="block text-[9px] text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </span>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="size-5"
                  aria-label={`Remove ${file.name}`}
                  onClick={() =>
                    setAttachments((current) =>
                      current.filter((_, itemIndex) => itemIndex !== index),
                    )
                  }
                >
                  <X className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {attachmentError && (
          <p className="px-4 pt-2 text-[11px] font-medium text-destructive" role="alert">
            {attachmentError}
          </p>
        )}

        {listening && (
          <div className="mx-3 mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-400">
            <span className="size-2 animate-pulse rounded-full bg-red-500" />
            <span className="min-w-0 flex-1 truncate">
              Listening{interimTranscript ? `: ${interimTranscript}` : "…"}
            </span>
            <button type="button" className="font-semibold" onClick={toggleVoiceInput}>
              Stop
            </button>
          </div>
        )}

        <textarea
          ref={textareaRef}
          rows="1"
          maxLength={10000}
          value={composedValue}
          onChange={updateDraft}
          onClick={rememberSelection}
          onKeyUp={rememberSelection}
          onSelect={rememberSelection}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              void submitMessage();
            }
          }}
          disabled={isSending}
          className="max-h-44 min-h-24 w-full resize-none bg-transparent px-4 pb-3 pt-4 text-sm outline-none placeholder:text-muted-foreground"
          placeholder={`Reply to ${recipientName}…`}
          aria-label={`Reply to ${recipientName}`}
        />

        {isEmojiOpen && (
          <div
            ref={emojiPickerRef}
            role="menu"
            aria-label="Choose an emoji"
            className="absolute bottom-12 left-2 z-20 grid w-64 grid-cols-8 gap-1 rounded-xl border bg-popover p-2 text-popover-foreground shadow-lg"
          >
            {EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                role="menuitem"
                className="center aspect-square rounded-md text-lg hover:bg-accent"
                onPointerDown={(event) => {
                  event.preventDefault();
                  insertEmoji(emoji);
                }}
                onClick={(event) => {
                  if (event.detail === 0) insertEmoji(emoji);
                }}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between px-2 pb-2">
          <div className="flex items-center gap-0.5">
            <Button
              ref={emojiButtonRef}
              variant="ghost"
              size="icon-sm"
              aria-label="Insert emoji"
              aria-expanded={isEmojiOpen}
              aria-haspopup="menu"
              onClick={() => setIsEmojiOpen((current) => !current)}
            >
              <Smile />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Attach file"
              title="PDF, Word, Excel, CSV or image (max 5 MB)"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip />
            </Button>
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(
                listening && "bg-red-500/10 text-red-600 hover:bg-red-500/15 hover:text-red-600",
              )}
              aria-label={listening ? "Stop voice input" : "Start voice input"}
              aria-pressed={listening}
              disabled={!canUseVoice}
              title={canUseVoice ? "Voice input" : "Voice input is not supported in this browser"}
              onClick={toggleVoiceInput}
            >
              <Mic />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {conversation.requires_attention && (
              <Button
                onClick={onResolve}
                disabled={isResolving}
                variant="outline"
                size="icon-sm"
                aria-label="Resolve session"
                title="Resolve session"
              >
                <Check />
              </Button>
            )}
            <Button
              onClick={() => onOwnershipChange?.(conversation)}
              disabled={
                !onOwnershipChange ||
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
            <Button onClick={submitMessage} disabled={!canSubmit} size="sm">
              {isSending ? <LoaderCircle className="animate-spin" /> : <Send />}
              {isSending ? "Sending" : "Send"}
            </Button>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_FILES}
          multiple
          hidden
          onChange={selectFiles}
        />
      </div>
    </footer>
  );
}

export default MessageComposer;
