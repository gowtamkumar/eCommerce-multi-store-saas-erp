export interface TenantDomain {
  id: string;
  hostname: string;
  isPrimary: boolean;
  status: "pending" | "verified" | "active";
  verificationToken?: string | null;
  verifiedAt?: string | null;
}

export interface Tenant {
  id: string;
  storeName: string;
  subdomain: string;
  domains: TenantDomain[];
  status: string;
  subscriptionPlan?: { name: string };
  subscriptionBillingCycle?: string;
  subscriptionStatus?: string;
  subscriptionStartsAt?: string;
  subscriptionEndsAt?: string;
  createdAt: string;
  sslEnabled?: boolean;
}

export interface TenantListProps {
  initialTenants: Tenant[];
}

export type StatusStyles = {
  bg: string;
  dot: string;
  icon: string;
  gradient: string;
};
