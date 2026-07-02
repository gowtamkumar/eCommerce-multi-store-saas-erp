export type DomainStatus = "active" | "pending" | "failed" | "inactive" | string;

export interface StoreDomain {
  id: string;
  hostname: string;
  isPrimary: boolean;
  status: DomainStatus;
  verificationToken?: string | null;
  verifiedAt?: string | Date | null;
  createdAt?: string | Date | null;
}

export interface StoreInfo {
  id: string;
  storeName: string;
  subdomain: string;
  domains?: StoreDomain[];
  primaryCustomDomain?: string | null;
  sslEnabled?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
