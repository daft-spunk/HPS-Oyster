"use client";

import { useState } from "react";

export function InternshipDetails({
  aboutInternship,
  whoFor,
  whatToExpect,
  whatToBring,
}: {
  aboutInternship: string | null;
  whoFor: string | null;
  whatToExpect: string | null;
  whatToBring: string | null;
}) {
  const [expanded, setExpanded] = useState(false);

  const sections = [
    { label: "About this 1-Day Internship", body: aboutInternship },
    { label: "Who is it for?", body: whoFor },
    { label: "What to expect", body: whatToExpect },
    { label: "What to bring", body: whatToBring },
  ].filter((s) => s.body && s.body.trim().length > 0);

  if (sections.length === 0) return null;

  return (
    <div className="mt-3">
      {!expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-sm text-primary hover:underline font-medium"
        >
          Read full details ▾
        </button>
      ) : (
        <div className="space-y-4">
          {sections.map((s) => (
            <div key={s.label}>
              <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-1">
                {s.label}
              </h4>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {s.body}
              </p>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="text-sm text-primary hover:underline font-medium"
          >
            Show less ▴
          </button>
        </div>
      )}
    </div>
  );
}
