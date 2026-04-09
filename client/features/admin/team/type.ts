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


export interface MemberRowProps {
    member: TeamMember;
    activeDropdown: string | null;
    setActiveDropdown: (id: string | null) => void;
    handleRoleChange: (memberId: string, role: UserRole) => void;
    handleRemoveMember: (memberId: string) => void;
    roleIcons: Record<UserRole, React.ReactElement>;
    roleColors: Record<UserRole, string>;
    getInitials: (name: string) => string;
}

export interface MemberTableProps {
    members: TeamMember[];
    activeDropdown: string | null;
    setActiveDropdown: (id: string | null) => void;
    handleRoleChange: (memberId: string, role: UserRole) => void;
    handleRemoveMember: (memberId: string) => void;
    roleIcons: Record<UserRole, React.ReactElement>;
    roleColors: Record<UserRole, string>;
    getInitials: (name: string) => string;
}

export interface InvitationTableProps {
    invitations: Invitation[];
    handleRevokeInvitation: (id: string) => void;
    roleIcons: Record<UserRole, React.ReactElement>;
    roleColors: Record<UserRole, string>;
}

export interface InviteStaffModalProps {
    onClose: () => void;
    onInvited: () => void;
}