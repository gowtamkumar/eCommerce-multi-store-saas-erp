import { getTenantId } from "./tenant";

export async function resolveTenantId(): Promise<string | null> {
    return getTenantId();
}
