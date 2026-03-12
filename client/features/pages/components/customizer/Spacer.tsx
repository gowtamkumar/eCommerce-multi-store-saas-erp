"use client";

import { SpacerSettings } from "@/types/customizer";

export default function Spacer({ settings }: { settings: SpacerSettings }) {
    const { height = 40 } = settings || {};

    return (
        <div style={{ height: `${height}px` }} className="w-full min-w-full" />
    );
}
