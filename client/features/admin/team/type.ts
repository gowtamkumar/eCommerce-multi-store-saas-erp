import { InvitationStatus } from "@/lib/enums/invitation-status.enum";
import { TeamStatus } from "@/lib/enums/team-status.enum";
import { UserRole } from "@/lib/enums/user-role.enum";

export interface TeamMember {
    id: string;
    name: string;
    username: string;
    email: string;
    role: UserRole;
    status: TeamStatus;
    image?: string;
    createdAt: string;
}

export interface Invitation {
    id: string;
    email: string;
    role: UserRole;
    status: InvitationStatus;
    createdAt: string;
    expiresAt: string;
}