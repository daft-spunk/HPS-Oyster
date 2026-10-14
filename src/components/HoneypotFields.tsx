"use client";

import { useEffect, useState } from "react";
import { BOT_HONEYPOT_FIELD, BOT_TIMING_FIELD } from "@/lib/anti-bot";

/**
 * Drop-in anti-bot inputs for any public form.
 *
 * Renders two hidden inputs:
 *  - A honeypot field (never visible to real users). Bots that fill
 *    every input will populate it; the server rejects any submission
 *    where it has a value.
 *  - A render-timestamp field, populated in useEffect so it only
 *    appears for clients running JS. The server rejects submissions
 *    that arrive within a couple of seconds of the stamp (= a script,
 *    not a human typing).
 */
export function HoneypotFields() {
  const [renderedAt, setRenderedAt] = useState("");

  useEffect(() => {
    setRenderedAt(String(Date.now()));
  }, []);

  return (
    <>
      {/* Honeypot: visually hidden, hidden from assistive tech, excluded
         from the tab order. Real users won't fill it; bots usually do. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-10000px",
          top: "auto",
          width: 1,
          height: 1,
          overflow: "hidden",
        }}
      >
        <label>
          Leave this field empty
          <input
            type="text"
            name={BOT_HONEYPOT_FIELD}
            tabIndex={-1}
            autoComplete="off"
            defaultValue=""
          />
        </label>
      </div>

      <input type="hidden" name={BOT_TIMING_FIELD} value={renderedAt} />
    </>
  );
}
