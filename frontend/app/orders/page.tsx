import { redirect } from "next/navigation";

// Orders now live inside the account dashboard.
export default function OrdersRedirect() {
  redirect("/profile/orders");
}
