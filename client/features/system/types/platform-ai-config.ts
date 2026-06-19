export {
  AI_API_KEY_UNCHANGED,
  AI_PROVIDER_OPTIONS,
  DEFAULT_AI_CONFIG_FORM,
  type AiProviderId,
  type TenantAiConfigForm,
  type TenantAiConfigResponse,
} from "@/features/admin/setting/types/ai-config";

export type PlatformAiConfigForm = Omit<
  import("@/features/admin/setting/types/ai-config").TenantAiConfigForm,
  "storefront" | "embeddingModel" | "automation" | "sensitive"
>;

export type PlatformAiConfigResponse = Omit<
  import("@/features/admin/setting/types/ai-config").TenantAiConfigResponse,
  "storefront" | "automation" | "sensitive"
>;

export const DEFAULT_PLATFORM_AI_CONFIG_FORM: PlatformAiConfigForm = {
  enabled: false,
  provider: "openai",
  apiKey: "",
  baseUrl: "https://api.openai.com/v1",
  defaultModel: "gpt-4o-mini",
  apiVersion: "2024-08-01-preview",
  siteUrl: "",
  siteName: "",
  maxTokens: 1024,
  temperature: 0.7,
};
