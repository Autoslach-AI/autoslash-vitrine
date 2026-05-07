"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/lib/supabaseClient";
import { Send, Bot, User, ArrowRight, RefreshCw } from "lucide-react";

interface Agent {
  id: string;
  name: string;
  tagline: string;
  sector: string;
  use_case: string;
  system_prompt: string;
  opening_questions: string[];
  suggested_prompts: { label: string; prompt: string }[];
  compatible_sectors: string[];
  redirect_rules: Record<string, string>;
  max_messages: number;
  display_order: number;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AgentsDemo() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [messageCount, setMessageCount] = useState(0);
  const [redirectSuggestion, setRedirectSuggestion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAgents();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchAgents = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase
        .from("demo_agents")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true });

      if (!error && data) {
        setAgents(data);
        if (data.length > 0) {
          setSelectedAgent(data[0]);
          initConversation(data[0]);
        }
      } else if (error) {
        console.error("Error fetching agents:", error);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setIsFetching(false);
    }
  };

  const initConversation = (agent: Agent) => {
    setMessages([
      {
        role: "assistant",
        content: agent.opening_questions?.[0] || `Bonjour ! Je suis ${agent.name}. Comment puis-je vous aider aujourd'hui ?`
      }
    ]);
    setMessageCount(0);
    setRedirectSuggestion(null);
    setInput("");
  };

  const selectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    initConversation(agent);
  };

  const checkRedirect = (userMessage: string, agent: Agent) => {
    const sectors = Object.keys(agent.redirect_rules || {});
    for (const sector of sectors) {
      if (userMessage.toLowerCase().includes(sector.toLowerCase())) {
        const targetAgent = agents.find(a => 
          a.name.toLowerCase().includes(agent.redirect_rules[sector].replace("agent-", ""))
        );
        if (targetAgent) {
          setRedirectSuggestion(targetAgent.name);
        }
      }
    }
  };

  const sendMessage = async (content: string) => {
    if (!content.trim() || !selectedAgent || isLoading) return;
    if (messageCount >= selectedAgent.max_messages) return;

    const userMessage: Message = { role: "user", content };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setMessageCount(prev => prev + 1);

    checkRedirect(content, selectedAgent);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-3-5-sonnet-20240620", // Use a valid Claude model identifier
          max_tokens: 1000,
          system: selectedAgent.system_prompt,
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.content?.[0]?.text || "Je n'ai pas pu générer une réponse."
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Une erreur est survenue. Veuillez réessayer."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const isMaxReached = messageCount >= (selectedAgent?.max_messages || 5);

  if (isFetching) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/20 animate-pulse font-black uppercase tracking-widest text-xs">Initialisation des agents...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-6">

        {/* HEADER */}
        <div className="mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-8 h-[1px] bg-white/20" />
            <span className="text-white/30 text-[10px] font-bold tracking-[0.4em] uppercase">
              Démonstration Live
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            NOS AGENTS
            <br />
            <span className="text-white/15">EN ACTION.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-lg text-white/40 text-sm leading-relaxed"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Testez nos agents en conditions réelles. Chaque agent est entraîné pour répondre comme un expert humain dans son domaine.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* SIDEBAR — SÉLECTEUR AGENTS */}
          <div className="lg:col-span-3">
            <div className="sticky top-28 space-y-2">
              <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-4">
                Choisir un agent
              </p>
              {agents.map((agent) => (
                <motion.button
                  key={agent.id}
                  onClick={() => selectAgent(agent)}
                  whileHover={{ x: 4 }}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-300 ${
                    selectedAgent?.id === agent.id
                      ? "bg-white text-black border-white"
                      : "bg-white/[0.03] border-white/[0.06] text-white/50 hover:border-white/20 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      selectedAgent?.id === agent.id ? "bg-black" : "bg-white/10"
                    }`}>
                      <Bot size={14} className={selectedAgent?.id === agent.id ? "text-white" : "text-white/50"} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-tight">
                        {agent.name}
                      </p>
                      <p className={`text-[10px] mt-0.5 ${
                        selectedAgent?.id === agent.id ? "text-black/50" : "text-white/30"
                      }`}>
                        {agent.sector}
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* ZONE CHAT */}
          <div className="lg:col-span-9">
            {selectedAgent && (
              <div className="bg-neutral-950 border border-white/[0.06] rounded-2xl overflow-hidden flex flex-col h-[680px]">

                {/* Header chat */}
                <div className="px-6 py-4 border-b border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <Bot size={18} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-black text-sm uppercase tracking-tight">
                        {selectedAgent.name}
                      </p>
                      <p className="text-white/30 text-[10px]">{selectedAgent.tagline}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Compteur messages */}
                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: selectedAgent.max_messages }).map((_, i) => (
                        <div
                          key={i}
                          className={`w-1.5 h-1.5 rounded-full transition-all ${
                            i < messageCount ? "bg-white" : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    {/* Reset */}
                    <button
                      onClick={() => initConversation(selectedAgent)}
                      className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
                    >
                      <RefreshCw size={12} className="text-white/40" />
                    </button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  <AnimatePresence>
                    {messages.map((msg, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        {msg.role === "assistant" && (
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mt-1">
                            <Bot size={14} className="text-white" />
                          </div>
                        )}
                        <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-white text-black font-medium rounded-tr-sm"
                            : "bg-white/[0.06] text-white/80 rounded-tl-sm"
                        }`}
                          style={{ fontFamily: "'DM Sans', sans-serif" }}
                        >
                          {msg.content}
                        </div>
                        {msg.role === "user" && (
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 mt-1">
                            <User size={14} className="text-black" />
                          </div>
                        )}
                      </motion.div>
                    ))}

                    {/* Typing indicator */}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          <Bot size={14} className="text-white" />
                        </div>
                        <div className="bg-white/[0.06] px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
                          {[0, 1, 2].map(i => (
                            <motion.div
                              key={i}
                              animate={{ y: [0, -4, 0] }}
                              transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.15 }}
                              className="w-1.5 h-1.5 rounded-full bg-white/40"
                            />
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div ref={messagesEndRef} />
                </div>

                {/* Suggestion redirect */}
                {redirectSuggestion && (
                  <div className="px-6 py-3 border-t border-white/[0.06] bg-white/[0.02]">
                    <p className="text-white/40 text-[11px] mb-2">
                      💡 Pour ce secteur, un autre agent pourrait mieux vous aider :
                    </p>
                    <button
                      onClick={() => {
                        const agent = agents.find(a => a.name === redirectSuggestion);
                        if (agent) selectAgent(agent);
                        setRedirectSuggestion(null);
                      }}
                      className="flex items-center gap-2 text-white text-[11px] font-bold hover:gap-3 transition-all"
                    >
                      Essayer {redirectSuggestion} <ArrowRight size={12} />
                    </button>
                  </div>
                )}

                {/* Prompts suggérés */}
                {messages.length <= 2 && !isMaxReached && (
                  <div className="px-6 py-3 border-t border-white/[0.06]">
                    <p className="text-white/20 text-[10px] font-bold uppercase tracking-widest mb-2">
                      Essayez ces exemples
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedAgent.suggested_prompts?.slice(0, 3).map((sp, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(sp.prompt)}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-white/50 text-[10px] font-medium hover:bg-white/10 hover:text-white transition-all"
                        >
                          {sp.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Limite atteinte */}
                {isMaxReached && (
                  <div className="px-6 py-4 border-t border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
                    <p className="text-white/40 text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Vous avez découvert le potentiel de cet agent. Prêt à le déployer ?
                    </p>
                    <a
                      href="/contact"
                      className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-[11px] font-black uppercase tracking-widest hover:bg-white/90 transition-colors"
                    >
                      Démarrer <ArrowRight size={12} />
                    </a>
                  </div>
                )}

                {/* Input */}
                {!isMaxReached && (
                  <div className="px-6 py-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-4 py-3 focus-within:border-white/30 transition-colors">
                      <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                        placeholder={`Parlez à ${selectedAgent.name}...`}
                        disabled={isLoading}
                        className="flex-1 bg-transparent outline-none text-white/70 text-sm placeholder:text-white/20"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      />
                      <button
                        onClick={() => sendMessage(input)}
                        disabled={isLoading || !input.trim()}
                        className="w-8 h-8 rounded-full bg-white flex items-center justify-center disabled:opacity-30 hover:bg-white/90 transition-all"
                      >
                        <Send size={14} className="text-black" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
