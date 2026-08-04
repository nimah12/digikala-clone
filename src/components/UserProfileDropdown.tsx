"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  MessageSquare,
  LogOut,
  ChevronLeft,
  Star,
  Bell,
  ChevronDown,
} from "lucide-react";

interface UserProfileDropdownProps {
  user?: {
    name: string;
    phone?: string;
    isPlusUser?: boolean;
  } | null;
}

const menuItems = [
  { icon: ShoppingBag, label: "سفارش‌ها", href: "/profile/orders" },
  { icon: MapPin, label: "آدرس‌ها", href: "/profile/addresses" },
  { icon: Heart, label: "لیست‌ها", href: "/profile/wishlists" },
  {
    icon: MessageSquare,
    label: "دیدگاه‌ها و پرسش‌ها",
    href: "/profile/comments",
  },
  { icon: LogOut, label: "خروج از حساب کاربری", href: "/logout", isDanger: true },
];

export default function UserProfileDropdown({
  user,
}: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-2 text-sm text-gray-700 hover:text-red-500 transition-colors"
      >
        <User size={22} />
        <span>ورود | ثبت‌نام</span>
      </Link>
    );
  }

  return (
    <div className="relative" ref={dropdownRef} dir="rtl">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="flex items-center gap-1 text-sm text-gray-700 hover:text-red-500 transition-colors focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
        <User size={22} />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50"
          style={{ animation: "fadeSlideDown 0.18s ease" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="font-bold text-gray-800 text-sm">{user.name}</span>
          </div>

          {/* Plus Banner */}
          {!user.isPlusUser && (
            <Link
              href="/plus"
              className="flex items-center justify-between px-4 py-2.5 bg-amber-50 hover:bg-amber-100 transition-colors border-b border-amber-100"
            >
              <span className="text-xs font-bold text-amber-600 flex items-center gap-1">
                <Star size={12} fill="currentColor" />
                خرید اشتراک
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                پلاس
                <Star size={12} className="text-amber-400" fill="currentColor" />
              </span>
            </Link>
          )}

          {/* Menu Items */}
          <ul className="py-1">
            {menuItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center justify-between px-4 py-3 text-sm hover:bg-gray-50 transition-colors group ${
                    item.isDanger
                      ? "text-red-500 hover:bg-red-50"
                      : "text-gray-700"
                  }`}
                >
                  <item.icon
                    size={18}
                    className={`transition-colors ${
                      item.isDanger
                        ? "text-red-400"
                        : "text-gray-400 group-hover:text-red-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeSlideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
