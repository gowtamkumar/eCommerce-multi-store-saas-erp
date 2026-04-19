export enum CampaignType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export enum CampaignLogStatus {
  PENDING = 'pending',
  SENT = 'sent',
  FAILED = 'failed',
  OPENED = 'opened',
  CLICKED = 'clicked',
}

export interface CampaignMessage {
  id: string;
  campaignId: string;
  subject?: string;
  htmlContent?: string;
  text?: string;
  title?: string;
  body?: string;
  imageUrl?: string;
  createdAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  scheduleTime?: string;
  totalAudience: number;
  sentCount: number;
  failedCount: number;
  createdAt: string;
  updatedAt: string;
  messages?: CampaignMessage[];
}

export interface CampaignLog {
  id: string;
  campaignId: string;
  userId: string;
  status: CampaignLogStatus;
  sentAt?: string;
  error?: string;
  metadata?: any;
  recipient?: {
    name: string;
    email?: string;
    phone?: string;
  };
}
