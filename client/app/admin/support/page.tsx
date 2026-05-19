"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send, User, CheckCircle2, Clock } from "lucide-react";
import { fetchAPI } from "@/services/api";
import { io, Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface Conversation {
  id: string;
  visitorId: string;
  customerId: string | null;
  status: string;
  unreadCountAdmin: number;
  lastMessageAt: string;
  customer?: {
    username: string;
    email: string;
  } | null;
}

interface Message {
  id: string;
  conversationId: string;
  senderType: "VISITOR" | "AGENT";
  senderName: string | null;
  message: string;
  createdAt: string;
}

const SupportChatPage = () => {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);
  const [loadingConv, setLoadingConv] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedConvRef = useRef<Conversation | null>(null);

  // Sync selectedConv ref
  useEffect(() => {
    selectedConvRef.current = selectedConv;
  }, [selectedConv]);

  // Scroll to bottom helper
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Load conversations list
  useEffect(() => {
    const loadConversations = async () => {
      try {
        const response = await fetchAPI("/chat/conversations?status=ACTIVE");
        if (response.success && response.data) {
          setConversations(response.data.conversations);
        }
      } catch (error) {
        console.error("Failed to load conversations", error);
      } finally {
        setLoadingConv(false);
      }
    };
    loadConversations();
  }, []);

  // Initialize Socket.io Client for Agent
  useEffect(() => {
    if (!session?.user?.accessToken) return;

    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:3900";
    const socketInstance = io(`${wsUrl}/chat`, {
      auth: {
        token: `Bearer ${session.user.accessToken}`,
      },
      transports: ["websocket"],
    });

    socketInstance.on("connect", () => {
      console.log("Agent Chat WebSocket connected");
      // Re-join the active conversation room if one is selected
      if (selectedConvRef.current) {
        socketInstance.emit("room.join", {
          conversationId: selectedConvRef.current.id,
          senderType: "AGENT",
        });
      }
    });

    // Listen for new conversations / visitor message updates
    socketInstance.on("agent.conversation_updated", (data: { conversationId: string; visitorId: string; lastMessage: string }) => {
      // Reload list or move conversation to the top
      setConversations((prev) => {
        const index = prev.findIndex((c) => c.id === data.conversationId);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            unreadCountAdmin: updated[index].unreadCountAdmin + 1,
            lastMessageAt: new Date().toISOString(),
          };
          // Move to top
          const item = updated.splice(index, 1)[0];
          return [item, ...updated];
        } else {
          // New conversation
          const newConv: Conversation = {
            id: data.conversationId,
            visitorId: data.visitorId,
            customerId: null,
            status: "ACTIVE",
            unreadCountAdmin: 1,
            lastMessageAt: new Date().toISOString(),
          };
          return [newConv, ...prev];
        }
      });

      if (selectedConvRef.current?.id !== data.conversationId) {
        toast("New visitor message received!", {
          icon: "💬",
        });
      }
    });

    // Listen for incoming messages in joined rooms
    socketInstance.on("message.receive", (message: Message) => {
      if (selectedConvRef.current?.id === message.conversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [session]);

  // Join room when selected conversation changes
  useEffect(() => {
    if (!socket || !selectedConv) return;

    socket.emit("room.join", {
      conversationId: selectedConv.id,
      senderType: "AGENT",
    });
  }, [socket, selectedConv]);

  // Handle selecting a conversation
  const handleSelectConversation = async (conv: Conversation) => {
    setSelectedConv(conv);
    setLoadingMessages(true);

    try {
      // Load messages
      const response = await fetchAPI(`/chat/conversations/${conv.id}/messages`);
      if (response.success && response.data) {
        setMessages(response.data.messages);
      }

      // Mark as read in local state
      setConversations((prev) =>
        prev.map((c) => (c.id === conv.id ? { ...c, unreadCountAdmin: 0 } : c))
      );
    } catch (error) {
      console.error("Failed to load messages", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket || !selectedConv) return;

    socket.emit("message.send", {
      conversationId: selectedConv.id,
      message: inputMessage.trim(),
      senderType: "AGENT",
      senderName: session?.user?.name || "Agent",
    });

    setInputMessage("");
  };

  return (
    <div className="flex h-[calc(100vh-80px)] bg-slate-50 dark:bg-slate-950 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
      {/* Sidebar List */}
      <div className="w-80 sm:w-96 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h1 className="text-xl font-bold text-slate-800 dark:text-white flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-indigo-600" />
            <span>Support Chat</span>
          </h1>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Answer questions and support storefront visitors in real-time.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
          {loadingConv ? (
            <div className="p-8 text-center text-slate-400 text-sm">Loading chats...</div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-sm">No active conversations.</div>
          ) : (
            conversations.map((conv) => {
              const isSelected = selectedConv?.id === conv.id;
              const displayName = conv.customer?.username || `Visitor #${conv.visitorId.substring(0, 5)}`;
              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full text-left p-4 transition-colors flex items-center justify-between ${
                    isSelected
                      ? "bg-indigo-50/50 dark:bg-indigo-950/20"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 font-bold shrink-0">
                      {displayName.substring(0, 1).toUpperCase()}
                    </div>
                    <div className="truncate">
                      <h3 className="font-semibold text-sm text-slate-800 dark:text-white truncate">
                        {displayName}
                      </h3>
                      <span className="text-xs text-slate-400 dark:text-slate-500 truncate block">
                        {conv.customer ? "Registered Buyer" : "Guest Visitor"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 ml-2">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500">
                      {new Date(conv.lastMessageAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {conv.unreadCountAdmin > 0 && (
                      <span className="mt-1 bg-rose-500 text-white text-[9px] font-black rounded-full px-1.5 py-0.5">
                        {conv.unreadCountAdmin}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Conversation Window */}
      <div className="flex-1 flex flex-col bg-slate-50 dark:bg-slate-950">
        {selectedConv ? (
          <>
            {/* Active Header */}
            <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 font-bold">
                  {(selectedConv.customer?.username || "Visitor").substring(0, 1).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-slate-800 dark:text-white">
                    {selectedConv.customer?.username || `Visitor #${selectedConv.visitorId}`}
                  </h2>
                  {selectedConv.customer && (
                    <span className="text-xs text-slate-400 block">{selectedConv.customer.email}</span>
                  )}
                </div>
              </div>

              <span className="flex items-center text-xs text-green-500 bg-green-50 dark:bg-green-950/30 px-3 py-1 rounded-full font-medium">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Active Room
              </span>
            </div>

            {/* Message History */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                  Loading message history...
                </div>
              ) : (
                messages.map((msg) => {
                  const isAgent = msg.senderType === "AGENT";
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isAgent ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                          isAgent
                            ? "bg-indigo-600 text-white rounded-br-none"
                            : "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-bl-none border border-slate-150 dark:border-slate-800"
                        }`}
                      >
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        <span
                          className={`text-[9px] block text-right mt-1 ${
                            isAgent ? "text-indigo-200" : "text-slate-400"
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

            {/* Input Footer */}
            <form
              onSubmit={handleSendMessage}
              className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center space-x-3"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your response..."
                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim()}
                className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center space-x-2 transition-all duration-200"
              >
                <span>Send</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8">
            <MessageSquare className="w-16 h-16 text-slate-200 dark:text-slate-800 mb-3" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-400">No Chat Selected</h3>
            <p className="text-sm text-slate-400 mt-1 max-w-xs text-center">
              Select a guest visitor or customer from the left sidebar to start live chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportChatPage;
