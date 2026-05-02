"use client";

import { useState } from "react";

export function SpeakerBio({ bio }: { bio: string | null }) {
  const [expanded, setExpanded] = useState(false);
  if (!bio) return null;

  const isLong = bio.length > 280;

  return (
    <div className="text-gray-600 text-sm">
      <p className={expanded || !isLong ? "" : "line-clamp-4"}>{bio}</p>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="mt-1 text-primary text-xs font-medium hover:underline"
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}
