"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconLayoutDashboard,
  IconCalendarEvent,
  IconPhoto,
  IconTicket,
  IconUsers,
  IconMapPin,
  IconChevronDown,
  IconLogout,
  IconUserCheck,
} from "@tabler/icons-react";
import Logo from "@/components/logo";
import { cn } from "@/lib/cn";
import { readStoredAuth } from "@/lib/client-auth";

type AdminLayoutProps = {
  children: React.ReactNode;
  activeTab?: string;
  title: string;
};

export function AdminLayout({ children, activeTab, title }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profile] = useState(() => readStoredAuth());
  const [dropdownOpen, setDropdownOpen] = useState(false);

  async function handleLogout() {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem("puncak.auth");
    }
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => null);
    router.push("/login");
  }

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number | string | null;
  disabled?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

  // Sidebar navigation structure
  const navigationGroups: NavGroup[] = [
    {
      label: "Manage",
      items: [
        {
          label: "Dashboard",
          href: "/admin",
          icon: IconLayoutDashboard,
          count: null,
        },
        {
          label: "Events",
          href: "/admin/events",
          icon: IconCalendarEvent,
          count: 24,
        },
        {
          label: "Galleries",
          href: "/admin/galleries",
          icon: IconPhoto,
          count: 312,
        },
        {
          label: "Bookings",
          href: "/admin/bookings",
          icon: IconTicket,
          count: "1,284",
        },
      ],
    },
    {
      label: "Directory",
      items: [
        {
          label: "Communities",
          href: "/admin/communities",
          icon: IconUsers,
          count: null,
        },
        {
          label: "Places",
          href: "/admin/places",
          icon: IconMapPin,
          count: null,
        },
        {
          label: "Members",
          href: "/admin/members",
          icon: IconUserCheck,
          count: null,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen flex bg-[#F8F7F5] font-sans antialiased text-[#0F172A]">
      {/* Sidebar Rail */}
      <aside className="w-64 bg-[#0F172A] text-white flex flex-col flex-shrink-0 sticky top-0 h-screen select-none z-30">
        {/* Brand Row */}
        <div className="flex items-center gap-3 px-6 pt-7 pb-5">
          <Link href="/" className="transition hover:opacity-90">
            <Logo className="h-6 w-auto filter invert brightness-200" />
          </Link>
          <span className="text-[11px] font-bold uppercase tracking-wider bg-white/15 px-2 py-0.5 rounded text-white/90">
            Admin
          </span>
        </div>

        {/* Scrollable Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {navigationGroups.map((group) => (
            <div key={group.label} className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-widest text-[#647589] px-3 mb-2">
                {group.label}
              </div>
              <nav className="space-y-0.5" aria-label={`${group.label} menu`}>
                {group.items.map((item) => {
                  const isActive = activeTab 
                    ? activeTab.toLowerCase() === item.label.toLowerCase()
                    : pathname === item.href;

                  if (item.disabled) {
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition duration-150 relative opacity-50 cursor-not-allowed text-[#94A3B8]"
                      >
                        <item.icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.label}</span>
                        {item.count !== null && (
                          <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-[#94A3B8]">
                            {item.count}
                          </span>
                        )}
                      </div>
                    );
                  }

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium transition duration-150 relative",
                        isActive
                          ? "bg-white/8 text-white font-semibold"
                          : "text-[#94A3B8] hover:bg-white/4 hover:text-white"
                      )}
                    >
                      <item.icon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                      {item.count !== null && (
                        <span className={cn(
                          "ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full",
                          isActive ? "bg-white/15 text-white" : "bg-white/5 text-[#94A3B8]"
                        )}>
                          {item.count}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* User Rail Section at Bottom */}
        <div className="p-4 border-t border-white/8 flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center font-bold text-slate-900 overflow-hidden text-sm uppercase">
              {profile?.name?.slice(0, 2) || "SD"}
            </div>
            <div className="overflow-hidden">
              <div className="text-[13px] font-semibold text-white leading-tight truncate">
                {profile?.name || "Sari Dewi"}
              </div>
              <div className="text-[11px] text-[#647589] leading-tight truncate">
                Administrator
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg text-[#647589] hover:text-red-400 hover:bg-white/5 transition"
            title="Log out"
          >
            <IconLogout className="w-4.5 h-4.5" />
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Topbar Header */}
        <header className="h-16 border-b border-[#E2E8F0] bg-white flex justify-between items-center px-8 sticky top-0 z-20 shadow-sm">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-[13px] text-[#647589]">
            <span className="font-semibold text-[#0F172A]">Admin CMS</span>
            <span className="text-slate-300">/</span>
            <span className="text-[#647589]">{title}</span>
          </div>

          {/* Right Side Options */}
          <div className="flex items-center gap-6">
            {/* Global search, notifications, and inbox controls intentionally hidden per CMS revision request. */}

            {/* User Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 text-left hover:opacity-85 transition focus:outline-none"
              >
                <div className="w-9 h-9 rounded-full bg-teal-600 flex items-center justify-center font-bold text-white overflow-hidden text-sm uppercase">
                  {profile?.name?.slice(0, 2) || "SD"}
                </div>
                <div className="hidden md:block leading-tight">
                  <div className="text-[13px] font-semibold text-[#0F172A]">
                    {profile?.name || "Sari Dewi"}
                  </div>
                  <div className="text-[11px] text-[#647589]">
                    {profile?.email || "admin@puncak.id"}
                  </div>
                </div>
                <IconChevronDown className="w-4 h-4 text-[#647589]" />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-1.5 z-50 text-[13.5px]">
                    <Link
                      href="/account"
                      className="flex items-center gap-2.5 px-4 py-2 text-[#0F172A] hover:bg-[#F8F7F5] transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Member Dashboard
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-red-600 hover:bg-[#F8F7F5] transition"
                    >
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-8 overflow-y-auto max-w-[1240px] w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}
