import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  RefreshCw,
  ChevronDown,
  User,
  Copy,
  Check,
  Minimize2,
  Maximize2,
} from 'lucide-react';

/* ─────────────────────────────────────────────────────────────
   SYSTEM CONTEXT — gives the AI knowledge of this application
   ───────────────────────────────────────────────────────────── */
const SYSTEM_PROMPT = `You are an intelligent AI assistant embedded inside the Enterprise Employee ID Card Management System.

You have deep knowledge about:
- Employee lifecycle management (Recruitment → Waiting for Joining → Active → Notice Period → Auto Deactivate → Archive)
- Employee ID card generation, QR codes, barcodes, and multiple card templates
- Branch and department management
- System user roles: Super Admin, HR/Admin, Printer Operator, Security Officer, Employee
- Visitor management — registration, approval, temporary IDs, QR/barcode, expiry
- Print queue management, printer telemetry, maintenance, downtime
- Employee ID auto-generation format: [3-letter role code][YY][6-digit sequence] e.g. EMP260000001
- ID card themes auto-assigned based on designation keywords
- AES-256 encryption for sensitive employee data
- Audit logging for all system actions
- Email notifications for employee creation, ID generation, visitor approval/rejection, print completion

You can help with:
- How to add employees, users, or visitors
- How to generate and manage ID cards
- How to manage branches, departments, and roles
- Understanding lifecycle statuses and transitions
- Troubleshooting common issues
- Explaining features and workflows
- HR best practices and onboarding tips
- System security and access control guidance

Keep responses concise, helpful, and professional. Use bullet points and clear formatting when listing steps. If you don't know something, say so honestly.`;

/* ─────────────────────────────────────────────────────────────
   QUICK SUGGESTION CHIPS
   ───────────────────────────────────────────────────────────── */
const QUICK_SUGGESTIONS = [
  'How do I add a new employee?',
  'How does lifecycle tracking work?',
  'How are employee IDs generated?',
  'How do I generate an ID card?',
  'How does visitor management work?',
  'What roles are available in the system?',
  'How to manage the print queue?',
  'What does the designation theme mean?',
];

/* ─────────────────────────────────────────────────────────────
   GEMINI API CALL
   ───────────────────────────────────────────────────────────── */
const callGeminiApi = async (messages) => {
  // Use the Gemini 2.0 Flash model via Google AI API
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

  if (!apiKey) {
    return "⚠️ AI assistant is not configured. Please add your `VITE_GEMINI_API_KEY` to the frontend `.env` file to enable AI support.\n\nGet a free key at: https://aistudio.google.com/apikey";
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  // Build conversation history for Gemini
  const contents = messages
    .filter((m) => m.role !== 'system')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

  // Prepend system instruction as the first user turn (Gemini doesn't have system role)
  const payload = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 1024,
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
};

/* ─────────────────────────────────────────────────────────────
   MESSAGE BUBBLE
   ───────────────────────────────────────────────────────────── */
const MessageBubble = ({ msg }) => {
  const [copied, setCopied] = useState(false);
  const isAi = msg.role === 'assistant';

  const handleCopy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simple markdown-ish renderer: bold, bullets, code
  const renderContent = (text) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**')) {
        return <p key={i} className="font-bold text-slate-900 mt-2 first:mt-0">{line.replace(/\*\*/g, '')}</p>;
      }
      if (line.startsWith('• ') || line.startsWith('- ')) {
        return (
          <div key={i} className="flex gap-2 mt-1">
            <span className="text-emerald-500 shrink-0 mt-0.5">•</span>
            <span>{line.replace(/^[•\-]\s/, '')}</span>
          </div>
        );
      }
      if (line.startsWith('`') && line.endsWith('`')) {
        return <code key={i} className="block bg-slate-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-mono mt-1">{line.replace(/`/g, '')}</code>;
      }
      if (line === '') return <div key={i} className="h-1.5" />;
      return <span key={i} className="block">{line}</span>;
    });
  };

  return (
    <div className={`flex gap-2.5 ${isAi ? 'items-start' : 'items-start flex-row-reverse'}`}>
      {/* Avatar */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
          isAi
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
            : 'bg-gradient-to-br from-slate-600 to-slate-800'
        }`}
      >
        {isAi ? <Bot className="w-4 h-4 text-white" /> : <User className="w-3.5 h-3.5 text-white" />}
      </div>

      {/* Bubble */}
      <div className={`group max-w-[82%] ${isAi ? '' : 'items-end'}`}>
        <div
          className={`px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
            isAi
              ? 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
              : 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-tr-sm'
          }`}
        >
          {isAi ? renderContent(msg.content) : <span>{msg.content}</span>}
        </div>
        {/* Copy button for AI messages */}
        {isAi && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 mt-1 flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 transition-all"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        )}
        <p className={`text-[9px] text-slate-400 mt-1 ${isAi ? 'text-left' : 'text-right'}`}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   TYPING INDICATOR
   ───────────────────────────────────────────────────────────── */
const TypingIndicator = () => (
  <div className="flex gap-2.5 items-start">
    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shrink-0">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
      <div className="flex gap-1 items-center">
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   MAIN AI ASSISTANT COMPONENT
   ───────────────────────────────────────────────────────────── */
const INITIAL_MESSAGE = {
  role: 'assistant',
  content: `Hello! I'm your **Enterprise AI Assistant** — here to help you get the most out of this system.\n\nI can help you with:\n- Adding employees, users & visitors\n- Managing ID cards & print queues\n- Understanding lifecycle tracking\n- Branch, department & role management\n- Troubleshooting any issues\n\nWhat can I help you with today?`,
  timestamp: Date.now(),
};

export const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showSuggestions, setShowSuggestions] = useState(true);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const chatBodyRef = useRef(null);

  // Listen for sidebar "AI Assistant" button click
  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('ai:open', handler);
    return () => window.removeEventListener('ai:open', handler);
  }, []);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isLoading, isOpen, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = async (text) => {
    const userText = (text || input).trim();
    if (!userText || isLoading) return;

    setInput('');
    setShowSuggestions(false);

    const userMsg = { role: 'user', content: userText, timestamp: Date.now() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const replyText = await callGeminiApi(updatedMessages);
      const aiMsg = { role: 'assistant', content: replyText, timestamp: Date.now() };
      setMessages((prev) => [...prev, aiMsg]);
      if (!isOpen) setUnreadCount((c) => c + 1);
    } catch (err) {
      const errMsg = {
        role: 'assistant',
        content: `❌ Sorry, I encountered an error: ${err.message}\n\nPlease check your internet connection or API key configuration.`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_MESSAGE]);
    setShowSuggestions(true);
  };

  const panelWidth = isExpanded ? 'w-[520px]' : 'w-[380px]';
  const panelHeight = isExpanded ? 'h-[680px]' : 'h-[560px]';

  return (
    <>
      {/* ── Floating Trigger Bubble ─────────────────────────────── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 group"
          title="Open AI Assistant"
        >
          <div className="relative">
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-25" />
            <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl shadow-emerald-500/40 hover:scale-110 transition-transform duration-200">
              <Bot className="w-6 h-6 text-white" />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                {unreadCount}
              </span>
            )}
          </div>
          <span className="absolute right-16 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-xs font-medium px-2.5 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
            AI Assistant
          </span>
        </button>
      )}

      {/* ── Chat Panel ─────────────────────────────────────────────── */}
      {isOpen && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex flex-col ${panelWidth} ${panelHeight} bg-white rounded-2xl shadow-2xl shadow-slate-900/20 border border-slate-200 overflow-hidden transition-all duration-300`}
          style={{ animation: 'slideUpFadeIn 0.25s ease-out' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-700 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-none">Enterprise AI Assistant</h3>
                <p className="text-[10px] text-emerald-100/80 mt-0.5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full inline-block animate-pulse" />
                  Powered by Gemini AI
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Clear conversation"
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded((v) => !v)}
                title={isExpanded ? 'Minimize' : 'Expand'}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Messages body */}
          <div
            ref={chatBodyRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/60"
          >
            {messages.map((msg, idx) => (
              <MessageBubble key={idx} msg={msg} />
            ))}

            {isLoading && <TypingIndicator />}

            {/* Quick Suggestions (shown only at start or after reset) */}
            {showSuggestions && messages.length === 1 && !isLoading && (
              <div className="space-y-2 pt-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-0.5">
                  Quick questions
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_SUGGESTIONS.map((s, i) => (
                    <button
                      key={i}
                      onClick={() => sendMessage(s)}
                      className="text-[11px] px-2.5 py-1.5 rounded-full border border-emerald-200 bg-white text-emerald-700 font-medium hover:bg-emerald-50 hover:border-emerald-400 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input footer */}
          <div className="shrink-0 border-t border-slate-200 bg-white px-3 py-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about the system..."
                rows={1}
                className="flex-1 resize-none px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent transition-all leading-relaxed"
                style={{ minHeight: '36px', maxHeight: '96px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 96) + 'px';
                }}
                disabled={isLoading}
              />
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || isLoading}
                className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md hover:shadow-emerald-400/40 hover:scale-105 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 shrink-0"
              >
                {isLoading ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <p className="text-[9px] text-slate-400 text-center mt-2">
              Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px]">Enter</kbd> to send • <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px]">Shift+Enter</kbd> for new line
            </p>
          </div>
        </div>
      )}

      {/* Slide-up animation keyframe */}
      <style>{`
        @keyframes slideUpFadeIn {
          from { opacity: 0; transform: translateY(20px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};

export default AiAssistant;
