
export interface LeadRowProps {
    msg: any;
    updatingStatus: string | null;
    onStatusUpdate: (id: string, newStatus: string) => void;
    getStatusColor: (status: string) => string;
}
