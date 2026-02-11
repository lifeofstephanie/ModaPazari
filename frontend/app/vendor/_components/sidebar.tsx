"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Menu,
  Home,
  Package,
  ShoppingCart,
  BarChart,
  Settings,
  Clock,
  CheckCircle,
  HelpCircleIcon,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(true); // desktop expand/collapse
  const [mobileOpen, setMobileOpen] = useState(false); // mobile sidebar
  const [ordersOpen, setOrdersOpen] = useState(false); // accordion for orders

  const menuItems = [
    { name: "Dashboard", path: "/vendor/", icon: <Home size={20} /> },
    {
      name: "Orders",
      icon: <ShoppingCart size={20} />,
      subItems: [
        { name: "Pending", path: "/vendor/orders/pending" },
        { name: "Completed", path: "/vendor/orders/completed" },
      ],
    },
    { name: "Products", path: "/vendor/products", icon: <Package size={20} /> },
    {
      name: "Analytics",
      path: "/vendor/analytics",
      icon: <BarChart size={20} />,
    },
    {
      name: "Settings",
      path: "/vendor/settings",
      icon: <Settings size={20} />,
    },
    {
      name: "Help Center",
      path: "/vendor/helpCenter",
      icon: <HelpCircleIcon size={20} />,
    },
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-8 left-4 z-50 bg-white p-2 rounded-md shadow-md"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu size={18} />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40 md:hidden "
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          bg-linear-to-b from-[#e0ebf6] to-white shadow-lg p-5 shrink-0
          md:h-screen  md:fixed
          transition-all duration-300
          ${isOpen ? "w-64" : "w-23"}
          ${mobileOpen ? "fixed top-0 left-0 h-screen z-50 w-64" : "hidden md:block"}
        `}
      >
        {/* Collapse button (desktop only) */}
        <div className="flex justify-end mb-6 mt-5">
          <button
            className="hidden md:block p-1 rounded-full bg-[#7A2048] text-white"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <ChevronLeft /> : <ChevronRight />}
          </button>
        </div>

        <ul className="flex flex-col gap-2 overflow-y-auto max-h-[calc(h-screen-100px)]">
          {menuItems.map((item, idx) => (
            <li key={idx}>
              {item.subItems ? (
                <div>
                  <div
                    onClick={() => setOrdersOpen(!ordersOpen)}
                    className="flex justify-between items-center cursor-pointer p-2 hover:bg-[#ccc]/20 rounded"
                  >
                    {/* Icon always visible */}
                    <div className="flex items-center gap-2">
                      {item.icon}
                      <span className={isOpen ? "block" : "hidden"}>
                        {item.name}
                      </span>
                    </div>
                    <span>
                      {ordersOpen ? <ChevronDown /> : <ChevronRight />}
                    </span>
                  </div>

                  {ordersOpen && (
                    <ul
                      className={`${!isOpen ? "pl-2" : "pl-5"} flex flex-col gap-1`}
                    >
                      {ordersOpen && (
                        <ul className="pl-0 flex flex-col gap-1">
                          {item.subItems.map((sub, i) => {
                            let icon;
                            if (sub.name === "Pending")
                              icon = <Clock size={16} />;
                            if (sub.name === "Completed")
                              icon = <CheckCircle size={16} />;

                            return (
                              <li key={i}>
                                <Link
                                  href={sub.path}
                                  className="flex items-center gap-2 p-2 hover:bg-[#ccc]/20 rounded"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  {icon}
                                  <span className={isOpen ? "block" : "hidden"}>
                                    {sub.name}
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  href={item.path}
                  className="flex items-center gap-2 p-2 hover:bg-[#ccc]/20 rounded cursor-pointer"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.icon}
                  <span className={isOpen ? "block" : "hidden"}>
                    {item.name}
                  </span>
                </Link>
              )}
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
}
