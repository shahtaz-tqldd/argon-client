import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Bot, Camera, Check, Plus, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

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
import { FloatingInput } from "@/components/ui/input";
import { FloatingTextarea } from "@/components/ui/textarea";
import { useCreateChatbotMutation } from "@/features/chatbot/chatbotApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { MAX_LOGO_SIZE, SUPPORTED_LOGO_TYPES } from "@/constants/constraints";
import { cn, getInitials } from "@/lib/utils";
import { formatFileSize } from "@/lib/file-handle";

const CHATBOT_PLANS = [
  { label: "Free", price: 0 },
  { label: "Starter", price: 39, messages: 1000 },
  { label: "Growth", price: 59, messages: 2000 },
  { label: "Business", price: 99, messages: 3500 },
];

const getCreatedChatbot = (response) => {
  const data = response?.data?.data || response?.data || response;
  return data?.chatbot || data;
};

const CreateChatbotDialog = ({
  open,
  onOpenChange,
  workspaceSlug,
  workspaceName = "your workspace",
  onCreated,
}) => {
  const logoInputRef = useRef(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("Free");
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createChatbot] = useCreateChatbotMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const chatbotName = useWatch({ control, name: "name" });

  useEffect(
    () => () => {
      if (logoPreview) URL.revokeObjectURL(logoPreview);
    },
    [logoPreview],
  );

  const resetDialog = () => {
    reset({ name: "", description: "" });
    setLogoFile(null);
    setLogoPreview("");
    setSelectedPlan("Free");
    setSubmissionError("");
  };

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen && isSubmitting) return;
    if (!nextOpen) resetDialog();
    onOpenChange(nextOpen);
  };

  const selectLogo = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!SUPPORTED_LOGO_TYPES.includes(file.type)) {
      toast.error("Choose a PNG, JPG, or WebP image");
      return;
    }

    if (file.size > MAX_LOGO_SIZE) {
      toast.error("Chatbot logo must be smaller than 5 MB");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const clearSelectedLogo = () => {
    setLogoFile(null);
    setLogoPreview("");
  };

  const closeAfterCreation = () => {
    resetDialog();
    onOpenChange(false);
  };

  const submitChatbot = async (values) => {
    setSubmissionError("");
    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("name", values.name.trim());
    payload.append("description", values.description.trim());
    payload.append("workspace_slug", workspaceSlug);
    payload.append("plan", selectedPlan);
    if (logoFile) payload.append("logo", logoFile);

    try {
      const response = await createChatbot({ payload }).unwrap();
      const chatbot = getCreatedChatbot(response);

      try {
        await onCreated?.(chatbot);
      } catch {
        // The chatbot was created successfully even if refreshing its parent fails.
      }

      closeAfterCreation();
      toast.success("Chatbot created successfully");
    } catch (error) {
      setSubmissionError(
        getApiErrorMessage(error, "Unable to create the chatbot."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-3xl p-0 sm:max-w-2xl">
        <form onSubmit={handleSubmit(submitChatbot)}>
          <DialogHeader className="border-b border-border bg-muted/40 px-6 py-6">
            <div className="mb-2 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Bot className="size-5" />
            </div>
            <DialogTitle>Create a chatbot</DialogTitle>
            <DialogDescription className="leading-6">
              Add an identity for your assistant and choose a plan for it in{" "}
              {workspaceName}.
            </DialogDescription>
          </DialogHeader>

            <div className="space-y-6 px-6 py-6">
              <section className="flex flex-col gap-5 sm:flex-row">
                <div className="w-full shrink-0 sm:w-32">
                  <div className="group relative mx-auto size-28 overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/20 via-primary/10 to-cyan-100 shadow-sm dark:to-cyan-950/40 sm:mx-0">
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt={`${chatbotName || "Chatbot"} logo preview`}
                        className="h-full w-full object-cover"
                      />
                    ) : chatbotName?.trim() ? (
                      <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-primary">
                        {getInitials(chatbotName)}
                      </div>
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-primary">
                        <Bot className="size-8" />
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isSubmitting}
                      className="absolute inset-0 flex items-center justify-center bg-black/25 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 disabled:pointer-events-none"
                      aria-label="Upload chatbot logo"
                    >
                      <Camera className="size-6" />
                    </button>

                    {logoFile && (
                      <Button
                        type="button"
                        size="icon-xs"
                        variant="destructive"
                        onClick={clearSelectedLogo}
                        disabled={isSubmitting}
                        aria-label="Discard selected logo"
                        className="absolute right-2 top-2"
                      >
                        <X />
                      </Button>
                    )}
                  </div>

                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={selectLogo}
                    disabled={isSubmitting}
                    className="sr-only"
                  />

                  <div className="mt-2 text-center text-[10px] text-muted-foreground sm:text-left">
                    <p className="truncate">
                      {logoFile ? logoFile.name : "PNG, JPG, or WebP"}
                    </p>
                    <p>
                      {logoFile ? formatFileSize(logoFile.size) : "max 5 MB"}
                    </p>
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-5 pt-1">
                  <Controller
                    name="name"
                    control={control}
                    rules={{
                      required: "Chatbot name is required",
                      validate: (value) =>
                        value.trim().length > 0 || "Chatbot name is required",
                      maxLength: {
                        value: 120,
                        message: "Use 120 characters or fewer",
                      },
                    }}
                    render={({ field }) => (
                      <FloatingInput
                        {...field}
                        label="Chatbot name"
                        error={errors.name?.message}
                        disabled={isSubmitting}
                        autoFocus
                      />
                    )}
                  />

                  <Controller
                    name="description"
                    control={control}
                    rules={{
                      maxLength: {
                        value: 1000,
                        message: "Use 1,000 characters or fewer",
                      },
                    }}
                    render={({ field }) => (
                      <FloatingTextarea
                        {...field}
                        label="Description (optional)"
                        placeholder="What should this chatbot help with?"
                        rows={4}
                        textareaClassName="min-h-28 resize-none"
                        error={errors.description?.message}
                        disabled={isSubmitting}
                      />
                    )}
                  />
                </div>
              </section>

              <section
                className=""
                aria-labelledby="chatbot-plan-heading"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Sparkles className="size-4" />
                  </div>
                  <div>
                    <h3
                      id="chatbot-plan-heading"
                      className="text-sm font-semibold text-foreground"
                    >
                      Choose a plan
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Select the plan that best fits this chatbot.
                    </p>
                  </div>
                </div>

                <div
                  role="radiogroup"
                  aria-labelledby="chatbot-plan-heading"
                  className="mt-4 grid gap-3 sm:grid-cols-4"
                >
                  {CHATBOT_PLANS.map((plan) => {
                    const isSelected = selectedPlan === plan.label;

                    return (
                      <button
                        key={plan.label}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => setSelectedPlan(plan.label)}
                        disabled={isSubmitting}
                        className={cn(
                          "relative rounded-2xl border bg-background p-4 text-left transition hover:border-primary/50 disabled:pointer-events-none disabled:opacity-60",
                          isSelected &&
                            "border-primary bg-primary/[0.04] ring-2 ring-primary/10",
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold text-foreground">
                            {plan.label}
                          </span>
                          <span
                            className={cn(
                              "flex size-5 items-center justify-center rounded-full border",
                              isSelected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-transparent",
                            )}
                          >
                            <Check className="size-3" />
                          </span>
                        </div>
                        <p className="mt-3 text-lg font-bold text-foreground">
                          ${plan.price}
                          <span className="text-xs font-normal text-muted-foreground">
                            {" "}/ month
                          </span>
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {plan.messages
                            ? `${plan.messages.toLocaleString()} AI messages`
                            : "Start at no cost"}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>

              {submissionError && (
                <p
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:bg-red-950/30"
                >
                  {submissionError}
                </p>
              )}
            </div>

          <DialogFooter className="border-t border-border bg-muted/30 px-6 py-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || !workspaceSlug}>
              <Plus /> {isSubmitting ? "Creating…" : "Create chatbot"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChatbotDialog;
