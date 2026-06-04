"use client";

export interface Conversation {
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

export interface Message {
  id: string;
  conversationId: string;
  senderType: "VISITOR" | "AGENT";
  senderName: string | null;
  message: string;
  createdAt: string;
}
