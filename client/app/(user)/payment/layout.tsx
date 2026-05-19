import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function PaymentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-12 bg-slate-50 dark:bg-slate-900">
        {children}
      </main>
      <Footer />
    </div>
  );
}
