"use client";

import { useEffect, useState } from "react";
import { IconBookmark, IconBookmarkFilled } from "@tabler/icons-react";
import { ActionButton } from "@/components/ui/action-button";
import { getStoredAuthToken } from "@/lib/client-auth";

type SaveEventButtonProps = {
  eventSlug: string;
};

type SavedEventCard = {
  id: string;
};

type SavedEventsEnvelope = {
  data: SavedEventCard[];
};

export function SaveEventButton({ eventSlug }: SaveEventButtonProps) {
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = getStoredAuthToken();
    if (!token) return;

    let active = true;

    async function loadSavedState() {
      try {
        const response = await fetch("/api/puncak/me/saved-events", {
          cache: "no-store",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const payload = (await response.json()) as SavedEventsEnvelope;

        if (active) {
          setSaved(payload.data.some((event) => event.id === savedCardId(eventSlug)));
        }
      } catch {
        if (active) {
          setMessage("Unable to load saved state.");
        }
      }
    }

    loadSavedState();

    return () => {
      active = false;
    };
  }, [eventSlug]);

  async function toggleSaved() {
    const token = getStoredAuthToken();
    if (!token) {
      window.location.href = `/login?return_to=${encodeURIComponent(window.location.pathname)}`;
      return;
    }

    setPending(true);
    setMessage("");

    try {
      const response = await fetch(
        saved
          ? `/api/puncak/me/saved-events/${encodeURIComponent(eventSlug)}`
          : "/api/puncak/me/saved-events",
        {
          body: saved ? undefined : JSON.stringify({ eventSlug }),
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
            ...(saved ? {} : { "Content-Type": "application/json" }),
          },
          method: saved ? "DELETE" : "POST",
        },
      );

      if (!response.ok) {
        throw new Error(saved ? "Unable to remove saved event." : "Unable to save event.");
      }

      setSaved((current) => !current);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to update saved event.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="save-event-control">
      <ActionButton
        variant={saved ? "teal" : "light"}
        size="sm"
        icon={saved ? IconBookmarkFilled : IconBookmark}
        iconPosition="left"
        aria-pressed={saved}
        disabled={pending}
        onClick={toggleSaved}
      >
        {pending ? "Saving..." : saved ? "Saved" : "Save"}
      </ActionButton>
      {message ? (
        <span className="save-event-message" role="status">
          {message}
        </span>
      ) : null}
    </div>
  );
}

function savedCardId(slug: string): string {
  return `SAVED-${slug.toUpperCase().replaceAll("-", "_")}`;
}
