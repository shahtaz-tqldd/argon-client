import { useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Bot, Check, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

import LogoUploader from "@/components/shared/logo-uploader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from "@/components/ui/dialog";
import { FloatingInput } from "@/components/ui/input";
import { FloatingSelect, SelectItem } from "@/components/ui/select";
import { FloatingTextarea } from "@/components/ui/textarea";
import { useCreateChatbotMutation } from "@/features/chatbot/chatbotApiSlice";
import { getApiErrorMessage } from "@/lib/get-api-error-message";
import { cn } from "@/lib/utils";
import { DialogHeaderTitle, SectionTitle } from "@/components/ui/section";
import { CHATBOT_PLANS } from "@/constants/plans";
import { useNavigate } from "react-router-dom";
import { LANGUAGES } from "@/constants/language";
import { DETECTED_TIMEZONE, TIMEZONES } from "@/lib/timezone";

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
  const [logoFile, setLogoFile] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState("Free");
  const [submissionError, setSubmissionError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [createChatbot] = useCreateChatbotMutation();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      language: "en",
      timezone: DETECTED_TIMEZONE,
      description: "",
    },
  });

  const chatbotName = useWatch({ control, name: "name" });

  const resetDialog = () => {
    reset({
      name: "",
      language: "en",
      timezone: DETECTED_TIMEZONE,
      description: "",
    });
    setLogoFile(null);
    setSelectedPlan("Free");
    setSubmissionError("");
  };

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen && isSubmitting) return;
    if (!nextOpen) resetDialog();
    onOpenChange(nextOpen);
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
    payload.append("language", values.language);
    payload.append("timezone", values.timezone);
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
      navigate(`/chatbot/${chatbot.slug}/configuration`);
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
      <DialogContent className="max-h-[calc(100vh-2rem)] custom-scrollbar rounded-3xl p-0 sm:max-w-2xl">
        <form onSubmit={handleSubmit(submitChatbot)}>
          <DialogHeader className="border-b border-border bg-muted/40 px-6 py-6">
            <DialogHeaderTitle
              icon={Bot}
              title="Create a chatbot"
              details={`Add an identity for your assistant and choose a plan for it in ${workspaceName}.`}
            />
          </DialogHeader>

          <div className="space-y-6 px-6 py-6">
            <section className="flex flex-col gap-5 sm:flex-row">
              <LogoUploader
                value={logoFile}
                onChange={setLogoFile}
                name={chatbotName}
                fallbackIcon={Bot}
                disabled={isSubmitting}
                logoLabel="Chatbot logo"
              />

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

                <div className="grid grid-cols-2 gap-3">
                  <Controller
                    name="language"
                    control={control}
                    rules={{ required: "Language is required" }}
                    render={({ field }) => (
                      <div>
                        <FloatingSelect
                          label="Language"
                          value={field.value}
                          displayValue={
                            LANGUAGES.find(
                              (language) => language.value === field.value,
                            )?.label
                          }
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          {LANGUAGES.map((language) => (
                            <SelectItem
                              key={language.value}
                              value={language.value}
                            >
                              {language.label}
                            </SelectItem>
                          ))}
                        </FloatingSelect>
                        {errors.language && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.language.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  <Controller
                    name="timezone"
                    control={control}
                    rules={{ required: "Timezone is required" }}
                    render={({ field }) => (
                      <div>
                        <FloatingSelect
                          label="Timezone"
                          value={field.value}
                          displayValue={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                          contentClassName="max-h-72"
                        >
                          {TIMEZONES.map((timezone) => (
                            <SelectItem key={timezone} value={timezone}>
                              {timezone.replaceAll("_", " ")}
                            </SelectItem>
                          ))}
                        </FloatingSelect>
                        {errors.timezone && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.timezone.message}
                          </p>
                        )}
                      </div>
                    )}
                  />
                </div>

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

            <section className="" aria-labelledby="chatbot-plan-heading">
              <SectionTitle
                icon={Sparkles}
                title="Choose a plan"
                details="  Select the plan that best fits this chatbot"
              />

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
                          {" "}
                          / month
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
