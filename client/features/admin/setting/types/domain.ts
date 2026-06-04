export type DomainStatus = "active" | "pending" | "failed" | "inactive" | string;

export interface TenantDomain {
  id: string;
  hostname: string;
  isPrimary: boolean;
  status: DomainStatus;
  verificationToken?: string | null;
  verifiedAt?: string | Date | null;
  createdAt?: string | Date | null;
}

export interface TenantInfo {
  id: string;
  storeName: string;
  subdomain: string;
  domains?: TenantDomain[];
  primaryCustomDomain?: string | null;
  sslEnabled?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
