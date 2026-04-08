import Orders from "@/features/admin/order/components/Orders";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
};

export default function page() {
  return (
    <Orders />
  );
}