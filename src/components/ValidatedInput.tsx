"use client";

import { useState, InputHTMLAttributes, TextareaHTMLAttributes } from "react";

type BaseProps = {
  label?: string;
  errorMessage?: string;
};

export function ValidatedField(
  props: BaseProps & InputHTMLAttributes<HTMLInputElement>
) {
  const { label, errorMessage, required, onBlur, onChange, ...rest } = props;
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");

  const validate = (el: HTMLInputElement) => {
    if (!el.validity.valid) {
      setError(errorMessage || el.validationMessage);
    } else {
      setError("");
    }
  };

  const showError = touched && error;
  const stateClass = showError
    ? "border-red-400 focus:ring-red-300"
    : "border-gray-300 focus:ring-primary";

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <input
        {...rest}
        required={required}
        onBlur={(e) => {
          setTouched(true);
          validate(e.currentTarget);
          onBlur?.(e);
        }}
        onChange={(e) => {
          if (touched) validate(e.currentTarget);
          onChange?.(e);
        }}
        aria-invalid={showError ? true : undefined}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${stateClass}`}
      />
      {showError && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export function ValidatedTextarea(
  props: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  const { label, errorMessage, required, onBlur, onChange, ...rest } = props;
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState("");

  const validate = (el: HTMLTextAreaElement) => {
    if (!el.validity.valid) {
      setError(errorMessage || el.validationMessage);
    } else {
      setError("");
    }
  };

  const showError = touched && error;
  const stateClass = showError
    ? "border-red-400 focus:ring-red-300"
    : "border-gray-300 focus:ring-primary";

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <textarea
        {...rest}
        required={required}
        onBlur={(e) => {
          setTouched(true);
          validate(e.currentTarget);
          onBlur?.(e);
        }}
        onChange={(e) => {
          if (touched) validate(e.currentTarget);
          onChange?.(e);
        }}
        aria-invalid={showError ? true : undefined}
        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:border-transparent outline-none transition ${stateClass}`}
      />
      {showError && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
