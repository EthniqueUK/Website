"use client";

import { useRef, useState } from "react";

type FileUploadFieldProps = {
  name: string;
  accept?: string;
  required?: boolean;
  label?: string;
  hint?: string;
};

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 16V4m0 0 8 8m-8-8-8 8M4 20h16"
      />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

export function FileUploadField({
  name,
  accept = "image/jpeg,image/png,image/webp,application/pdf",
  required = false,
  label = "Upload file",
  hint = "JPEG, PNG, WebP or PDF · max 10 MB",
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  function assignFile(file: File | undefined) {
    if (!file || !inputRef.current) return;

    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    inputRef.current.files = dataTransfer.files;
    setFileName(file.name);
  }

  function handleInputChange() {
    const file = inputRef.current?.files?.[0];
    setFileName(file?.name ?? null);
  }

  function handleClear(event: React.MouseEvent) {
    event.stopPropagation();
    if (!inputRef.current) return;
    inputRef.current.value = "";
    setFileName(null);
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    setIsDragging(false);
    assignFile(event.dataTransfer.files?.[0]);
  }

  const zoneClasses = [
    "group relative flex min-h-[132px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition",
    isDragging
      ? "border-[#C8A86A] bg-[#F7F3EB]"
      : fileName
        ? "border-[#C8A86A]/70 bg-[#F7F3EB]/60 hover:border-[#C8A86A]"
        : "border-[#A79C89]/50 bg-[#FAF8F4] hover:border-[#C8A86A] hover:bg-[#F7F3EB]",
  ].join(" ");

  return (
    <div className="space-y-1.5">
      <span className="text-sm font-medium text-[#1F1F1F]">{label}</span>

      <div
        role="button"
        tabIndex={0}
        className={zoneClasses}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          name={name}
          accept={accept}
          required={required}
          className="sr-only"
          onChange={handleInputChange}
        />

        {fileName ? (
          <>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#3B0F14]/10 text-[#3B0F14]">
              <FileIcon className="h-5 w-5" />
            </div>
            <p className="max-w-full truncate px-2 text-sm font-medium text-[#3B0F14]">
              {fileName}
            </p>
            <p className="mt-1 text-sm text-[#5C5348]">File ready to upload</p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <span className="inline-flex items-center rounded-lg bg-[#3B0F14] px-4 py-2 text-xs font-semibold text-white shadow-sm transition group-hover:bg-[#5C1520]">
                Replace file
              </span>
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center rounded-lg border border-[#A79C89]/50 bg-white px-4 py-2 text-xs font-medium text-[#1F1F1F] transition hover:border-[#3B0F14]/30 hover:text-[#3B0F14]"
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#3B0F14]/8 text-[#3B0F14] transition group-hover:bg-[#3B0F14]/12">
              <UploadIcon className="h-5 w-5" />
            </div>
            <span className="inline-flex items-center rounded-lg bg-[#3B0F14] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition group-hover:bg-[#5C1520] group-active:scale-[0.98]">
              Browse files
            </span>
            <p className="mt-3 text-sm font-medium text-[#4A4540]">or drag and drop here</p>
            <p className="mt-1 text-sm text-[#5C5348]">{hint}</p>
          </>
        )}
      </div>
    </div>
  );
}
