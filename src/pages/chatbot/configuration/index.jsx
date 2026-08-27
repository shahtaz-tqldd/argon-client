import { useState } from "react";
import { useSearchParams } from "react-router-dom";
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

import ChannelsTab from "./channels";
import ChatbotWidgetTab from "./chatbot-widget";
import ConfigEditorDialog from "./components/ConfigEditorDialog";
import CoreDetailsTab from "./core-details";
import KnowledgeSourceTab from "./knowledge-source";

const tabs = [
  { value: "general", label: "Core Details", icon: Settings2 },
  { value: "knowledge", label: "Knowledge Base", icon: Database },
  { value: "widget", label: "Chatbot Widget", icon: Palette },
  { value: "channels", label: "Channels", icon: Link2, count: 3 },
];

const DEFAULT_TAB = "general";
const tabValues = new Set(tabs.map((tab) => tab.value));

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

const AI_BEHAVIOR_FIELDS = {
  "welcome-message": { field: "welcome_message" },
  "fallback-response": { field: "fallback_message" },
  "ai-instructions": { field: "instructions" },
  "escalation-rule": {
    field: "escalation_rule",
  },
  "never-answer": {
    field: "never_answer",
  },
};

const getAiBehaviorPayload = (sectionKey, value) => {
  const definition = AI_BEHAVIOR_FIELDS[sectionKey];
  if (!definition) return null;

  return { [definition.field]: value.trim() };
};

const ConfigurationPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    currentChatbot,
    isLoading: isChatbotLoading,
    isError: isChatbotError,
    refetch: refetchChatbot,
  } = useCurrentChatbot();
  const [updateChatbot, { isLoading: isUpdatingChatbot }] =
    useUpdateChatbotMutation();
  const [config, setConfig] = useState(initialConfig);
  const [editingSection, setEditingSection] = useState(null);
  const tabFromUrl = searchParams.get("tab");
  const activeTab = tabValues.has(tabFromUrl) ? tabFromUrl : DEFAULT_TAB;

  const changeTab = (tab) => {
    if (!tabValues.has(tab)) return;

    setSearchParams((currentParams) => {
      const nextParams = new URLSearchParams(currentParams);
      nextParams.set("tab", tab);
      return nextParams;
    });
  };

  const aiSettings = {
    aiEnabled: Boolean(currentChatbot?.ai_enabled),
    instructions: currentChatbot?.instructions || "",
    escalationRule: currentChatbot?.escalation_rule || "",
    neverAnswer: currentChatbot?.never_answer || "",
    welcome: currentChatbot?.welcome_message || "",
    fallback: currentChatbot?.fallback_message || "",
  };
  const editorValues = {
    details: {
      logo: currentChatbot?.logo || "",
      business_name: currentChatbot?.business_name || "",
      chatbot_name:
        currentChatbot?.chatbot_name || currentChatbot?.name || "",
      description: currentChatbot?.description || "",
      language: currentChatbot?.language || "en",
      timezone: currentChatbot?.timezone || "UTC",
    },
  };

  const persistChatbot = async (payload, successMessage, errorMessage) => {
    if (!currentChatbot?.slug) return false;

    try {
      await updateChatbot({
        chatbotSlug: currentChatbot.slug,
        payload,
      }).unwrap();
      toast.success(successMessage);
      return true;
    } catch (error) {
      toast.error(getApiErrorMessage(error, errorMessage));
      return false;
    }
  };

  const saveSection = async (sectionKey, values) => {
    if (sectionKey !== "details") {
      setConfig((current) => ({ ...current, [sectionKey]: values }));
      setEditingSection(null);
      toast.success("Configuration saved");
      return true;
    }

    const payload = new FormData();
    payload.append("business_name", values.business_name.trim());
    payload.append("chatbot_name", values.chatbot_name.trim());
    payload.append("description", values.description.trim());
    payload.append("language", values.language);
    payload.append("timezone", values.timezone);
    if (values.logoFile) payload.append("logo", values.logoFile);

    const saved = await persistChatbot(
      payload,
      "Chatbot details updated",
      "Unable to save the chatbot details.",
    );
    if (saved) setEditingSection(null);
    return saved;
  };

  const saveAiBehavior = (sectionKey, value) => {
    const payload = getAiBehaviorPayload(sectionKey, value);
    if (!payload) return Promise.resolve(false);

    return persistChatbot(
      payload,
      "AI behavior updated",
      "Unable to update the AI behavior.",
    );
  };

  const toggleSetting = (field, enabled) => {
    const labels = {
      ai_enabled: "AI replies",
      human_handoff_enabled: "Human handoff",
      knowledge_base_enabled: "Knowledge base",
    };
    const label = labels[field] || "Feature";

    return persistChatbot(
      { [field]: enabled },
      `${label} ${enabled ? "enabled" : "disabled"}`,
      `Unable to update ${label}.`,
    );
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
          setActiveTab={changeTab}
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
        <CoreDetailsTab
          chatbot={currentChatbot}
          aiSettings={aiSettings}
          isLoading={isChatbotLoading}
          isError={isChatbotError}
          isFeatureUpdating={isUpdatingChatbot}
          edit={setEditingSection}
          onRetry={refetchChatbot}
          onSaveAiBehavior={saveAiBehavior}
          onToggleSetting={toggleSetting}
        />
      )}
      {activeTab === "knowledge" && (
        <KnowledgeSourceTab
          chatbotSlug={currentChatbot?.slug}
          chatbotName={currentChatbot?.name}
        />
      )}
      {activeTab === "widget" && (
        <ChatbotWidgetTab chatbotSlug={currentChatbot?.slug} />
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
