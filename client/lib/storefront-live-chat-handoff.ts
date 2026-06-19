export const STOREFRONT_OPEN_LIVE_CHAT_EVENT = "storefront:open-live-chat";

export interface StorefrontLiveChatHandoffDetail {
  /** Optional message to prefill in the live chat input */
  prefillMessage?: string;
}

export function openStorefrontLiveChat(detail?: StorefrontLiveChatHandoffDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<StorefrontLiveChatHandoffDetail>(STOREFRONT_OPEN_LIVE_CHAT_EVENT, {
      detail: detail ?? {},
    }),
  );
}

export function buildAssistantHandoffPrefill(lastUserMessage?: string): string {
  const trimmed = lastUserMessage?.trim();
  if (!trimmed) {
    return "Hi — I was using the shopping assistant and would like to speak with a support agent.";
  }
  return `Hi — I was using the shopping assistant and still need help. My question was: "${trimmed}"`;
}
