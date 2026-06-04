"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { fetchAPI } from "@/services/api";
import { io, Socket } from "socket.io-client";
import toast from "react-hot-toast";
import { Conversation, Message } from "../types";

export function useSupportChat() {
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
    void loadConversations();
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

  return {
    session,
    conversations,
    selectedConv,
    messages,
    inputMessage,
    setInputMessage,
    loadingConv,
    loadingMessages,
    messagesEndRef,
    handleSelectConversation,
    handleSendMessage,
  };
}
