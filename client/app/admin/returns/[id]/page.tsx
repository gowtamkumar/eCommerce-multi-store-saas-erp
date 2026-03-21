"use client";

import ReturnDetailsPage from "../../../../features/admin/return/components/ReturnDetailsPage";
import { use } from "react";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    return <ReturnDetailsPage params={Promise.resolve(resolvedParams)} />;
}
