"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconArrowLeft,
  IconUsers,
  IconPhoto,
  IconTrash,
  IconLoader,
  IconCheck,
  IconAlertCircle,
} from "@tabler/icons-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { cn } from "@/lib/cn";

type EditContext = {
  params: Promise<{ slug: string }>;
};

type ApiCommunityDetail = {
  slug: string;
  name: string;
  member_count?: number;
  image_path?: string | null;
  image_url?: string | null;
  description?: string | null;
};

export default function AdminEditCommunityPage({ params }: EditContext) {
  const router = useRouter();
  const { slug } = use(params);
  const isNew = slug === "new";
  const pageTitle = isNew ? "Create Community" : "Edit Community";

  const [name, setName] = useState("");
  const [urlSlug, setUrlSlug] = useState("");
  const [memberCount, setMemberCount] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imagePreviewObjectUrl, setImagePreviewObjectUrl] = useState<string | null>(null);
  const [existingImagePath, setExistingImagePath] = useState("");

  useEffect(() => {
    document.title = pageTitle;
  }, [pageTitle]);

  useEffect(() => {
    return () => {
      if (imagePreviewObjectUrl) {
        URL.revokeObjectURL(imagePreviewObjectUrl);
      }
    };
  }, [imagePreviewObjectUrl]);

  useEffect(() => {
    if (isNew) return;

    async function loadCommunity() {
      try {
        const response = await fetch(`/api/puncak/communities/${encodeURIComponent(slug)}`, {
          cache: "no-store",
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("API load failed");
        const payload = await response.json();
        const detail: ApiCommunityDetail = payload.data ?? payload;
        setName(detail.name ?? "");
        setUrlSlug(detail.slug ?? "");
        setMemberCount(String(detail.member_count ?? ""));
        setExistingImagePath(detail.image_path ?? "");
        setImagePreviewUrl(detail.image_url ?? "");
        setDescription(detail.description ?? "");
      } catch (err) {
        console.warn("Unable to load community:", err);
        triggerToast("Community details could not be loaded.");
      }
    }

    loadCommunity();
  }, [slug, isNew]);

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  function handleImageFile(file: File) {
    if (!file.type.startsWith("image/")) {
      triggerToast("Image must be a JPG or PNG file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      triggerToast("Image must be 5MB or smaller.");
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageFile(file);
    setImagePreviewUrl(objectUrl);
    setImagePreviewObjectUrl((previousUrl) => {
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      return objectUrl;
    });
  }

  function handleImageInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) handleImageFile(file);
  }

  function handleImageDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  }

  async function handleSave() {
    setSaving(true);

    try {
      const payload = {
        name,
        slug: urlSlug || undefined,
        member_count: memberCount ? Number(memberCount) : null,
        description: description || null,
      };

      let body: BodyInit;
      let headers: Headers;
      let method: string;

      if (imageFile) {
        const formData = new FormData();
        if (!isNew) formData.set("_method", "PATCH");
        formData.set("name", name);
        if (urlSlug) formData.set("slug", urlSlug);
        if (memberCount) formData.set("member_count", memberCount);
        if (description) formData.set("description", description);
        formData.set("image", imageFile);
        body = formData;
        headers = new Headers({ Accept: "application/json" });
        method = "POST";
      } else {
        body = JSON.stringify({
          ...payload,
          image_path: existingImagePath || null,
        });
        headers = new Headers({ Accept: "application/json", "Content-Type": "application/json" });
        method = isNew ? "POST" : "PATCH";
      }

      const response = await fetch(
        isNew
          ? "/api/puncak/communities"
          : `/api/puncak/communities/${encodeURIComponent(slug)}`,
        { body, headers, method }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        if (data.errors) {
          console.warn("Validation errors:", data.errors);
          const messages = Object.values(data.errors).flat().join("; ");
          throw new Error(messages || data.message || "Unable to save community.");
        }
        throw new Error(data.message ?? "Unable to save community.");
      }

      setSaving(false);
      triggerToast("Community saved successfully.");
      setImageFile(null);

      if (data.data?.image_url) {
        setImagePreviewUrl(data.data.image_url);
        setImagePreviewObjectUrl((previousUrl) => {
          if (previousUrl) URL.revokeObjectURL(previousUrl);
          return null;
        });
      }

      if (data.data?.image_path) {
        setExistingImagePath(data.data.image_path);
      }

      if (isNew && data.data?.slug) {
        router.replace(`/admin/communities/${data.data.slug}/edit`);
      }
    } catch (err) {
      setSaving(false);
      triggerToast(err instanceof Error ? err.message : "Unable to save community.");
    }
  }

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this community? This action cannot be undone.")) return;

    try {
      const response = await fetch(`/api/puncak/communities/${encodeURIComponent(slug)}`, {
        headers: { Accept: "application/json" },
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message ?? "Unable to delete community.");
      }

      triggerToast("Community deleted successfully.");
      setTimeout(() => router.push("/admin/communities"), 1000);
    } catch (err) {
      triggerToast(err instanceof Error ? err.message : "Unable to delete community.");
    }
  }

  return (
    <AdminLayout activeTab="Communities" title={pageTitle}>
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
            href="/admin/communities"
            className="flex items-center gap-1.5 text-[12.5px] font-bold text-[#F37820] hover:text-[#C24B00] transition"
          >
            <IconArrowLeft className="w-4 h-4" />
            <span>Back to communities</span>
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
            <span>Save community</span>
          </button>
        </div>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left col — Community details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3 text-[#0F172A]">
              <IconUsers className="w-5 h-5 text-slate-400" />
              <h3 className="text-[16px] font-bold font-display">Community details</h3>
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
                  placeholder="e.g. Puncak Runners"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[12.5px] font-bold text-[#334155]" htmlFor="slug">
                  URL slug
                </label>
                <div className="flex items-stretch border border-[#E2E8F0] rounded-xl overflow-hidden bg-[#F8F7F5] focus-within:ring-1 focus-within:ring-[#F37820] focus-within:border-[#F37820] transition">
                  <span className="px-4 bg-slate-100/50 flex items-center text-[12.5px] text-[#647589] border-r border-[#E2E8F0] font-medium select-none">
                    puncaktravellers.id/communities/
                  </span>
                  <input
                    id="slug"
                    type="text"
                    value={urlSlug}
                    onChange={(e) => setUrlSlug(e.target.value)}
                    className="flex-1 bg-transparent px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none border-0"
                    placeholder="puncak-runners"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[12.5px] font-bold text-[#334155]" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition font-sans"
                  placeholder="Brief description of this community…"
                />
              </div>
            </div>
          </div>

          {/* Image card */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-2 border-b border-[#F1F5F9] pb-3 text-[#0F172A]">
              <IconPhoto className="w-5 h-5 text-slate-400" />
              <h3 className="text-[16px] font-bold font-display">Community image</h3>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-stretch">
              <div className="w-full sm:w-48 aspect-video sm:aspect-square bg-slate-100 rounded-xl border border-[#E2E8F0] flex items-center justify-center font-bold text-slate-400 text-xs uppercase overflow-hidden">
                {imagePreviewUrl ? (
                  <div
                    role="img"
                    aria-label={`${name || "Community"} image preview`}
                    className="h-full w-full object-cover"
                    style={{ background: `center / cover no-repeat url("${imagePreviewUrl}")` }}
                  />
                ) : (
                  "Image Preview"
                )}
              </div>
              <label
                htmlFor="community-image"
                onDragOver={(event) => event.preventDefault()}
                onDrop={handleImageDrop}
                className="flex-1 border border-dashed border-[#E2E8F0] rounded-xl bg-[#F8F7F5] flex flex-col justify-center items-center p-6 text-center cursor-pointer hover:bg-slate-50 transition"
              >
                <input
                  id="community-image"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleImageInputChange}
                  className="sr-only"
                />
                <IconPhoto className="w-7 h-7 text-[#647589] mb-2" />
                <div className="text-[12.5px] font-bold text-[#0F172A]">
                  Drop a new image or <span className="text-[#F37820] hover:underline">browse</span>
                </div>
                <div className="text-[11px] text-[#647589] mt-1">
                  JPG or PNG · up to 5MB
                </div>
                {imageFile ? (
                  <div className="mt-2 text-[11px] font-bold text-[#0D9488]">
                    {imageFile.name}
                  </div>
                ) : null}
              </label>
            </div>
          </div>
        </div>

        {/* Right col — Stats + Danger zone */}
        <div className="space-y-6">
          {/* Member count */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-[15px] font-bold text-[#0F172A] border-b border-[#F1F5F9] pb-2 font-display select-none">
              Member count
            </h3>
            <div className="space-y-1.5">
              <label className="text-[12.5px] font-bold text-[#334155]" htmlFor="member-count">
                Total members
              </label>
              <input
                id="member-count"
                type="number"
                value={memberCount}
                onChange={(e) => setMemberCount(e.target.value)}
                className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-xl px-4 py-2.5 text-[13.5px] text-[#0F172A] outline-none focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] transition"
                placeholder="e.g. 120"
              />
            </div>
          </div>

          {/* Danger zone */}
          {!isNew && (
            <div className="bg-white border border-red-100 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-[15px] font-bold text-red-600 border-b border-red-50 pb-2 font-display select-none">
                Danger zone
              </h3>
              <p className="text-[11.5px] text-[#647589] font-medium leading-relaxed select-none">
                Deleting a community unlinks it from all associated events and galleries.
              </p>
              <button
                onClick={handleDelete}
                className="w-full bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 px-4 py-2 rounded-full text-xs font-bold transition select-none flex items-center justify-center gap-1.5"
              >
                <IconTrash className="w-4 h-4" />
                <span>Delete community</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
