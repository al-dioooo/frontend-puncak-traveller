"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useEffect, useState, useMemo, useRef } from "react";
import {
  IconSearch,
  IconUpload,
  IconEdit,
  IconTrash,
  IconDownload,
  IconLink,
  IconCheck,
  IconLoader,
} from "@tabler/icons-react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { cn } from "@/lib/cn";

interface ApiPhoto {
  id?: string;
  title?: string;
  event?: string;
  category?: "trail-run" | "camping" | "walk" | "hike" | "wellness";
  imageUrl?: string | null;
  caption?: string;
}

type DisplayableApiPhoto = ApiPhoto & {
  id: string;
  imageUrl: string;
};

type GalleryPhoto = {
  id: string;
  title: string;
  event: string;
  category: "trail-run" | "camping" | "walk" | "hike" | "wellness";
  image: string;
  selected?: boolean;
};

export default function AdminGalleriesPage() {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);
  const selectedCategory: string = "All";
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  
  // Upload states
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPhotos() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/puncak/galleries?per_page=15&page=${page}`, {
          headers: { Accept: "application/json" },
        });

        if (!response.ok) throw new Error("API failed");

        const payload = await response.json();
        const apiPhotos = Array.isArray(payload.data)
          ? payload.data
              .filter(hasDisplayablePhoto)
              .map((item: DisplayableApiPhoto) => ({
                id: item.id,
                title: item.caption || item.title || "Untitled image",
                event: item.event || "Unlinked Event",
                category: item.category || "trail-run",
                image: item.imageUrl,
              }))
          : [];
        setPhotos(apiPhotos);
        setTotal(payload.meta?.total ?? apiPhotos.length);
      } catch (err) {
        console.warn("Unable to load photos from API:", err);
        setPhotos([]);
        setTotal(0);
        setError("Gallery photos could not be loaded.");
      } finally {
        setLoading(false);
      }
    }

    loadPhotos();
  }, [page]);

  function triggerToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  function hasDisplayablePhoto(item: ApiPhoto): item is DisplayableApiPhoto {
    return Boolean(item.id && item.imageUrl);
  }

  // Filtered photos lists
  const filteredPhotos = useMemo(() => {
    return photos.filter((p) => {
      const matchesCategory =
        selectedCategory === "All" ||
        (selectedCategory === "Trail runs" && p.category === "trail-run") ||
        (selectedCategory === "Camping" && p.category === "camping") ||
        (selectedCategory === "Walks" && p.category === "walk");

      const query = searchQuery.toLowerCase();
      const matchesQuery =
        p.title.toLowerCase().includes(query) ||
        p.event.toLowerCase().includes(query);

      return matchesCategory && matchesQuery;
    });
  }, [photos, selectedCategory, searchQuery]);

  const selectedCount = Object.keys(selectedItems).length;

  const toggleSelectPhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItems((prev) => {
      const copy = { ...prev };
      if (copy[id]) {
        delete copy[id];
      } else {
        copy[id] = true;
      }
      return copy;
    });
  };

  const handleDeselectAll = () => {
    setSelectedItems({});
  };

  const handleDeleteSelected = async () => {
    const idsToDelete = Object.keys(selectedItems);

    try {
      const response = await fetch("/api/puncak/galleries/bulk-delete", {
        body: JSON.stringify({ ids: idsToDelete }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to delete selected photos.");
      }

      setPhotos((prev) => prev.filter((p) => !selectedItems[p.id]));
      setSelectedItems({});
      triggerToast(`Deleted ${payload.data?.deleted ?? idsToDelete.length} photos successfully.`);
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : "Unable to delete selected photos.");
    }
  };

  const handleDownloadSelected = () => {
    const [firstId] = Object.keys(selectedItems);
    if (!firstId) return;
    window.location.href = `/api/puncak/galleries/${encodeURIComponent(firstId)}/download`;
    triggerToast("Starting image download.");
    setSelectedItems({});
  };

  const handleEditCaption = async (photo: GalleryPhoto) => {
    const nextCaption = window.prompt("Edit caption", photo.title);
    if (!nextCaption || nextCaption === photo.title) {
      return;
    }

    try {
      const response = await fetch(`/api/puncak/galleries/${encodeURIComponent(photo.id)}`, {
        body: JSON.stringify({
          caption: nextCaption,
          title: nextCaption,
        }),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to update caption.");
      }

      setPhotos((prev) =>
        prev.map((item) => (item.id === photo.id ? { ...item, title: nextCaption } : item)),
      );
      triggerToast("Caption updated successfully.");
    } catch (editError) {
      triggerToast(editError instanceof Error ? editError.message : "Unable to update caption.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    uploadFile(files[0]);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    const progress = window.setInterval(() => {
      setUploadProgress((prev) => Math.min(prev + 15, 90));
    }, 120);

    try {
      const formData = new FormData();
      formData.set("image", file);
      formData.set("title", file.name.replace(/\.[^.]+$/, "") || "Uploaded Photo");
      formData.set("category", selectedCategory === "Camping" ? "camping" : selectedCategory === "Walks" ? "walk" : "trail-run");

      const response = await fetch("/api/puncak/galleries", {
        body: formData,
        headers: { Accept: "application/json" },
        method: "POST",
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.message ?? "Unable to upload photo.");
      }

      const uploaded = payload.data as ApiPhoto;
      if (!hasDisplayablePhoto(uploaded)) {
        throw new Error("Upload succeeded but the API did not return a displayable image.");
      }

      const newPhoto: GalleryPhoto = {
        id: uploaded.id,
        title: uploaded.title || file.name,
        event: uploaded.event || "Unlinked Event",
        category: uploaded.category || "trail-run",
        image: uploaded.imageUrl,
      };

      setUploadProgress(100);
      setPhotos((prev) => [newPhoto, ...prev]);
      triggerToast("Photos uploaded successfully.");
    } catch (error) {
      triggerToast(error instanceof Error ? error.message : "Unable to upload photo.");
    } finally {
      window.clearInterval(progress);
      setUploading(false);
    }
  };

  return (
    <AdminLayout activeTab="Galleries" title="Galleries">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold shadow-xl flex items-center gap-2 z-50 animate-bounce">
          <IconCheck className="w-4 h-4 text-teal-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden file input for upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Page Heading & Main Options */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A] font-display">
            Galleries
          </h1>
          <p className="text-[#647589] text-[14px] mt-1 font-medium">
            {total} photos across all events. Upload, caption, and manage event gallery images.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* New album is hidden until an album API exists. */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 bg-[#F37820] text-white hover:bg-[#C24B00] px-4 py-2 rounded-full text-[13px] font-bold shadow-sm shadow-orange-500/20 transition disabled:opacity-50 select-none motion-control"
          >
            <IconUpload className="w-4 h-4" />
            <span>Upload photos</span>
          </button>
        </div>
      </div>

      {/* Toolbar Filter Panel */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white border border-[#E2E8F0] p-4 rounded-2xl shadow-sm">
        {/* Left option chips */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search bar */}
          <div className="relative w-64 mr-2">
            <IconSearch className="w-4 h-4 text-[#647589] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search captions…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F8F7F5] border border-[#E2E8F0] rounded-full py-1.5 pl-9 pr-4 text-[12.5px] text-[#0F172A] placeholder-[#647589] focus:ring-1 focus:ring-[#F37820] focus:border-[#F37820] outline-none transition"
            />
          </div>

          {/* Filter chips intentionally hidden per CMS revision request.
          {["All photos", "Trail runs", "Camping", "Walks"].map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={cn(
                "px-3.5 py-1.5 rounded-full text-[12.5px] font-bold border transition",
                selectedCategory === category
                  ? "bg-[#F37820]/10 border-[#F37820] text-[#C24B00]"
                  : "bg-white border-[#E2E8F0] text-[#647589] hover:bg-slate-50"
              )}
            >
              {category}
            </button>
          ))}
          */}
        </div>

        {/* Filter/sort controls intentionally hidden per CMS revision request.
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-white border border-[#E2E8F0] px-3.5 py-1.5 rounded-full text-[12.5px] font-bold text-[#0F172A] cursor-pointer shadow-sm hover:bg-slate-50 transition select-none">
            <span>Linked event</span>
            <IconChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </div>

          <div className="h-6 w-px bg-slate-200" />

          Grid switchers hidden with the rest of the filter/sort controls.
          <div className="flex items-center border border-[#E2E8F0] rounded-lg overflow-hidden bg-white p-0.5 shadow-xs select-none">
            <button className="p-1.5 bg-[#F8F7F5] text-[#C24B00] rounded-md transition" title="Grid view">
              <IconLayoutGrid className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-slate-700 transition" title="List view">
              <IconList className="w-4 h-4" />
            </button>
          </div>
        </div>
        */}
      </div>

      {error ? (
        <div className="bg-white border border-red-100 text-red-700 rounded-2xl p-5 text-sm font-bold">
          {error}
        </div>
      ) : null}

      {/* Floating Bulk Actions Bar */}
      {selectedCount > 0 && (
        <div className="bg-slate-900 border border-slate-800 text-white px-6 py-3.5 rounded-2xl shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4 animate-slideUp select-none">
          <div className="flex items-center gap-3">
            <span className="w-5 h-5 bg-[#F37820] text-white rounded-full flex items-center justify-center font-bold text-xs">
              {selectedCount}
            </span>
            <span className="text-[13.5px] font-bold">photos selected</span>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {/* Link-to-event is hidden until the CMS has an event-linking API workflow. */}
            <button
              onClick={handleDownloadSelected}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/15 px-4 py-2 rounded-full text-xs font-bold transition"
            >
              <IconDownload className="w-3.5 h-3.5 text-slate-300" />
              <span>Download</span>
            </button>
            <button
              onClick={handleDeleteSelected}
              className="flex items-center gap-1.5 bg-red-500/25 hover:bg-red-500/35 border border-red-500/30 text-red-300 px-4 py-2 rounded-full text-xs font-bold transition"
            >
              <IconTrash className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            
            <div className="w-px h-5 bg-white/10 mx-2 hidden md:block" />

            <button
              onClick={handleDeselectAll}
              className="text-xs font-bold text-[#647589] hover:text-white transition px-2 py-1"
            >
              Deselect all
            </button>
          </div>
        </div>
      )}

      {/* Media Grid Cards Panel */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Card 1: Dropzone Upload Tile */}
        <div
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={cn(
            "aspect-square border border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-4 transition group",
            uploading
              ? "bg-[#F8F7F5] border-[#E2E8F0] cursor-wait"
              : "bg-white border-[#E2E8F0] hover:bg-slate-50 cursor-pointer"
          )}
        >
          {uploading ? (
            <div className="space-y-3 flex flex-col items-center w-full px-6">
              <IconLoader className="w-8 h-8 text-[#F37820] animate-spin" />
              <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#F37820] h-full rounded-full transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <span className="text-[11px] font-bold text-[#647589]">
                Uploading ({uploadProgress}%)
              </span>
            </div>
          ) : (
            <>
              <IconUpload className="w-8 h-8 text-[#647589] mb-2 group-hover:text-[#F37820] transition duration-200" />
              <div className="text-[13px] font-bold text-[#0F172A]">Drop photos</div>
              <div className="text-[11px] text-[#647589] mt-0.5">
                or <span className="text-[#F37820] hover:underline">browse</span>
              </div>
            </>
          )}
        </div>

        {/* Existing Grid Photos */}
        {loading ? (
          <div className="col-span-full py-12 text-center text-[#647589] text-[14px]">
            Loading gallery photos...
          </div>
        ) : filteredPhotos.map((photo) => {
          const isChecked = !!selectedItems[photo.id];
          
          return (
            <div
              key={photo.id}
              onClick={(e) => toggleSelectPhoto(photo.id, e)}
              className={cn(
                "aspect-square rounded-2xl border bg-slate-100 overflow-hidden relative group cursor-pointer shadow-sm hover:shadow-md transition duration-200 select-none",
                isChecked ? "border-[#F37820] ring-2 ring-[#F37820]" : "border-[#E2E8F0]"
              )}
            >
              {/* Photo Image Placeholder */}
              <img src={photo.image} alt={photo.title} className="absolute inset-0 w-full h-full object-cover" />

              {/* Selection Checkbox */}
              <button
                onClick={(e) => toggleSelectPhoto(photo.id, e)}
                className={cn(
                  "absolute top-3 left-3 w-5 h-5 rounded-md border flex items-center justify-center z-20 transition duration-150",
                  isChecked
                    ? "bg-[#F37820] border-[#F37820] text-white"
                    : "bg-black/20 border-white/50 hover:bg-black/35 text-transparent hover:text-white/30"
                )}
              >
                <IconCheck className="w-3.5 h-3.5" />
              </button>

              {/* Edit Icon Overlay */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEditCaption(photo);
                }}
                className="absolute top-3 right-3 p-1 bg-black/40 text-white rounded-lg hover:bg-black/60 opacity-0 group-hover:opacity-100 transition duration-200 z-20"
                title="Edit caption"
              >
                <IconEdit className="w-3.5 h-3.5" />
              </button>

              {/* Bottom Text Gradients Card */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 pt-10 flex flex-col justify-end text-white z-10">
                <div className="text-[12.5px] font-bold leading-snug drop-shadow-sm">
                  {photo.title}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#94A3B8] font-bold mt-1.5">
                  <IconLink className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{photo.event}</span>
                </div>
              </div>
            </div>
          );
        })}

        {!loading && filteredPhotos.length === 0 && (
          <div className="col-span-full py-12 text-center text-[#647589] text-[14px]">
            {photos.length === 0 ? "No gallery photos yet." : "No photos found."}
          </div>
        )}
      </div>

      <div className="flex justify-between items-center px-6 py-4 border border-[#E2E8F0] bg-white rounded-2xl shadow-sm">
        <span className="text-[12.5px] text-[#647589] font-medium">
          Showing {filteredPhotos.length === 0 ? 0 : (page - 1) * 15 + 1}–{(page - 1) * 15 + filteredPhotos.length} of {total} photos
        </span>
        <div className="flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 text-xs font-bold"
          >
            Previous
          </button>
          <span className="w-8 h-8 rounded-lg bg-[#F37820]/15 text-[#C24B00] border border-[#F37820]/15 text-xs font-bold transition inline-flex items-center justify-center">
            {page}
          </span>
          <button
            disabled={page * 15 >= total}
            onClick={() => setPage((value) => value + 1)}
            className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] text-slate-600 hover:bg-slate-50 transition disabled:opacity-40 text-xs font-bold"
          >
            Next
          </button>
        </div>
      </div>
    </AdminLayout>
  );
}
