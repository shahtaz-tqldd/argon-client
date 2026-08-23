import { useState } from "react";
import {
  Database,
  Link2,
  Palette,
  RefreshCw,
  Settings2,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { SectionTitle } from "@/components/ui/section";
import TabMenu from "@/components/ui/tab";
import { useUpdateChatbotMutation } from "@/features/chatbot/chatbotApiSlice";
import useCurrentChatbot from "@/hooks/useCurrentChatbot";
import { getApiErrorMessage } from "@/lib/get-api-error-message";

import ChannelsTab from "./components/ChannelsTab";
import ConfigEditorDialog from "./components/ConfigEditorDialog";
import GeneralTab from "./components/GeneralTab";
import KnowledgeTab from "./components/KnowledgeTab";
import WidgetTab from "./components/WidgetTab";

const tabs = [
  { value: "general", label: "General", icon: Settings2 },
  { value: "knowledge", label: "Knowledge", icon: Database, count: 4 },
  { value: "widget", label: "Widget", icon: Palette },
  { value: "channels", label: "Channels", icon: Link2, count: 3 },
];

const initialConfig = {
  appearance: {
    primaryColor: "#3A86FF",
    logo: "",
    greeting: "Hi! What can we help you with?",
    launcherText: "Chat with us",
    headerTitle: "Atlas Support",
    theme: "Light",
    showBranding: true,
  },
  targeting: {
    enabledEverywhere: true,
    allowedUrls: "https://atlas.co/*\nhttps://app.atlas.co/*",
    disabledUrls: "https://atlas.co/checkout\nhttps://app.atlas.co/admin/*",
  },
  facebook: { account: "Atlas Support", status: "Connected" },
  instagram: { account: "@atlas.support", status: "Needs attention" },
  whatsapp: { account: "+1 (415) 555-0182", status: "Connected" },
};

const DEFAULT_AI_TONE = "Friendly";
const DEFAULT_ESCALATION_RULE =
  "The visitor asks for a refund, reports a payment issue, requests account deletion, or asks twice for a human.";
const DEFAULT_NEVER_ANSWER =
  "Legal advice, medical advice, internal security details, passwords, or payment card information.";

const initialSources = [
  {
    id: "source-1",
    name: "Help center articles",
    detail: "https://help.atlas.co",
    type: "Website",
    size: "8.4 MB",
    chunks: 842,
    status: "Ready",
    updated: "12 min ago",
  },
  {
    id: "source-2",
    name: "Product handbook.pdf",
    detail: "PDF document",
    type: "File",
    size: "4.2 MB",
    chunks: 386,
    status: "Ready",
    updated: "Yesterday",
  },
  {
    id: "source-3",
    name: "Refund and cancellation policy",
    detail: "Pasted content",
    type: "Text",
    size: "42 KB",
    chunks: 18,
    status: "Ready",
    updated: "Aug 18, 2026",
  },
  {
    id: "source-4",
    name: "Developer documentation",
    detail: "https://docs.atlas.co",
    type: "Website",
    size: "—",
    chunks: 0,
    status: "Processing",
    updated: "Just now",
  },
];

const ConfigurationPage = () => {
  const {
    currentChatbot,
    isLoading: isChatbotLoading,
    isError: isChatbotError,
    refetch: refetchChatbot,
  } = useCurrentChatbot();
  const [updateChatbot, { isLoading: isUpdatingChatbot }] =
    useUpdateChatbotMutation();
  const [activeTab, setActiveTab] = useState("general");
  const [config, setConfig] = useState(initialConfig);
  const [sources, setSources] = useState(initialSources);
  const [editingSection, setEditingSection] = useState(null);

  const otherSettings = currentChatbot?.other_settings || {};
  const aiSettings = {
    aiEnabled: Boolean(currentChatbot?.ai_enabled),
    instructions: currentChatbot?.instructions || "",
    tone: otherSettings.ai_tone || DEFAULT_AI_TONE,
    escalationRule:
      otherSettings.escalation_rule || DEFAULT_ESCALATION_RULE,
    neverAnswer: otherSettings.never_answer || DEFAULT_NEVER_ANSWER,
    welcome: currentChatbot?.welcome_message || "",
    fallback: currentChatbot?.fallback_message || "",
  };
  const editorValues = {
    details: {
      logo: currentChatbot?.logo || "",
      name: currentChatbot?.name || "",
      description: currentChatbot?.description || "",
      language: currentChatbot?.language || "en",
      timezone: currentChatbot?.timezone || "UTC",
    },
    ai: {
      aiEnabled: aiSettings.aiEnabled,
      instructions: aiSettings.instructions,
      tone: aiSettings.tone,
    },
    escalation: {
      escalationRule: aiSettings.escalationRule,
      neverAnswer: aiSettings.neverAnswer,
    },
    messages: {
      welcome: aiSettings.welcome,
      fallback: aiSettings.fallback,
    },
  };

  const saveSection = async (sectionKey, values) => {
    const isChatbotSection = [
      "details",
      "ai",
      "escalation",
      "messages",
    ].includes(sectionKey);

    if (!isChatbotSection) {
      setConfig((current) => ({ ...current, [sectionKey]: values }));
      setEditingSection(null);
      toast.success("Configuration saved");
      return;
    }

    if (!currentChatbot?.slug) return;

    let payload;

    if (sectionKey === "details") {
      payload = new FormData();
      payload.append("name", values.name.trim());
      payload.append("description", values.description.trim());
      payload.append("language", values.language);
      payload.append("timezone", values.timezone);
      if (values.logoFile) payload.append("logo", values.logoFile);
    } else if (sectionKey === "ai") {
      payload = {
        ai_enabled: values.aiEnabled,
        instructions: values.instructions.trim(),
        other_settings: {
          ...otherSettings,
          ai_tone: values.tone,
        },
      };
    } else if (sectionKey === "escalation") {
      payload = {
        other_settings: {
          ...otherSettings,
          escalation_rule: values.escalationRule.trim(),
          never_answer: values.neverAnswer.trim(),
        },
      };
    } else {
      payload = {
        welcome_message: values.welcome.trim(),
        fallback_message: values.fallback.trim(),
      };
    }

    try {
      await updateChatbot({
        chatbotSlug: currentChatbot.slug,
        payload,
      }).unwrap();
      setEditingSection(null);
      toast.success("Configuration saved");
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, "Unable to save the configuration."),
      );
    }
  };

  const toggleFeature = async (field, enabled) => {
    if (!currentChatbot?.slug) return;

    const label =
      field === "human_handoff_enabled" ? "Human handoff" : "Knowledge base";

    try {
      await updateChatbot({
        chatbotSlug: currentChatbot.slug,
        payload: { [field]: enabled },
      }).unwrap();
      toast.success(`${label} ${enabled ? "enabled" : "disabled"}`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, `Unable to update ${label}.`));
    }
  };

  return (
    <section className="mx-auto max-w-7xl space-y-6 pb-8">
      <SectionTitle
        icon={SlidersHorizontal}
        title="Configuration"
        details={`Train, customize, and control how ${currentChatbot?.name || "your chatbot"} works`}
        lg
      />
      <div className="col-reverse flex flex-col gap-5 md:flex-row md:justify-between">
        <TabMenu
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          scrollable
          className="sticky top-0 z-10 bg-background/95 backdrop-blur"
        />

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <span
              className={`size-2 rounded-full ${
                isUpdatingChatbot
                  ? "animate-pulse bg-amber-500"
                  : "bg-emerald-500"
              }`}
            />
            {isUpdatingChatbot ? "Saving changes…" : "All changes saved"}
          </span>
          <Button variant="outline">
            <RefreshCw />
            Test chatbot
          </Button>
        </div>
      </div>

      {activeTab === "general" && (
        <GeneralTab
          chatbot={currentChatbot}
          aiSettings={aiSettings}
          isLoading={isChatbotLoading}
          isError={isChatbotError}
          isFeatureUpdating={isUpdatingChatbot}
          edit={setEditingSection}
          onRetry={refetchChatbot}
          onToggleFeature={toggleFeature}
        />
      )}
      {activeTab === "knowledge" && (
        <KnowledgeTab sources={sources} setSources={setSources} />
      )}
      {activeTab === "widget" && (
        <WidgetTab config={config} edit={setEditingSection} />
      )}
      {activeTab === "channels" && (
        <ChannelsTab config={config} edit={setEditingSection} />
      )}

      {editingSection && (
        <ConfigEditorDialog
          key={editingSection}
          sectionKey={editingSection}
          values={editorValues[editingSection] || config[editingSection]}
          isSaving={isUpdatingChatbot}
          onClose={() => setEditingSection(null)}
          onSave={saveSection}
        />
      )}
    </section>
  );
};

export default ConfigurationPage;
