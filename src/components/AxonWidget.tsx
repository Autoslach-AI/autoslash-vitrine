import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, Mic, MicOff, MessageSquare } from "lucide-react";
import { useUser, useClerk } from "@clerk/clerk-react";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
}

const INITIAL_CARDS = [
  { label: "Découvrir nos offres", value: "Quelles sont vos offres ?" },
  { label: "Voir les agents IA", value: "Montrez-moi vos agents IA" },
  { label: "Démarrer un projet", value: "Je veux démarrer un projet" },
  { label: "En savoir plus", value: "Parlez-moi d'Autoslash AI" },
];

export default function AxonWidget() {
  const { isSignedIn, user } = useUser();
  const { openSignIn } = useClerk();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showCards, setShowCards] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open && messages.length === 0 && isSignedIn) {
      const greeting = user?.firstName
        ? `Bonjour ${user.firstName} — je suis AXON, votre guide Autoslash AI. Comment puis-je vous aider ?`
        : "Bonjour — je suis AXON, votre guide Autoslash AI. Comment puis-je vous aider ?";
      setMessages([{ id: "greeting", role: "agent", content: greeting }]);
    }
  }, [open, isSignedIn, user]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);
    setShowCards(false);

    const history = [...messages, userMsg].map(m => ({
      role: m.role === "user" ? "user" : "model",
      content: m.content,
    }));

    try {
      const res = await fetch("https://vrmkpnqjmqztpfowwkzv.supabase.co/functions/v1/chat-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agent_id: "axon", messages: history }),
      });
      const data = await res.json();
      const content = data.content?.[0]?.text || "Une erreur est survenue.";
      setMessages(prev => [...prev, { id: `a-${Date.now()}`, role: "agent", content }]);
    } catch {
      setMessages(prev => [...prev, { id: `err-${Date.now()}`, role: "agent", content: "Connexion interrompue." }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, isLoading]);

  const toggleVoice = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Votre navigateur ne supporte pas la reconnaissance vocale.");
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = "fr-FR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      sendMessage(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">

      {/* Fenêtre chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="w-[360px] rounded-2xl overflow-hidden shadow-2xl"
            style={{
              background: "#080808",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  className="w-2 h-2 rounded-full bg-blue-400"
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <div>
                  <p className="text-white font-black text-sm tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                    AXON
                  </p>
                  <p className="text-white/30 text-[10px] uppercase tracking-widest" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Autoslash AI · En ligne
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={14} />
              </button>
            </div>

            {/* Corps */}
            <div className="h-[340px] overflow-y-auto px-4 py-4 flex flex-col gap-4">
              {!isSignedIn ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center gap-4 py-8">
                  <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <MessageSquare size={20} className="text-white/30" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Connexion requise
                    </p>
                    <p className="text-white/30 text-xs leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      Connectez-vous pour parler à AXON et découvrir comment Autoslash AI peut transformer votre business.
                    </p>
                  </div>
                  
                  <button
                    onClick={() => openSignIn()}
                    className="px-5 py-2 bg-white text-black text-xs font-bold uppercase tracking-widest rounded-full hover:bg-white/90 transition-colors"
                  >
                    Se connecter
                  </button>
                </div>
              ) : (
                <>
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className="max-w-[80%] px-4 py-2.5 rounded-2xl text-xs leading-relaxed"
                        style={{
                          background: msg.role === "user" ? "#1a1a1a" : "transparent",
                          border: msg.role === "user" ? "1px solid rgba(255,255,255,0.06)" : "none",
                          color: msg.role === "user" ? "#fff" : "rgba(255,255,255,0.8)",
                          fontFamily: "'DM Sans', sans-serif",
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {/* Cartes initiales */}
                  {showCards && messages.length <= 1 && (
                    <div className="flex flex-col gap-2 mt-2">
                      {INITIAL_CARDS.map((card, i) => (
                        <motion.button
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.08 }}
                          onClick={() => sendMessage(card.value)}
                          className="text-left px-4 py-2.5 rounded-xl text-xs text-white/60 hover:text-white transition-colors"
                          style={{
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            fontFamily: "'DM Sans', sans-serif",
                          }}
                        >
                          {card.label} →
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {isLoading && (
                    <div className="flex gap-1 pl-1">
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-blue-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  )}
                  <div ref={bottomRef} />
                </>
              )}
            </div>

            {/* Input */}
            {isSignedIn && (
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
              >
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage(input)}
                  placeholder="Écrire à AXON..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent outline-none text-white text-xs placeholder:text-white/20"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
                <button
                  onClick={toggleVoice}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors ${isListening ? "bg-red-500/20 text-red-400" : "text-white/20 hover:text-white"}`}
                >
                  {isListening ? <MicOff size={13} /> : <Mic size={13} />}
                </button>
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="w-7 h-7 rounded-full bg-white flex items-center justify-center disabled:opacity-20 transition-opacity"
                >
                  <Send size={12} className="text-black" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bouton bulle */}
      <motion.button
        onClick={() => setOpen(prev => !prev)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
        style={{
          background: open ? "#111" : "#fff",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <X size={20} className="text-white" />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
              <span className="text-black font-black text-xs tracking-wider">AX</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

    </div>
  );
}
