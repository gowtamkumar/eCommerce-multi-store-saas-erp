import Login from "@/features/storefront/auth/components/Login"
import { Suspense } from "react"

function page() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        }>
            <Login />
        </Suspense>
    )
}

export default page