export interface StoreDomain {
  id: string;
  hostname: string;
  isPrimary: boolean;
  status: "pending" | "verified" | "active";
  verificationToken?: string | null;
  verifiedAt?: string | null;
}

export interface Store {
  id: string;
  storeName: string;
  subdomain: string;
  domains: StoreDomain[];
  status: string;
  subscriptionPlan?: { name: string };
  subscriptionBillingCycle?: string;
  subscriptionStatus?: string;
  subscriptionStartsAt?: string;
  subscriptionEndsAt?: string;
  createdAt: string;
  sslEnabled?: boolean;
  primaryCustomDomain?: string | null;
}

export interface StoreListProps {
  initialStores: Store[];
}

export type StatusStyles = {
  bg: string;
  dot: string;
  icon: string;
  gradient: string;
};
