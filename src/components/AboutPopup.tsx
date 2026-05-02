"use client";

import { useEffect, useRef } from "react";

export function AboutPopup({
  title,
  body,
  triggerLabel,
}: {
  title: string;
  body: string;
  triggerLabel: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const onClick = (e: MouseEvent) => {
      if (e.target === dlg) dlg.close();
    };
    dlg.addEventListener("click", onClick);
    return () => dlg.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="text-sm text-primary hover:underline inline-flex items-center gap-1"
      >
        {triggerLabel}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-3.5 h-3.5"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v4.5a.75.75 0 001.5 0v-4.5zM10 15a1 1 0 100-2 1 1 0 000 2z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <dialog
        ref={dialogRef}
        className="rounded-lg p-0 max-w-2xl w-[92vw] backdrop:bg-black/50 shadow-xl"
      >
        <div className="bg-white rounded-lg flex flex-col max-h-[85vh]">
          <div className="flex justify-between items-start gap-4 px-6 py-4 border-b">
            <h2 className="text-lg font-bold text-gray-900">{title}</h2>
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              aria-label="Close"
              className="text-gray-400 hover:text-gray-600 -mt-1 -mr-1 p-1"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
          <div className="px-6 py-4 overflow-y-auto text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
            {body}
          </div>
          <div className="px-6 py-3 border-t text-right bg-gray-50">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}
