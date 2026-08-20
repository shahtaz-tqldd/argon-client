import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bot,
  BrainCircuit,
  Check,
  CircleAlert,
  Code2,
  Copy,
  Database,
  Facebook,
  FileText,
  Globe2,
  ImagePlus,
  Instagram,
  Languages,
  Link2,
  MessageCircleMore,
  MessageSquareText,
  Palette,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldAlert,
  SlidersHorizontal,
  Sparkles,
  UploadCloud,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import ReusableTable from "@/components/table";
import { Button } from "@/components/ui/button";
import Card from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FloatingInput, Input } from "@/components/ui/input";
import {
  FloatingSelect,
  SelectItem,
} from "@/components/ui/select";
import TabMenu from "@/components/ui/tab";
import { FloatingTextarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const tabs = [
  { value: "general", label: "General", icon: Settings2 },
  { value: "knowledge", label: "Knowledge", icon: Database, count: 4 },
  { value: "behavior", label: "Behavior & AI", icon: BrainCircuit },
  { value: "widget", label: "Widget", icon: Palette },
  { value: "channels", label: "Channels", icon: Link2, count: 3 },
];

const editorDefinitions = {
  identity: {
    title: "Edit chatbot details",
    description: "Update how this chatbot is identified across your workspace.",
    fields: [
      { key: "logo", label: "Logo or avatar", type: "image" },
      { key: "name", label: "Chatbot name" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "status", label: "Status", type: "select", options: ["Active", "Draft", "Disabled"] },
    ],
  },
  persona: {
    title: "Edit instructions and personality",
    description: "Define who your AI is and how it should communicate.",
    fields: [
      { key: "instructions", label: "System instructions", type: "textarea" },
      { key: "personality", label: "Personality", type: "select", options: ["Helpful and professional", "Warm and conversational", "Concise and direct", "Playful and friendly"] },
      { key: "language", label: "Default language", type: "select", options: ["English", "Bengali", "Spanish", "French", "Portuguese"] },
    ],
  },
  messages: {
    title: "Edit conversation messages",
    description: "Set the messages visitors see at key moments.",
    fields: [
      { key: "welcome", label: "Welcome message", type: "textarea" },
      { key: "fallback", label: "Fallback response", type: "textarea" },
    ],
  },
  response: {
    title: "Edit AI response behavior",
    description: "Control the assistant’s response style and boundaries.",
    fields: [
      { key: "instructions", label: "AI instructions", type: "textarea" },
      { key: "tone", label: "Tone", type: "select", options: ["Professional", "Friendly", "Empathetic", "Direct"] },
      { key: "length", label: "Response length", type: "select", options: ["Short", "Balanced", "Detailed"] },
      { key: "webSearch", label: "Allow web search", type: "toggle", help: "Coming soon. Keep this disabled until web search is supported." },
    ],
  },
  escalation: {
    title: "Edit escalation rules",
    description: "Tell Argon when a human teammate should take over.",
    fields: [
      { key: "when", label: "Escalate when", type: "textarea" },
      { key: "neverAnswer", label: "Topics AI should not answer", type: "textarea" },
    ],
  },
  notFound: {
    title: "When an answer isn’t found",
    description: "Choose the safest next step when knowledge is missing.",
    fields: [
      { key: "action", label: "Default action", type: "select", options: ["Say I don’t know", "Ask for contact information", "Escalate to human"] },
      { key: "collectContact", label: "Ask for contact information before escalating", type: "toggle" },
    ],
  },
  appearance: {
    title: "Edit widget appearance",
    description: "Customize the embedded chatbot to match your brand.",
    fields: [
      { key: "primaryColor", label: "Primary color", type: "color" },
      { key: "logo", label: "Widget logo", type: "image" },
      { key: "greeting", label: "Greeting", type: "textarea" },
      { key: "launcherText", label: "Launcher text" },
      { key: "headerTitle", label: "Header title" },
      { key: "theme", label: "Theme", type: "select", options: ["Light", "Dark", "System"] },
      { key: "showBranding", label: "Show “Powered by Argon” branding", type: "toggle" },
    ],
  },
  targeting: {
    title: "Edit allowed URLs",
    description: "Control where the widget is displayed or explicitly disabled.",
    fields: [
      { key: "enabledEverywhere", label: "Enable on every page by default", type: "toggle" },
      { key: "allowedUrls", label: "Allowed URLs — one per line", type: "textarea" },
      { key: "disabledUrls", label: "Disable on these URLs — one per line", type: "textarea" },
    ],
  },
  facebook: {
    title: "Configure Facebook",
    description: "Connect a Facebook Page so Argon can answer Messenger conversations.",
    fields: [
      { key: "account", label: "Facebook Page" },
      { key: "status", label: "Connection status", type: "select", options: ["Connected", "Disconnected"] },
    ],
  },
  instagram: {
    title: "Configure Instagram",
    description: "Connect your professional Instagram account and handle direct messages.",
    fields: [
      { key: "account", label: "Instagram username" },
      { key: "status", label: "Connection status", type: "select", options: ["Connected", "Needs attention", "Disconnected"] },
    ],
  },
  whatsapp: {
    title: "Configure WhatsApp",
    description: "Connect your WhatsApp Business number to the shared inbox.",
    fields: [
      { key: "account", label: "WhatsApp Business number" },
      { key: "status", label: "Connection status", type: "select", options: ["Connected", "Disconnected"] },
    ],
  },
};

const initialConfig = {
  identity: { logo: "", name: "Atlas Support", description: "Customer support assistant for product, billing, and account questions.", status: "Active" },
  persona: { instructions: "You are Atlas, a thoughtful support specialist. Use the knowledge base as your source of truth and make every response actionable.", personality: "Helpful and professional", language: "English" },
  messages: { welcome: "Hi there! 👋 I’m Atlas. How can I help you today?", fallback: "I’m not completely sure about that. I can connect you with a teammate who can help." },
  response: { instructions: "Answer clearly, lead with the direct solution, and use short steps only when they improve understanding.", tone: "Friendly", length: "Balanced", webSearch: false },
  escalation: { when: "The visitor asks for a refund, reports a payment issue, requests account deletion, or asks twice for a human.", neverAnswer: "Legal advice, medical advice, internal security details, passwords, or payment card information." },
  notFound: { action: "Escalate to human", collectContact: true },
  appearance: { primaryColor: "#3A86FF", logo: "", greeting: "Hi! What can we help you with?", launcherText: "Chat with us", headerTitle: "Atlas Support", theme: "Light", showBranding: true },
  targeting: { enabledEverywhere: true, allowedUrls: "https://atlas.co/*\nhttps://app.atlas.co/*", disabledUrls: "https://atlas.co/checkout\nhttps://app.atlas.co/admin/*" },
  facebook: { account: "Atlas Support", status: "Connected" },
  instagram: { account: "@atlas.support", status: "Needs attention" },
  whatsapp: { account: "+1 (415) 555-0182", status: "Connected" },
};

const initialSources = [
  { id: "source-1", name: "Help center articles", detail: "https://help.atlas.co", type: "Website", size: "8.4 MB", chunks: 842, status: "Ready", updated: "12 min ago" },
  { id: "source-2", name: "Product handbook.pdf", detail: "PDF document", type: "File", size: "4.2 MB", chunks: 386, status: "Ready", updated: "Yesterday" },
  { id: "source-3", name: "Refund and cancellation policy", detail: "Pasted content", type: "Text", size: "42 KB", chunks: 18, status: "Ready", updated: "Aug 18, 2026" },
  { id: "source-4", name: "Developer documentation", detail: "https://docs.atlas.co", type: "Website", size: "—", chunks: 0, status: "Processing", updated: "Just now" },
];

function ToggleControl({ checked, onChange, disabled = false }) {
  return (
    <button type="button" role="switch" aria-checked={checked} disabled={disabled} onClick={() => onChange(!checked)} className={cn("relative h-6 w-11 shrink-0 rounded-full transition", checked ? "bg-primary" : "bg-muted-foreground/25", disabled && "cursor-not-allowed opacity-50")}>
      <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition", checked ? "left-[22px]" : "left-0.5")} />
    </button>
  );
}

function SectionCard({ icon, title, description, onEdit, children, className }) {
  const SectionIcon = icon;
  return (
    <Card className={cn("flex h-full flex-col p-0", className)}>
      <div className="flex items-start justify-between gap-4 border-b p-5">
        <div className="flex gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary"><SectionIcon className="size-5" /></span>
          <div>
            <h2 className="text-sm font-bold">{title}</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>
          </div>
        </div>
        {onEdit && <Button onClick={onEdit} variant="ghost" size="icon-sm" aria-label={`Edit ${title}`}><Pencil /></Button>}
      </div>
      <div className="flex-1 p-5">{children}</div>
    </Card>
  );
}

function ValueRow({ label, value, children }) {
  return (
    <div className="flex items-start justify-between gap-5 py-2.5">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children || <span className="max-w-[62%] text-right text-xs font-semibold">{value}</span>}
    </div>
  );
}

function ConfigEditorDialog({ sectionKey, values, onClose, onSave }) {
  const definition = editorDefinitions[sectionKey];
  const [draft, setDraft] = useState(values);
  if (!definition) return null;

  const update = (key, value) => setDraft((current) => ({ ...current, [key]: value }));
  const submit = (event) => {
    event.preventDefault();
    onSave(sectionKey, draft);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="custom-scrollbar max-h-[90vh] overflow-y-auto rounded-3xl p-0 sm:max-w-xl">
        <form onSubmit={submit}>
          <DialogHeader className="border-b bg-muted/30 px-6 py-6">
            <DialogTitle>{definition.title}</DialogTitle>
            <DialogDescription className="leading-6">{definition.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 px-6 py-6">
            {definition.fields.map((field) => {
              if (field.type === "textarea") {
                return <FloatingTextarea key={field.key} name={field.key} label={field.label} rows={4} value={draft[field.key]} onChange={(event) => update(field.key, event.target.value)} textareaClassName="min-h-28" />;
              }
              if (field.type === "select") {
                return (
                  <FloatingSelect key={field.key} label={field.label} value={draft[field.key]} displayValue={draft[field.key]} onValueChange={(value) => update(field.key, value)}>
                    {field.options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                  </FloatingSelect>
                );
              }
              if (field.type === "toggle") {
                return (
                  <div key={field.key} className="flex items-start justify-between gap-5 rounded-2xl border bg-muted/20 p-4">
                    <div><p className="text-sm font-semibold">{field.label}</p>{field.help && <p className="mt-1 text-xs leading-5 text-muted-foreground">{field.help}</p>}</div>
                    <ToggleControl checked={Boolean(draft[field.key])} onChange={(value) => update(field.key, value)} disabled={field.key === "webSearch"} />
                  </div>
                );
              }
              if (field.type === "color") {
                return (
                  <div key={field.key} className="flex items-center gap-3 rounded-2xl border p-3">
                    <input type="color" value={draft[field.key]} onChange={(event) => update(field.key, event.target.value)} className="size-10 overflow-hidden rounded-xl border-0 bg-transparent p-0" />
                    <div className="flex-1"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">{field.label}</p><input value={draft[field.key]} onChange={(event) => update(field.key, event.target.value)} className="mt-0.5 w-full bg-transparent text-sm font-semibold uppercase outline-none" /></div>
                  </div>
                );
              }
              if (field.type === "image") {
                return (
                  <label key={field.key} className="flex cursor-pointer items-center gap-4 rounded-2xl border border-dashed p-4 transition hover:border-primary hover:bg-primary/[0.03]">
                    <span className="flex size-12 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary">{draft[field.key] ? <img src={draft[field.key]} alt="Uploaded logo preview" className="size-full object-cover" /> : <ImagePlus className="size-5" />}</span>
                    <span><span className="block text-sm font-semibold">{draft[field.key] ? "Change image" : field.label}</span><span className="mt-0.5 block text-xs text-muted-foreground">PNG, JPG or WebP · max 2 MB</span></span>
                    <input type="file" accept="image/*" className="sr-only" onChange={(event) => { const file = event.target.files?.[0]; if (file) update(field.key, URL.createObjectURL(file)); }} />
                  </label>
                );
              }
              return <FloatingInput key={field.key} name={field.key} label={field.label} value={draft[field.key]} onChange={(event) => update(field.key, event.target.value)} />;
            })}
          </div>
          <DialogFooter className="border-t bg-muted/20 px-6 py-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit"><Check />Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function GeneralTab({ config, edit }) {
  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-2">
      <SectionCard icon={Bot} title="Chatbot identity" description="Name, description, avatar, and availability." onEdit={() => edit("identity")}>
        <div className="flex items-center gap-4 rounded-2xl bg-muted/30 p-4">
          <span className="flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-primary font-bold text-primary-foreground">{config.identity.logo ? <img src={config.identity.logo} alt="Chatbot logo" className="size-full object-cover" /> : "AS"}</span>
          <div className="min-w-0"><div className="flex items-center gap-2"><p className="font-bold">{config.identity.name}</p><span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">{config.identity.status}</span></div><p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{config.identity.description}</p></div>
        </div>
      </SectionCard>

      <SectionCard icon={Sparkles} title="Instructions & personality" description="The core identity and communication style of your AI." onEdit={() => edit("persona")}>
        <p className="line-clamp-3 rounded-2xl border bg-muted/20 p-4 text-xs leading-5 text-muted-foreground">“{config.persona.instructions}”</p>
        <div className="mt-3 divide-y"><ValueRow label="Personality" value={config.persona.personality} /><ValueRow label="Default language"><span className="flex items-center gap-1.5 text-xs font-semibold"><Languages className="size-3.5 text-primary" />{config.persona.language}</span></ValueRow></div>
      </SectionCard>

      <SectionCard icon={MessageSquareText} title="Conversation messages" description="Welcome visitors and handle uncertain answers consistently." onEdit={() => edit("messages")} className="lg:col-span-2">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border bg-muted/20 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Welcome message</p><p className="mt-2 text-sm leading-6">{config.messages.welcome}</p></div>
          <div className="rounded-2xl border bg-muted/20 p-4"><p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">Fallback response</p><p className="mt-2 text-sm leading-6">{config.messages.fallback}</p></div>
        </div>
      </SectionCard>
    </div>
  );
}

function UsageCard({ icon, label, current, total, display, tone = "bg-primary" }) {
  const UsageIcon = icon;
  const percent = Math.min(100, Math.round((current / total) * 100));
  return (
    <Card className="p-5">
      <div className="flex items-center justify-between"><span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary"><UsageIcon className="size-4" /></span><span className="text-xs font-bold">{percent}%</span></div>
      <p className="mt-4 text-sm font-semibold">{label}</p><p className="mt-1 text-xs text-muted-foreground">{display}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className={cn("h-full rounded-full", tone)} style={{ width: `${percent}%` }} /></div>
    </Card>
  );
}

function SourceStatus({ status }) {
  const processing = status === "Processing";
  return <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", processing ? "bg-amber-500/10 text-amber-600" : status === "Failed" ? "bg-red-500/10 text-red-600" : "bg-emerald-500/10 text-emerald-600")}><span className={cn("size-1.5 rounded-full bg-current", processing && "animate-pulse")} />{status}</span>;
}

function AddKnowledgeDialog({ open, onClose, onAdd }) {
  const [sourceType, setSourceType] = useState("Website");
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const submit = (event) => {
    event.preventDefault();
    onAdd({ sourceType, name: name || (sourceType === "File" ? "Uploaded document" : "New knowledge source"), content });
    setName(""); setContent(""); onClose();
  };
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="rounded-3xl p-0 sm:max-w-xl">
        <form onSubmit={submit}>
          <DialogHeader className="border-b bg-muted/30 px-6 py-6"><DialogTitle>Add knowledge</DialogTitle><DialogDescription>Train Argon using a file, website, or your own text content.</DialogDescription></DialogHeader>
          <div className="space-y-5 px-6 py-6">
            <div className="grid grid-cols-3 gap-2">
              {[{ type: "File", icon: FileText }, { type: "Website", icon: Globe2 }, { type: "Text", icon: MessageSquareText }].map(({ type, icon }) => { const TypeIcon = icon; return <button key={type} type="button" onClick={() => setSourceType(type)} className={cn("flex flex-col items-center gap-2 rounded-2xl border px-3 py-4 text-xs font-semibold transition", sourceType === type ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted")}><TypeIcon className="size-5" />{type}</button>; })}
            </div>
            <FloatingInput name="source-name" label="Source name" value={name} onChange={(event) => setName(event.target.value)} />
            {sourceType === "File" ? (
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-8 text-center transition hover:border-primary hover:bg-primary/[0.03]"><UploadCloud className="size-6 text-primary" /><span className="mt-2 text-sm font-semibold">Choose a file</span><span className="mt-1 text-xs text-muted-foreground">PDF, DOCX, TXT, CSV · max 20 MB</span><input type="file" className="sr-only" onChange={(event) => setContent(event.target.files?.[0]?.name || "")} />{content && <span className="mt-3 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">{content}</span>}</label>
            ) : sourceType === "Website" ? <FloatingInput name="website-url" label="Website URL" value={content} onChange={(event) => setContent(event.target.value)} placeholder="https://" /> : <FloatingTextarea name="knowledge-content" label="Text or content" value={content} onChange={(event) => setContent(event.target.value)} rows={6} />}
          </div>
          <DialogFooter className="border-t bg-muted/20 px-6 py-4"><Button type="button" variant="outline" onClick={onClose}>Cancel</Button><Button type="submit"><Plus />Add source</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function KnowledgeTab({ sources, setSources }) {
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");
  const visibleSources = useMemo(() => sources.filter((source) => `${source.name} ${source.type}`.toLowerCase().includes(search.toLowerCase())), [sources, search]);
  const reprocess = (_, row) => {
    setSources((current) => current.map((source) => source.id === row.id ? { ...source, status: "Processing", updated: "Just now" } : source));
    toast.success(`${row.name} queued for reprocessing`);
  };
  const rows = visibleSources.map((source) => ({
    ...source,
    source: <div className="min-w-56"><p className="text-sm font-semibold text-foreground">{source.name}</p><p className="mt-0.5 truncate text-xs text-muted-foreground">{source.detail}</p></div>,
    sourceType: <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{source.type}</span>,
    chunkCount: <span className="text-xs font-semibold text-foreground">{source.chunks.toLocaleString()}</span>,
    sourceStatus: <SourceStatus status={source.status} />,
    action: "",
  }));
  const addSource = ({ sourceType, name, content }) => {
    setSources((current) => [...current, { id: `source-${Date.now()}`, name, detail: content || `${sourceType} source`, type: sourceType, size: sourceType === "File" ? "1.2 MB" : "—", chunks: 0, status: "Processing", updated: "Just now" }]);
    toast.success("Knowledge source added and processing started");
  };
  return (
    <div className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2"><UsageCard icon={Database} label="Chunk usage" current={1246} total={2500} display="1,246 of 2,500 chunks" /><UsageCard icon={FileText} label="Storage usage" current={13.7} total={50} display="13.7 MB of 50 MB" tone="bg-violet-500" /></div>
      <ReusableTable title="Knowledge sources" description={`${sources.length} sources training Atlas Support`} headerActions={<div className="flex items-center gap-2"><label className="relative hidden sm:block"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={search} onChange={(event) => setSearch(event.target.value)} className="h-9 w-52 rounded-xl bg-slate-50 pl-9" placeholder="Search sources" /></label><Button size="sm" onClick={() => setAddOpen(true)}><Plus />Add knowledge</Button></div>} data={rows} columns={[{ header: "Name", accessorKey: "source" }, { header: "Type", accessorKey: "sourceType" }, { header: "Size", accessorKey: "size" }, { header: "Chunks", accessorKey: "chunkCount" }, { header: "Status", accessorKey: "sourceStatus" }, { header: "Last updated", accessorKey: "updated" }, { header: "", accessorKey: "action" }]} isLoading={false} totalItems={rows.length} page={1} setPage={() => {}} pageSize={10} setPageSize={() => {}} table_options={[{ label: "Reprocess", action: reprocess }, { label: "Delete source", type: "delete" }]} onDeleteConfirm={async (id) => { setSources((current) => current.filter((source) => source.id !== id)); toast.success("Knowledge source deleted"); }} deleteLoading={false} emptyTitle="No knowledge sources" emptyDescription="Add a file, website, or text content to start training Argon." />
      <AddKnowledgeDialog open={addOpen} onClose={() => setAddOpen(false)} onAdd={addSource} />
    </div>
  );
}

function BehaviorTab({ config, edit }) {
  return (
    <div className="grid items-stretch gap-5 lg:grid-cols-2">
      <SectionCard icon={BrainCircuit} title="AI response behavior" description="Instructions, tone, length, and external knowledge controls." onEdit={() => edit("response")}>
        <div className="divide-y"><ValueRow label="Tone" value={config.response.tone} /><ValueRow label="Response length" value={config.response.length} /><ValueRow label="Web search"><span className="flex items-center gap-2 text-xs font-semibold text-muted-foreground"><span className="rounded-full bg-muted px-2 py-0.5 text-[10px]">Coming later</span>Off</span></ValueRow></div>
        <p className="mt-3 line-clamp-2 rounded-xl bg-muted/35 p-3 text-xs leading-5 text-muted-foreground">{config.response.instructions}</p>
      </SectionCard>
      <SectionCard icon={ShieldAlert} title="Escalation & guardrails" description="Specify when AI should step aside and what it must avoid." onEdit={() => edit("escalation")}>
        <div className="space-y-3"><div className="rounded-xl border p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground">Escalate when</p><p className="mt-1 line-clamp-2 text-xs leading-5">{config.escalation.when}</p></div><div className="rounded-xl border p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground">Never answer</p><p className="mt-1 line-clamp-2 text-xs leading-5">{config.escalation.neverAnswer}</p></div></div>
      </SectionCard>
      <SectionCard icon={CircleAlert} title="Answer not found" description="Choose the fallback path when the knowledge base has no answer." onEdit={() => edit("notFound")} className="lg:col-span-2">
        <div className="flex flex-col gap-4 rounded-2xl border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-sm font-semibold">{config.notFound.action}</p><p className="mt-1 text-xs text-muted-foreground">{config.notFound.collectContact ? "Collect contact information before handoff" : "Do not request contact information"}</p></div><span className="flex size-9 items-center justify-center rounded-full bg-amber-500/10 text-amber-600"><RefreshCw className="size-4" /></span></div>
      </SectionCard>
    </div>
  );
}

const installCode = `<script src="https://cdn.argon.chat/widget.js" data-chatbot="atlas-support" async></script>`;

function WidgetPreview({ appearance }) {
  const dark = appearance.theme === "Dark";
  return (
    <Card className="sticky top-0 p-0">
      <div className="border-b px-5 py-4"><p className="text-sm font-bold">Live preview</p><p className="mt-1 text-xs text-muted-foreground">Updates as you save appearance changes.</p></div>
      <div className="relative h-[560px] overflow-hidden bg-slate-100 p-5 dark:bg-slate-900">
        <div className="space-y-3 opacity-60"><div className="h-7 w-28 rounded bg-slate-300 dark:bg-slate-700" /><div className="h-3 w-3/4 rounded bg-slate-300 dark:bg-slate-700" /><div className="h-3 w-1/2 rounded bg-slate-300 dark:bg-slate-700" /><div className="mt-8 grid grid-cols-2 gap-3"><div className="h-24 rounded-xl bg-white dark:bg-slate-800" /><div className="h-24 rounded-xl bg-white dark:bg-slate-800" /></div></div>
        <div className={cn("absolute bottom-20 right-5 w-[285px] overflow-hidden rounded-2xl shadow-2xl", dark ? "bg-slate-900 text-white" : "bg-white text-slate-900")}>
          <div className="p-4 text-white" style={{ backgroundColor: appearance.primaryColor }}><div className="flex items-center gap-3"><span className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-white/20">{appearance.logo ? <img src={appearance.logo} alt="Widget logo" className="size-full object-cover" /> : <Bot className="size-4" />}</span><div><p className="text-sm font-bold">{appearance.headerTitle}</p><p className="text-[10px] text-white/80">Typically replies instantly</p></div></div></div>
          <div className="h-64 p-4"><div className={cn("max-w-[85%] rounded-2xl rounded-tl-sm px-3 py-2.5 text-xs leading-5", dark ? "bg-slate-800" : "bg-slate-100")}>{appearance.greeting}</div></div>
          <div className="border-t p-3"><div className={cn("flex items-center justify-between rounded-full px-3 py-2 text-[11px] text-slate-400", dark ? "bg-slate-800" : "bg-slate-100")}><span>Type your message…</span><MessageCircleMore className="size-4" /></div>{appearance.showBranding && <p className="mt-2 text-center text-[9px] text-slate-400">Powered by Argon</p>}</div>
        </div>
        <button className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full px-4 py-3 text-xs font-bold text-white shadow-lg" style={{ backgroundColor: appearance.primaryColor }}><MessageCircleMore className="size-4" />{appearance.launcherText}</button>
      </div>
    </Card>
  );
}

function WidgetTab({ config, edit }) {
  const allowed = config.targeting.allowedUrls.split("\n").filter(Boolean);
  const disabled = config.targeting.disabledUrls.split("\n").filter(Boolean);
  const copyCode = async () => { await navigator.clipboard.writeText(installCode); toast.success("Installation code copied"); };
  return (
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-5">
        <SectionCard icon={Palette} title="Appearance" description="Colors, logo, messages, theme, and Argon branding." onEdit={() => edit("appearance")}>
          <div className="divide-y"><ValueRow label="Primary color"><span className="flex items-center gap-2 text-xs font-semibold"><span className="size-4 rounded-full border" style={{ backgroundColor: config.appearance.primaryColor }} />{config.appearance.primaryColor}</span></ValueRow><ValueRow label="Header title" value={config.appearance.headerTitle} /><ValueRow label="Theme" value={config.appearance.theme} /><ValueRow label="Show branding" value={config.appearance.showBranding ? "Yes" : "No"} /></div>
        </SectionCard>
        <SectionCard icon={Globe2} title="Allowed URLs" description="Choose where the widget can load and where it stays disabled." onEdit={() => edit("targeting")}>
          <div className="flex items-center justify-between rounded-xl bg-muted/35 p-3"><div><p className="text-xs font-semibold">Enable by default</p><p className="mt-0.5 text-[11px] text-muted-foreground">Widget appears on matching pages</p></div><ToggleControl checked={config.targeting.enabledEverywhere} onChange={() => edit("targeting")} /></div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground">Allowed patterns</p><p className="mt-2 text-2xl font-bold">{allowed.length}</p></div><div className="rounded-xl border p-3"><p className="text-[10px] font-bold uppercase text-muted-foreground">Disabled patterns</p><p className="mt-2 text-2xl font-bold">{disabled.length}</p></div></div>
        </SectionCard>
        <SectionCard icon={Code2} title="Installation" description="Add this script before the closing body tag on your website.">
          <div className="relative rounded-2xl bg-slate-950 p-4 pr-12 font-mono text-xs leading-6 text-slate-300"><code className="break-all">{installCode}</code><Button onClick={copyCode} variant="ghost" size="icon-sm" className="absolute right-2 top-2 text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Copy installation code"><Copy /></Button></div>
          <div className="mt-3 flex items-center gap-2 text-xs text-emerald-600"><Check className="size-3.5" />Widget detected on atlas.co</div>
        </SectionCard>
      </div>
      <WidgetPreview appearance={config.appearance} />
    </div>
  );
}

const channelDetails = [
  { key: "facebook", name: "Facebook", icon: Facebook, tone: "bg-blue-600 text-white", description: "Handle Facebook Messenger conversations in Inbox." },
  { key: "instagram", name: "Instagram", icon: Instagram, tone: "bg-gradient-to-br from-fuchsia-500 to-amber-400 text-white", description: "Reply to Instagram direct messages from Argon." },
  { key: "whatsapp", name: "WhatsApp", icon: MessageCircleMore, tone: "bg-emerald-500 text-white", description: "Support customers through your WhatsApp Business number." },
];

function ChannelsTab({ config, edit }) {
  return (
    <div>
      <div className="mb-5 rounded-2xl border border-primary/15 bg-primary/[0.04] p-4"><div className="flex gap-3"><Link2 className="mt-0.5 size-5 shrink-0 text-primary" /><div><p className="text-sm font-semibold">Bring every conversation into Inbox</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Argon can answer first on each connected channel and escalate to your team when human attention is needed.</p></div></div></div>
      <div className="grid gap-5 lg:grid-cols-3">
        {channelDetails.map((channel) => {
          const ChannelIcon = channel.icon;
          const values = config[channel.key];
          const connected = values.status === "Connected";
          return (
            <Card key={channel.key} className="flex min-h-72 flex-col p-5">
              <div className="flex items-start justify-between"><span className={cn("flex size-12 items-center justify-center rounded-2xl shadow-sm", channel.tone)}><ChannelIcon className="size-5" /></span><span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold", connected ? "bg-emerald-500/10 text-emerald-600" : values.status === "Needs attention" ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground")}><span className="size-1.5 rounded-full bg-current" />{values.status}</span></div>
              <h2 className="mt-5 font-bold">{channel.name}</h2><p className="mt-1 text-xs leading-5 text-muted-foreground">{channel.description}</p>
              <div className="mt-5 rounded-xl bg-muted/35 p-3"><p className="text-[10px] uppercase tracking-wide text-muted-foreground">Connected account</p><p className="mt-1 truncate text-xs font-semibold">{values.account || "No account connected"}</p></div>
              <Button onClick={() => edit(channel.key)} variant={connected ? "outline" : "default"} className="mt-auto w-full"><Link2 />{connected ? "Manage connection" : "Connect channel"}</Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

const ConfigurationPage = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [config, setConfig] = useState(initialConfig);
  const [sources, setSources] = useState(initialSources);
  const [editingSection, setEditingSection] = useState(null);

  const saveSection = (sectionKey, values) => {
    setConfig((current) => ({ ...current, [sectionKey]: values }));
    setEditingSection(null);
    toast.success("Configuration saved");
  };

  return (
    <section className="mx-auto max-w-7xl space-y-6 pb-8">
      <header className="flex flex-col gap-5 pr-14 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <Link to="/" className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-primary"><ArrowLeft className="size-4" />Back to workspace</Link>
          <div className="flex items-center gap-4"><div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20"><SlidersHorizontal className="size-7" /></div><div><h1 className="text-2xl font-bold tracking-tight md:text-3xl">Configuration</h1><p className="mt-1 text-sm text-muted-foreground">Train, customize, and control how Atlas Support works.</p></div></div>
        </div>
        <div className="flex items-center gap-2"><span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><span className="size-2 rounded-full bg-emerald-500" />All changes saved</span><Button variant="outline"><RefreshCw />Test chatbot</Button></div>
      </header>

      <TabMenu tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} scrollable className="sticky top-0 z-10 bg-background/95 backdrop-blur" />

      {activeTab === "general" && <GeneralTab config={config} edit={setEditingSection} />}
      {activeTab === "knowledge" && <KnowledgeTab sources={sources} setSources={setSources} />}
      {activeTab === "behavior" && <BehaviorTab config={config} edit={setEditingSection} />}
      {activeTab === "widget" && <WidgetTab config={config} edit={setEditingSection} />}
      {activeTab === "channels" && <ChannelsTab config={config} edit={setEditingSection} />}

      {editingSection && <ConfigEditorDialog key={editingSection} sectionKey={editingSection} values={config[editingSection]} onClose={() => setEditingSection(null)} onSave={saveSection} />}
    </section>
  );
};

export default ConfigurationPage;
