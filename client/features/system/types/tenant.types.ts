export interface Tenant {
  id: string;
  storeName: string;
  subdomain: string;
  customDomain?: string;
  status: string;
  subscriptionPlan?: { name: string };
  subscriptionBillingCycle?: string;
  subscriptionStatus?: string;
  subscriptionStartsAt?: string;
  subscriptionEndsAt?: string;
  createdAt: string;
  customDomainStatus?: string;
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
