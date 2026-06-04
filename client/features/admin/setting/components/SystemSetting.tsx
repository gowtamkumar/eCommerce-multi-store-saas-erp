"use client";

import ConfirmModal from "@/components/shared/ConfirmModal";
import { useSystemMaintenance } from "../hooks/useSystemMaintenance";
import { CacheMaintenanceCard } from "./system/CacheMaintenanceCard";
import { SystemHeader } from "./system/SystemHeader";

export function SystemSetting() {
    const system = useSystemMaintenance();
    
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <SystemHeader />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CacheMaintenanceCard clearing={system.clearing} onConfirmClear={() => system.setShowConfirm(true)} />
            </div>

            <ConfirmModal
                isOpen={system.showConfirm}
                onClose={() => system.setShowConfirm(false)}
                onConfirm={system.clearCache}
                title="Clear Store Cache?"
                message="Are you sure you want to clear the store cache? This will clear all cached catalogs, settings, and pages. While the cache is being rebuilt, your store response times might temporarily slow down."
                confirmText={system.clearing ? "Clearing..." : "Clear Cache"}
                isDangerous
            />
        </div>
    );
}
