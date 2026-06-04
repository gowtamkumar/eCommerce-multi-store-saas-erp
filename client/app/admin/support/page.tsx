import SupportChat from "@/features/admin/support/components/SupportChat";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Support Chat | Admin Dashboard",
    description: "Real-time support chat console",
};

export default function SupportChatPage() {
    return <SupportChat />;
}
