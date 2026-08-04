"use client";

import { useCartStore } from "@/store/useCartStore";
import { BoxIcon, LockIcon, TruckIcon } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export default function Checkout() {
  const { items, loadCart } = useCartStore();
  const [selectedOption, setSelectedOption] = useState("");
  const [terms, setTerms] = useState(false);
  const [isChecked, steIsChecked] = useState(false);

  const subTotal = items
    .reduce((sum, item) => {
      const priceNum = Number(item.price.replace(/[^0-9.]/g, ""));
      return sum + priceNum * item.quantity;
    }, 0)
    .toLocaleString();
  const Shipping = 20;
  return (
    <main className="h-fit pb-20 px-5 md:px-10 bg-surface pt-28">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:gap-12">
        <section className="w-full md:flex-1">
          <h2 className="text-2xl md:text-3xl font-serif tracking-tight mb-5 italic text-accent font-bold">
            Checkout
          </h2>
          <p className="font-semibold">Shipping Information</p>
          <div className="flex gap-10 my-5">
            <label className="cursor-pointer block">
              <input
                type="radio"
                name="shipping"
                value="delivery"
                checked={selectedOption === "delivery"}
                onChange={() => setSelectedOption("delivery")}
                className="peer hidden"
              />

              <div
                className="
      flex gap-3 h-[50px] px-5 items-center rounded-2xl
      border-2 border-border bg-card
      transition-all duration-300

      peer-checked:border-accent
      peer-checked:shadow-[0_0_0_3px_var(--ring)]
    "
              >
                <input
                  type="radio"
                  // name="shipping"
                  // value="delivery"
                  checked={selectedOption === "delivery"}
                  // onChange={() => setSelectedOption("delivery")}
                  // className="peer hidden"
                />
                <TruckIcon color="#666" />
                <p className="text-muted text-sm">Delivery</p>
              </div>
            </label>

            <label className="cursor-pointer block">
              <input
                type="radio"
                name="shipping"
                value="pickup"
                checked={selectedOption === "pickup"}
                onChange={() => setSelectedOption("pickup")}
                className="peer hidden"
              />

              <div
                className="
      flex gap-3 h-[50px] px-5 items-center rounded-2xl
      border-2 border-border bg-card
      transition-all duration-300

      peer-checked:border-accent
      peer-checked:shadow-[0_0_0_3px_var(--ring)]
    "
              >
                <input
                  type="radio"
                  // name="shipping"
                  // value="pickup"
                  checked={selectedOption === "pickup"}
                  // onChange={() => setSelectedOption("delivery")}
                  // className="peer hidden"
                />
                <BoxIcon color="#666" />
                <p className="text-muted text-sm">Pickup</p>
              </div>
            </label>
          </div>
          <form action="submit">
            <label>Full Name</label>
            <input
              type="text"
              className="w-full rounded-md border-border border bg-card px-5 text-sm mt-2 mb-5 h-12.5 outline-none focus:border-accent"
              placeholder="Enter Full Name"
            />
            <label>Email address</label>
            <input
              type="email"
              className="w-full rounded-md border-border border bg-card px-5 text-sm mt-2 mb-5 h-12.5 outline-none focus:border-accent"
              placeholder="Enter email address"
            />
            <label>Phone number</label>
            <input
              type="phone"
              className="w-full rounded-md border-border border bg-card px-5 text-sm mt-2 mb-5 h-12.5 outline-none focus:border-accent"
              placeholder="Enter phone number"
            />
            <label>Country</label>
            <input
              type="text"
              className="w-full rounded-md border-border border bg-card px-5 text-sm mt-2 mb-5 h-12.5 outline-none focus:border-accent"
              placeholder="Enter country"
            />
            <div className="flex md:flex-row flex-col md:gap-3 md:items-center ">
              <div className="flex flex-col">
                <label>City</label>

                <input
                  type="text"
                  className=" rounded-md border-border border bg-card px-5 text-sm mt-2 mb-5 h-12.5 outline-none focus:border-accent"
                  placeholder="Enter city"
                />
              </div>
              <div className="flex flex-col">
                <label>State</label>

                <input
                  type="text"
                  className=" rounded-md border-border border bg-card px-5 text-sm mt-2 mb-5 h-12.5 outline-none focus:border-accent"
                  placeholder="Enter state"
                />
              </div>
              <div className="flex flex-col">
                <label>Zip code</label>

                <input
                  type="text"
                  className=" rounded-md border-border border bg-card px-5 text-sm mt-2 mb-5 h-12.5 outline-none focus:border-accent"
                  placeholder="Enter zip code"
                />
              </div>
            </div>
          </form>
          <div className="flex gap-2 items-center">
            <input
              type="checkbox"
              checked={isChecked}
              onClick={() => setTerms(true)}
              onChange={(e) => {
                steIsChecked(e.target.checked);
                setTerms(!terms);
              }}
              className="w-5 h-5"
            />
            <p className="text-sm md:text-lg">
              I have read and agree to the Terms and Conditions
            </p>
          </div>
        </section>
        <section className="h-fit w-full rounded-2xl border border-border bg-card p-6 md:sticky md:top-28 md:w-[380px] md:shrink-0">
          <p className="font-semibold">Review your cart</p>
          <div className="flex-1 p-4 overflow-y-auto space-y-4 md:mt-5">
            {items.length === 0 ? (
              <p>Your cart is empty</p>
            ) : (
              items.map((item) => (
                <div key={item.cartId} className="flex gap-4  pb-4 relative">
                  <img
                    src={item.imageUrl}
                    className="w-30 h-30 object-cover rounded"
                    loading="lazy"
                  />
                  <div className="flex-1">
                    <p className="text-lg text-accent">{item.title}</p>
                    <p className="text-sm text-muted">{item.quantity}x</p>
                    <p className="text-sm text-muted">
                      {item.color} · {item.size}
                    </p>
                    <p className="text-accent">
                      {item.currency} {item.price}
                    </p>
                  </div>

                  {/* Delete single item */}
                </div>
              ))
            )}
          </div>
          {/* Price */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between text-sm text-muted font-semibold">
              <span>Sub Total:</span>
              <span>${subTotal}</span>
            </div>
            <div className="flex justify-between text-sm text-muted font-semibold">
              <span>Shipping:</span>
              <span>${Shipping}</span>
            </div>
            <div className="flex justify-between text-sm text-muted font-semibold">
              <span>Total:</span>
              <span>${Number(subTotal) + Number(Shipping)}</span>
            </div>
          </div>
          <div
            className={`h-12.5 w-full bg-accent-solid my-8 rounded-md text-white hover:bg-accent-strong transition-colors justify-center items-center flex ${
              terms === false
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer opacity-100"
            }`}
            // aria-disabled={terms === false}
          >
            <p>Pay Now</p>
          </div>
          <div className="flex gap-2">
            <LockIcon className="text-accent" />
            <p className="font-bold ">Secure Checkout - SSL Encrypted</p>
          </div>
          <p className="text-muted mt-5">
            {" "}
            Ensuring your financial and personal details are secured during
            every transaction
          </p>
        </section>
      </div>
    </main>
  );
}
