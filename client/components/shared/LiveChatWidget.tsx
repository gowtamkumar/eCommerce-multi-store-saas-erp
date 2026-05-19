"use client";

import { useSettings } from "@/hooks/SettingsContext";
import { fetchAPI } from "@/services/api";
import { MessageSquare, Send, X, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

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
  const [visitorId, setVisitorId] = useState<string>("");
  const [conversationId, setConversationId] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const tenantId = settings?.tenantId || null;
  const customerId = session?.user?.id || null;

  // Generate or retrieve persistent Visitor ID
  useEffect(() => {
    let storedId = localStorage.getItem("chat_visitor_id");
    if (!storedId) {
      storedId = crypto.randomUUID();
      localStorage.setItem("chat_visitor_id", storedId);
    }
    setVisitorId(storedId);
  }, []);

  // Scroll to bottom helper
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  // Load chat history & initialize socket connection
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
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Socket Connection setup
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
      // Join conversation room
      socketInstance.emit("room.join", {
        conversationId,
        senderType: "VISITOR",
      });
    });

    // Listen for new messages
    socketInstance.on("message.receive", (message: Message) => {
      setMessages((prev) => {
        // Prevent duplicate appending
        if (prev.some((m) => m.id === message.id)) return prev;
        return [...prev, message];
      });

      if (!isOpenRef.current && message.senderType === "AGENT") {
        setUnreadCount((c) => c + 1);
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [visitorId, tenantId, conversationId]);

  // Handle opening the chat panel
  const handleOpenToggle = async () => {
    const nextState = !isOpen;
    setIsOpen(nextState);

    if (nextState) {
      setUnreadCount(0);
      // Mark read via API
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

  // Send message handler
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

  if (settings?.isSaaS) return null; // Hide on global SaaS portal

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 sm:w-96 h-[480px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 flex flex-col overflow-hidden transition-all duration-300">
          {/* Header */}
          <div className="bg-indigo-600 dark:bg-indigo-700 px-4 py-3 flex items-center justify-between text-white">
            <div className="flex items-center space-x-3">
              <div className="relative">
                {session?.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="w-10 h-10 rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center font-bold">
                    {session?.user?.name?.substring(0, 1).toUpperCase() || settings?.brandName?.substring(0, 1) || "S"}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-indigo-600 rounded-full"></span>
              </div>
              <div>
                <h3 className="font-semibold text-sm leading-none">
                  {session?.user?.name || "Live Support"}
                </h3>
                <span className="text-[10px] text-indigo-100 mt-1 block">
                  {session?.user?.email || "We are online to help"}
                </span>
              </div>
            </div>
            <button
              onClick={handleOpenToggle}
              className="p-1 hover:bg-white/10 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-700" />
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
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${isVisitor
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
                        className={`text-[9px] block text-right mt-1 ${isVisitor ? "text-indigo-200" : "text-slate-400"
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

          {/* Footer Input */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center space-x-2"
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
        </div>
      )}

      {/* Floating Chat Bubble Button */}
      <button
        onClick={handleOpenToggle}
        className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all duration-200"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-black rounded-full px-2 py-0.5 shadow-md">
            {unreadCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default LiveChatWidget;
