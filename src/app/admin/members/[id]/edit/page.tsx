"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconUserCheck,
  IconMapPin,
  IconTrash,
  IconLoader,
  IconCheck,
} from "@tabler/icons-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { cn } from "@/lib/cn";

type EditContext = {
  params: Promise<{ id: string }>;
};

export default function AdminEditMemberPage({ params }: EditContext) {
  const router = useRouter();
  const { id } = use(params);
  const isNew = id === "new";
  const pageTitle = isNew ? "Create Member" : "Edit Member";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [location, setLocation] = useState("");
  const [crew, setCrew] = useState("");
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  useEffect(() => {
    if (isNew) return;

    async function loadMember() {
      try {
        const response = await fetch(`/api/puncak/members/${encodeURIComponent(id)}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("API load failed");
        const payload = await response.json();
        const detail = payload.data ?? payload;
        setName(detail.name ?? "");
        setEmail(detail.email ?? "");
        setRole(detail.role === "admin" ? "admin" : "member");
        setStatus(detail.status === "inactive" ? "inactive" : "active");
        setLocation(detail.location ?? "");
        setCrew(detail.crew ?? "");
      } catch (err) {
        console.warn("Unable to load member:", err);
        triggerToast("Member details could not be loaded.");
      }
    }

    loadMember();
  }, [id, isNew]);

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload: Record<string, string | null> = {
        name,
        email,
        role,
        status,
        location: location || null,
        crew: crew || null,
      };
      if (password) {
        payload.password = password;
      }
      const response = await fetch(
        isNew ? "/api/puncak/members" : `/api/puncak/members/${encodeURIComponent(id)}`,
        {
          body: JSON.stringify(payload),
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          method: isNew ? "POST" : "PATCH",
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message ?? "Unable to save member.");
      setSaving(false);
      setPassword("");
      triggerToast("Member saved successfully.");
      if (isNew && data.data?.id) {
        router.replace(`/admin/members/${data.data.id}/edit`);
      }
    } catch (err) {
      setSaving(false);
      triggerToast(err instanceof Error ? err.message : "Unable to save member.");
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this member? This action cannot be undone.")) return;
    try {
      const response = await fetch(`/api/puncak/members/${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json" },
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message ?? "Unable to delete member.");
      }
      triggerToast("Member deleted successfully.");
      setTimeout(() => router.push("/admin/members"), 1000);
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : "Unable to delete member.");
    }
  }

  return (
    <AdminLayout activeTab="Members" title={pageTitle}>
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 z-50 animate-bounce">
          <IconCheck className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sub-header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <Link
            href="/admin/members"
            className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#F37820] hover:text-[#C24B00] transition"
          >
            <IconArrowLeft className="w-4 h-4" />
            <span>Back to members</span>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-display mt-2">
            {pageTitle}
          </h1>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-[#F37820] text-white hover:bg-[#C24B00] px-5 py-2.5 rounded-full text-[13px] font-bold shadow-sm shadow-orange-500/20 transition disabled:opacity-50 select-none"
          >
            {saving ? (
              <IconLoader className="w-4 h-4 animate-spin" />
            ) : (
              <IconCheck className="w-4 h-4" />
            )}
            <span>Save member</span>
          </button>
        </div>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col — Member details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account details card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3 text-[#0F172A]">
              <IconUserCheck className="w-5 h-5 text-slate-400" />
              <h3 className="text-[16px] font-bold font-display">Account details</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12.5px] font-bold text-[#334155]" htmlFor="name">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition"
                  placeholder="e.g. Sari Dewi"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12.5px] font-bold text-[#334155]" htmlFor="email">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition"
                  placeholder="e.g. sari@puncak.id"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12.5px] font-bold text-[#334155]" htmlFor="password">
                  {isNew ? "Password" : "New password"}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition"
                  placeholder={isNew ? "Set a password…" : "Leave blank to keep current"}
                />
              </div>
            </div>
          </div>

          {/* Profile card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3 text-[#0F172A]">
              <IconMapPin className="w-5 h-5 text-slate-400" />
              <h3 className="text-[16px] font-bold font-display">Profile</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12.5px] font-bold text-[#334155]" htmlFor="location">
                  Location
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition"
                  placeholder="e.g. Bogor, West Java"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12.5px] font-bold text-[#334155]" htmlFor="crew">
                  Crew
                </label>
                <input
                  id="crew"
                  type="text"
                  value={crew}
                  onChange={(e) => setCrew(e.target.value)}
                  className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition"
                  placeholder="e.g. Puncak Runners"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right col — Role, Status, Danger zone */}
        <div className="space-y-6">
          {/* Role selection */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-[15px] font-bold text-[#0F172A] border-b border-[#F1F5F9] pb-2 font-display select-none">
              Role
            </h3>
            <div className="space-y-2">
              {[
                { value: "member", label: "Member", desc: "Standard access and bookings" },
                { value: "admin", label: "Admin", desc: "Full CMS access" },
              ].map((opt) => {
                const isSel = role === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => setRole(opt.value as "member" | "admin")}
                    className={cn(
                      "flex gap-3.5 items-start p-3 border rounded-xl cursor-pointer transition select-none",
                      isSel
                        ? "bg-[#F8F7F5] border-[#F37820]"
                        : "bg-white border-[#E2E8F0] hover:bg-slate-50"
                    )}
                  >
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center mt-0.5",
                        isSel ? "border-[#F37820]" : "border-slate-300"
                      )}
                    >
                      {isSel && <span className="w-2.5 h-2.5 bg-[#F37820] rounded-full" />}
                    </span>
                    <div className="leading-tight">
                      <div className="text-[13px] font-bold text-[#0F172A]">{opt.label}</div>
                      <div className="text-[11px] text-[#647589] mt-0.5">{opt.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status selection */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-[15px] font-bold text-[#0F172A] border-b border-[#F1F5F9] pb-2 font-display select-none">
              Account status
            </h3>
            <div className="space-y-2">
              {[
                { value: "active", label: "Active", desc: "Can log in and book events" },
                { value: "inactive", label: "Inactive", desc: "Account suspended" },
              ].map((opt) => {
                const isSel = status === opt.value;
                return (
                  <div
                    key={opt.value}
                    onClick={() => setStatus(opt.value as "active" | "inactive")}
                    className={cn(
                      "flex gap-3.5 items-start p-3 border rounded-xl cursor-pointer transition select-none",
                      isSel
                        ? "bg-[#F8F7F5] border-[#F37820]"
                        : "bg-white border-[#E2E8F0] hover:bg-slate-50"
                    )}
                  >
                    <span
                      className={cn(
                        "w-4 h-4 rounded-full border flex items-center justify-center mt-0.5",
                        isSel ? "border-[#F37820]" : "border-slate-300"
                      )}
                    >
                      {isSel && <span className="w-2.5 h-2.5 bg-[#F37820] rounded-full" />}
                    </span>
                    <div className="leading-tight">
                      <div className="text-[13px] font-bold text-[#0F172A]">{opt.label}</div>
                      <div className="text-[11px] text-[#647589] mt-0.5">{opt.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Danger zone */}
          {!isNew && (
            <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-[15px] font-bold text-red-600 border-b border-red-50 pb-2 font-display select-none">
                Danger zone
              </h3>
              <p className="text-[11.5px] text-[#647589] font-medium leading-relaxed select-none">
                Deleting a member removes their profile and login access. Bookings are kept for records.
              </p>
              <button
                onClick={handleDelete}
                className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 px-4 py-2 rounded-full text-xs font-bold transition select-none flex items-center justify-center gap-1.5"
              >
                <IconTrash className="w-4 h-4" />
                <span>Delete member</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
