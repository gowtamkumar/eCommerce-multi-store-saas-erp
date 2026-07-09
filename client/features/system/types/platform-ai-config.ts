export {
  AI_API_KEY_UNCHANGED,
  AI_PROVIDER_OPTIONS,
  DEFAULT_AI_CONFIG_FORM,
  type AiProviderId,
  type StoreAiConfigForm,
  type StoreAiConfigResponse,
} from "@/features/admin/setting/types/ai-config";

export type PlatformAiConfigForm = Omit<
  import("@/features/admin/setting/types/ai-config").StoreAiConfigForm,
  "storefront" | "embeddingModel" | "automation" | "sensitive" | "apiVersion"
>;

export type PlatformAiConfigResponse = Omit<
  import("@/features/admin/setting/types/ai-config").StoreAiConfigResponse,
  "storefront" | "automation" | "sensitive" | "apiVersion"
>;

export const DEFAULT_PLATFORM_AI_CONFIG_FORM: PlatformAiConfigForm = {
  enabled: false,
  provider: "openai",
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  defaultModel: "gpt-4o-mini",
  siteUrl: "",
  siteName: "",
  maxTokens: 1024,
  temperature: 0.7,
};
