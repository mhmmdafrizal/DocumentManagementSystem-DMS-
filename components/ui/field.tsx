import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

const fieldBase =
  "w-full h-8 px-2.5 text-sm rounded-radius-sm border border-ink-200 bg-ink-0 text-ink-800 placeholder:text-ink-300 outline-none transition-colors focus:border-primary-500 focus:ring-2 focus:ring-primary-500/25 dark:bg-ink-100";

interface FieldWrapProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export function Field({ label, htmlFor, error, hint, required, children }: FieldWrapProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-medium text-ink-800">
          {label}
          {required && <span className="ml-0.5 text-danger-600" aria-hidden>*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} role="alert" className="text-xs text-danger-600">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
}

interface ErrorProp {
  error?: boolean;
  "aria-describedby"?: string;
}

export function Input({
  error, className, ...rest
}: InputHTMLAttributes<HTMLInputElement> & ErrorProp) {
  return (
    <input
      className={`${fieldBase} ${error ? "border-danger-600 focus:border-danger-600 focus:ring-danger-600/25" : ""} ${className ?? ""}`}
      aria-invalid={error}
      {...rest}
    />
  );
}

export function Textarea({
  error, className, ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & ErrorProp) {
  return (
    <textarea
      className={`${fieldBase} h-auto py-2 min-h-20 resize-y leading-5 ${error ? "border-danger-600" : ""} ${className ?? ""}`}
      aria-invalid={error}
      {...rest}
    />
  );
}

export function Select({
  error, children, className, ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & ErrorProp) {
  return (
    <select className={`${fieldBase} appearance-none pr-8 cursor-pointer ${error ? "border-danger-600" : ""} ${className ?? ""}`} aria-invalid={error} {...rest}>
      {children}
    </select>
  );
}