"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getLatestFarm, sendChatMessage } from "@/lib/api";
import { Farm } from "@/lib/types";
import { 
  Bot, 
  Send, 
  Sparkles, 
  User, 
  Sprout, 
  Satellite, 
  HelpCircle, 
  Loader2,
  Zap 
} from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTED_QUESTIONS = [
  "Why is Strategy B better under limited rainfall?",
  "Why should I include legumes in my crop rotation?",
  "Explain my NASA environmental risk report.",
  "What happens if I replace maize with sorghum?",
  "How does 7.5 pH loamy soil affect chickpea and berseem?",
];

function AssistantContent() {
  const searchParams = useSearchParams();
  const fromSim = searchParams.get("fromSim");

  const [farm, setFarm] = useState<Farm | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hello! I am your **AgroShift AI Agricultural Assistant**, grounded directly in your farm's soil profile and real NASA POWER Earth observations. How can I assist your crop rotation strategy today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [simContext, setSimContext] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const f = await getLatestFarm();
        setFarm(f);

        // Check if coming from What-If Simulator
        if (typeof window !== "undefined" && fromSim) {
          const stored = sessionStorage.getItem("agroshift_sim_context");
          if (stored) {
            const parsed = JSON.parse(stored);
            setSimContext(parsed);
            // Auto prompt
            const prompt = `Can you explain the results of the What-If stress scenario (${parsed.scenario?.description}) and why the strategy rankings changed?`;
            handleSendMessage(prompt, parsed);
          }
        }
      } catch (e) {
        console.error(e);
      }
    }
    loadData();
  }, [fromSim]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string, contextOverride?: any) => {
    const q = textToSend || input;
    if (!q.trim() || loading) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: q }]);
    setLoading(true);

    try {
      const res = await sendChatMessage(
        q,
        farm?.id,
        contextOverride || simContext
      );
      setMessages((prev) => [...prev, { role: "assistant", content: res.response }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error communicating with the backend. Please ensure the FastAPI server is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 bg-slate-50/50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
            <Bot className="w-3.5 h-3.5 text-blue-600" />
            <span>Module 5: Evidence-Based AI Agricultural Assistant</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight">
            Ask the AgroShift Agronomist
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Grounded strictly in NASA POWER observations, soil physics, and deterministic crop engine scores.
          </p>
        </div>

        {simContext && (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-xs text-amber-800 font-bold flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>Active What-If Context Attached</span>
          </div>
        )}
      </div>

      {/* Suggested Questions Pills */}
      <div className="space-y-2">
        <span className="text-xs text-slate-500 font-semibold">💡 Quick Questions for Live Demonstration:</span>
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSendMessage(q)}
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-xs text-slate-700 font-medium transition-all text-left shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Card */}
      <div className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[520px] overflow-hidden shadow-sm">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
          {messages.map((m, idx) => {
            const isUser = m.role === "user";
            return (
              <div
                key={idx}
                className={`flex gap-3 max-w-[85%] ${
                  isUser ? "ml-auto flex-row-reverse" : "mr-auto"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-blue-100 text-blue-700 border border-blue-200"
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-blue-600 text-white rounded-tr-none shadow-sm"
                      : "bg-white border border-slate-200 text-slate-800 rounded-tl-none whitespace-pre-wrap shadow-2xs"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center text-xs text-slate-500 p-3 bg-white rounded-xl border border-slate-200 shadow-2xs">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>Analyzing NASA observations & rotation engine rationale...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask why a strategy won, or what happens if drought strikes..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AssistantPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    }>
      <AssistantContent />
    </Suspense>
  );
}
