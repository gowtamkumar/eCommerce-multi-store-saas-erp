import Order from "@/features/admin/order/components/Order";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Orders",
};

export default function page() {
  return (
    <Order />
  );
}