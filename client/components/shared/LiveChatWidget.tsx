"use client";

import { useSettings } from "@/hooks/SettingsContext";
import { fetchAPI } from "@/services/api";
import {
  STOREFRONT_OPEN_LIVE_CHAT_EVENT,
  type StorefrontLiveChatHandoffDetail,
  buildAssistantHandoffPrefill,
} from "@/lib/storefront-live-chat-handoff";
import { useShoppingAssistant } from "@/features/product/shop/hooks/useShoppingAssistant";
import { MessageSquare, Send, X, Sparkles, RotateCcw, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState, useMemo, FormEvent } from "react";
import { io, Socket } from "socket.io-client";
import Link from "next/link";

const STARTER_PROMPTS = [
  "What do you sell?",
  "Help me find a gift",
  "What is your return policy?",
];

interface Message {
  id: string;
  conversationId: string;
  senderType: "VISITOR" | "AGENT";
  senderName: string | null;
  message: string;
  createdAt: string;
}

const LiveChatWidget = () => {
  const { settings } = useSettings();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"ai" | "human">("ai");
  const [visitorId, setVisitorId] = useState<string>("");
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiMessagesEndRef = useRef<HTMLDivElement>(null);

  const tenantId = settings?.tenantId || null;
  const customerId = session?.user?.id || null;

  // AI Assistant hook integration
  const brandName = settings?.brandName || "our store";
  const {
    available: aiAvailable,
    loading: aiLoading,
    messages: aiMessages,
    sendMessage: sendAiMessage,
    resetConversation: resetAiConversation,
  } = useShoppingAssistant(tenantId || undefined, settings?.brandName);

  const [aiInput, setAiInput] = useState("");
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);

  const promptSuggestions = useMemo(() => {
    if (suggestedFollowUps.length > 0) {
      return suggestedFollowUps.slice(0, 3);
    }
    return STARTER_PROMPTS;
  }, [suggestedFollowUps]);

  // Generate or retrieve persistent Visitor ID
  useEffect(() => {
    let storedId = localStorage.getItem("chat_visitor_id");
    if (!storedId) {
      storedId = crypto.randomUUID();
      localStorage.setItem("chat_visitor_id", storedId);
    }
    setVisitorId(storedId);
  }, []);

  // Scroll to bottom helpers
  useEffect(() => {
    if (messagesEndRef.current && activeTab === "human") {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, activeTab]);

  useEffect(() => {
    if (aiMessagesEndRef.current && activeTab === "ai") {
      aiMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [aiMessages, isOpen, activeTab, aiLoading]);

  // If AI assistant is not available, default active tab to human
  useEffect(() => {
    if (aiAvailable === false) {
      setActiveTab("human");
    }
  }, [aiAvailable]);

  // Load chat history
  useEffect(() => {
    if (!visitorId || !tenantId) return;

    const loadHistory = async () => {
      try {
        const queryParams = new URLSearchParams({ visitorId });
        if (customerId) {
          queryParams.append("customerId", customerId);
        }

        const result = await fetchAPI(`/chat/history?${queryParams.toString()}`);
        if (result.success && result.data) {
          setConversationId(result.data.conversation.id);
          setMessages(result.data.messages);
          setUnreadCount(result.data.conversation.unreadCountVisitor || 0);
        }
      } catch (error) {
        console.error("Failed to load visitor chat history", error);
      }
    };

    loadHistory();
  }, [visitorId, tenantId, customerId]);

  const isOpenRef = useRef(false);
  const activeTabRef = useRef<"ai" | "human">("ai");

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  // Open from storefront handoff event (or hash navigation)
  useEffect(() => {
    const openFromHandoff = (event: Event) => {
      const detail = (event as CustomEvent<StorefrontLiveChatHandoffDetail>).detail;
      if (detail?.prefillMessage) {
        setInputMessage(detail.prefillMessage);
      }
      setActiveTab("human");
      setIsOpen(true);
      setUnreadCount(0);
    };

    window.addEventListener(STOREFRONT_OPEN_LIVE_CHAT_EVENT, openFromHandoff);

    if (typeof window !== "undefined" && window.location.hash === "#live-chat") {
      setActiveTab("human");
      setIsOpen(true);
    }

    return () => {
      window.removeEventListener(STOREFRONT_OPEN_LIVE_CHAT_EVENT, openFromHandoff);
    };
  }, []);

  // Socket Connection setup for Live Chat
  useEffect(() => {
    if (!visitorId || !tenantId || !conversationId) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3900";
    const socketInstance = io(`${wsUrl}/chat`, {
      query: {
        visitorId,
        tenantId,
      },
      transports: ["websocket"],
    });

    socketInstance.on("connect", () => {
      socketInstance.emit("room.join", {
        conversationId,
        senderType: "VISITOR",
      });
    });

    socketInstance.on("message.receive", (message: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });

      if (message.senderType === "AGENT") {
        if (!isOpenRef.current || activeTabRef.current !== "human") {
          setUnreadCount((c) => c + 1);
        }
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [visitorId, tenantId, conversationId]);

  // Clear unread count when switching to human tab while open
  useEffect(() => {
    if (isOpen && activeTab === "human") {
      setUnreadCount(0);
      const markAsRead = async () => {
        if (conversationId && tenantId) {
          try {
            await fetchAPI(`/chat/conversations/${conversationId}/read/visitor`, {
              method: "POST",
              headers: {
                "x-tenant-id": tenantId,
              },
            });
          } catch (e) {
            console.error("Failed to mark chat as read", e);
          }
        }
      };
      markAsRead();
    }
  }, [activeTab, isOpen, conversationId, tenantId]);

  // Toggle open state
  const handleOpenToggle = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState && activeTab === "human") {
      setUnreadCount(0);
      if (conversationId && tenantId) {
        try {
          await fetchAPI(`/chat/conversations/${conversationId}/read/visitor`, {
            method: "POST",
            headers: {
              "x-tenant-id": tenantId,
            },
          });
        } catch (e) {
          console.error("Failed to mark chat as read", e);
        }
      }
    }
  };

  // Send message to human agent
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket || !conversationId) return;

    socket.emit("message.send", {
      conversationId,
      message: inputMessage.trim(),
      senderType: "VISITOR",
      senderName: session?.user?.name || "Visitor",
    });

    setInputMessage("");
  };

  // Send message to AI assistant
  const handleSendAi = async (value: string) => {
    const result = await sendAiMessage(value);
    if (result) {
      setAiInput("");
      setSuggestedFollowUps(result.suggestedFollowUps || []);
    }
  };

  const onSubmitAi = async (event: FormEvent) => {
    event.preventDefault();
    await handleSendAi(aiInput);
  };

  const lastUserMessage = [...aiMessages].reverse().find((m) => m.role === "user")?.content;

  const handleTalkToHuman = (contextMessage?: string) => {
    const prefill = buildAssistantHandoffPrefill(contextMessage || lastUserMessage);
    if (prefill) {
      setInputMessage(prefill);
    }
    setActiveTab("human");
  };

  if (settings?.isSaaS) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Unified Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[460px] sm:h-[540px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300">
          
          {/* Header */}
          <div className="bg-indigo-600 dark:bg-indigo-700 text-white flex flex-col shrink-0">
            {/* Brand Title Row */}
            <div className="px-4 pt-3.5 pb-2 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-full object-cover border border-white/20"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center font-bold text-xs uppercase">
                      {settings?.brandName?.substring(0, 1).toUpperCase() || "S"}
                    </div>
                  )}
                  {activeTab === "human" && (
                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-green-400 border border-indigo-600 rounded-full"></span>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-sm leading-none">
                    {activeTab === "ai" ? "Shopping Assistant" : (session?.user?.name || "Live Support")}
                  </h3>
                  <span className="text-[10px] text-indigo-200 mt-1 block">
                    {activeTab === "ai" ? "Catalog & FAQ help — no checkout" : (session?.user?.email || "We are online to help")}
                  </span>
                </div>
              </div>
              <button
                onClick={handleOpenToggle}
                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs (Only shown if AI is available) */}
            {aiAvailable === true && (
              <div className="flex border-t border-indigo-500/30">
                <button
                  type="button"
                  onClick={() => setActiveTab("ai")}
                  className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-b-2 ${
                    activeTab === "ai"
                      ? "border-white bg-indigo-700/30 text-white"
                      : "border-transparent text-indigo-200 hover:text-white hover:bg-indigo-700/10"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Shopping AI
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("human")}
                  className={`flex-1 py-2 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border-b-2 relative ${
                    activeTab === "human"
                      ? "border-white bg-indigo-700/30 text-white"
                      : "border-transparent text-indigo-200 hover:text-white hover:bg-indigo-700/10"
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Live Chat
                  {unreadCount > 0 && (
                    <span className="absolute right-4 top-1.5 bg-rose-505 text-rose-500 bg-white font-black rounded-full px-1.5 py-0.5 text-[9px] shadow-sm animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Tab Content: Shopping AI */}
          {activeTab === "ai" ? (
            <>
              {/* AI Messages View */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
                {aiMessages.length === 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-650 dark:text-slate-400 leading-relaxed font-medium">
                      Hi! I can help you browse {brandName}, suggest products, and answer common
                      questions from our FAQ.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {promptSuggestions.map((prompt) => (
                        <button
                          key={prompt}
                          type="button"
                          disabled={aiLoading}
                          onClick={() => handleSendAi(prompt)}
                          className="px-3 py-1.5 rounded-full border border-brand-200 dark:border-brand-800 text-xs font-semibold text-brand-700 dark:text-brand-300 hover:bg-brand-100/60 dark:hover:bg-brand-900/30 disabled:opacity-50"
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  aiMessages.map((message, index) => {
                    const isUser = message.role === "user";
                    return (
                      <div key={`${message.role}-${index}`} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                            isUser
                              ? "bg-brand-600 text-white rounded-br-none"
                              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-800"
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                          {!isUser && message.productLinks && message.productLinks.length > 0 ? (
                            <div className="mt-2 space-y-1">
                              {message.productLinks.map((product) => (
                                <Link
                                  key={product.slug}
                                  href={`/products/${product.slug}`}
                                  onClick={() => setIsOpen(false)}
                                  className="block text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
                                >
                                  View {product.name}
                                </Link>
                              ))}
                            </div>
                          ) : null}
                          {!isUser && message.suggestLiveChatHandoff ? (
                            <button
                              type="button"
                              onClick={() => {
                                const priorUser = aiMessages
                                  .slice(0, index)
                                  .reverse()
                                  .find((m) => m.role === "user")?.content;
                                handleTalkToHuman(priorUser);
                              }}
                              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Talk to a human
                            </button>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}

                {aiLoading ? (
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Thinking...
                  </div>
                ) : null}
                <div ref={aiMessagesEndRef} />
              </div>

              {/* AI Quick Follow-ups */}
              {aiMessages.length > 0 && (
                <div className="px-4 pt-2 flex flex-wrap gap-2 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                  {promptSuggestions.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      disabled={aiLoading}
                      onClick={() => handleSendAi(prompt)}
                      className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-650 dark:text-slate-300 hover:bg-brand-50 dark:hover:bg-brand-950/40 disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}

              {/* AI Form controls */}
              <form
                onSubmit={onSubmitAi}
                className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 space-y-2 shrink-0"
              >
                <button
                  type="button"
                  onClick={() => handleTalkToHuman()}
                  className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Talk to a human (live chat)
                </button>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(event) => setAiInput(event.target.value)}
                    placeholder="Ask about products or policies..."
                    maxLength={500}
                    disabled={aiLoading}
                    className="flex-1 px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={aiLoading || !aiInput.trim()}
                    className="p-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-full transition-colors shrink-0"
                  >
                    {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              {/* Tab Content: Live human Chat support */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <MessageSquare className="w-10 h-10 text-slate-355 dark:text-slate-700" />
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Hi there! Send us a message and we'll reply right away.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isVisitor = msg.senderType === "VISITOR";
                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isVisitor ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                            isVisitor
                              ? "bg-indigo-600 text-white rounded-br-none"
                              : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-100 dark:border-slate-800"
                          }`}
                        >
                          {!isVisitor && (
                            <span className="text-[10px] font-bold block text-indigo-500 dark:text-indigo-400 mb-0.5 uppercase tracking-wide">
                              {msg.senderName || "Support"}
                            </span>
                          )}
                          <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                          <span
                            className={`text-[9px] block text-right mt-1 ${
                              isVisitor ? "text-indigo-200" : "text-slate-400"
                            }`}
                          >
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Support input form */}
              <form
                onSubmit={handleSendMessage}
                className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2 shrink-0"
              >
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-4 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                />
                <button
                  type="submit"
                  disabled={!inputMessage.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-full transition-all duration-200"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* Floating unified button */}
      <button
        onClick={handleOpenToggle}
        className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 relative"
        aria-label="Open support chat"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black rounded-full px-2 py-0.5 shadow-md animate-pulse">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default LiveChatWidget;
