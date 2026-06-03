"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconMapPin,
  IconTrash,
  IconLoader,
  IconCheck,
} from "@tabler/icons-react";
import { AdminLayout } from "@/components/admin/admin-layout";

type EditContext = {
  params: Promise<{ id: string }>;
};

export default function AdminEditPlacePage({ params }: EditContext) {
  const router = useRouter();
  const { id } = use(params);
  const isNew = id === "new";
  const pageTitle = isNew ? "Create Place" : "Edit Place";

  const [name, setName] = useState("");
  const [communityId, setCommunityId] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  useEffect(() => {
    if (isNew) return;

    async function loadPlace() {
      try {
        const response = await fetch(`/api/puncak/places/${encodeURIComponent(id)}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("API load failed");
        const payload = await response.json();
        const detail = payload.data ?? payload;
        setName(detail.name ?? "");
        setCommunityId(String(detail.community_id ?? ""));
        setLat(String(detail.lat ?? ""));
        setLng(String(detail.lng ?? ""));
        setDescription(detail.description ?? "");
      } catch (err) {
        console.warn("Unable to load place:", err);
        triggerToast("Place details could not be loaded.");
      }
    }

    loadPlace();
  }, [id, isNew]);

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = {
        name,
        community_id: communityId ? Number(communityId) : null,
        lat: lat ? Number(lat) : null,
        lng: lng ? Number(lng) : null,
        description: description || null,
      };
      const response = await fetch(
        isNew ? "/api/puncak/places" : `/api/puncak/places/${encodeURIComponent(id)}`,
        {
          body: JSON.stringify(payload),
          headers: { Accept: "application/json", "Content-Type": "application/json" },
          method: isNew ? "POST" : "PATCH",
        }
      );
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message ?? "Unable to save place.");
      setSaving(false);
      triggerToast("Place saved successfully.");
      if (isNew && data.data?.id) {
        router.replace(`/admin/places/${data.data.id}/edit`);
      }
    } catch (err) {
      setSaving(false);
      triggerToast(err instanceof Error ? err.message : "Unable to save place.");
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this place? This action cannot be undone.")) return;
    try {
      const response = await fetch(`/api/puncak/places/${encodeURIComponent(id)}`, {
        headers: { Accept: "application/json" },
        method: "DELETE",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message ?? "Unable to delete place.");
      }
      triggerToast("Place deleted successfully.");
      setTimeout(() => router.push("/admin/places"), 1000);
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : "Unable to delete place.");
    }
  }

  return (
    <AdminLayout activeTab="Places" title={pageTitle}>
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
            href="/admin/places"
            className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#F37820] hover:text-[#C24B00] transition"
          >
            <IconArrowLeft className="w-4 h-4" />
            <span>Back to places</span>
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
            <span>Save place</span>
          </button>
        </div>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col — Place details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3 text-[#0F172A]">
              <IconMapPin className="w-5 h-5 text-slate-400" />
              <h3 className="text-[16px] font-bold font-display">Place details</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[12.5px] font-bold text-[#334155]" htmlFor="name">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition"
                  placeholder="e.g. Gunung Pangrango, Bogor"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12.5px] font-bold text-[#334155]" htmlFor="community-id">
                  Community ID
                </label>
                <input
                  id="community-id"
                  type="number"
                  value={communityId}
                  onChange={(e) => setCommunityId(e.target.value)}
                  className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition"
                  placeholder="e.g. 1"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[12.5px] font-bold text-[#334155]" htmlFor="lat">
                    Latitude
                  </label>
                  <input
                    id="lat"
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition"
                    placeholder="e.g. -6.7739"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[12.5px] font-bold text-[#334155]" htmlFor="lng">
                    Longitude
                  </label>
                  <input
                    id="lng"
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition"
                    placeholder="e.g. 106.9783"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12.5px] font-bold text-[#334155]" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition font-sans"
                  placeholder="Brief description of this place…"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right col — Danger zone */}
        <div className="space-y-6">
          {!isNew && (
            <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-[15px] font-bold text-red-600 border-b border-red-50 pb-2 font-display select-none">
                Danger zone
              </h3>
              <p className="text-[11.5px] text-[#647589] font-medium leading-relaxed select-none">
                Deleting a place removes it from all associated events and route references.
              </p>
              <button
                onClick={handleDelete}
                className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 px-4 py-2 rounded-full text-xs font-bold transition select-none flex items-center justify-center gap-1.5"
              >
                <IconTrash className="w-4 h-4" />
                <span>Delete place</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
