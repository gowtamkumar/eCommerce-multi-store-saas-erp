export enum RoleScopeType {
    GLOBAL = 'global',
    BRANCH = 'branch',
    WAREHOUSE = 'warehouse',
}

export interface Permission {
    id: string;
    code: string;
    name: string;
    description: string;
    module: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    isSystemRole: boolean;
    scopeType: RoleScopeType;
    permissions: Permission[];
}
