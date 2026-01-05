import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Create Your Store | eCommerce SaaS",
    description: "Start your journey by creating your own store.",
};

export default function CreateStoreLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
                <div className="w-full max-w-5xl">
                    {children}
                </div>
            </div>
        </div>
    );
}
