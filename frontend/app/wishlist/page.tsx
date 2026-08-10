import { redirect } from "next/navigation";

// Wishlist now lives inside the account dashboard.
export default function WishlistRedirect() {
  redirect("/profile/wishlist");
}
