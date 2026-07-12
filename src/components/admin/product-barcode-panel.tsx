"use client";

import { useEffect, useId, useRef, useState } from "react";
import JsBarcode from "jsbarcode";

type ProductBarcodePanelProps = {
  sku: string | null | undefined;
  productName?: string | null;
};

export function ProductBarcodePanel({ sku, productName }: ProductBarcodePanelProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const reactId = useId();
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const normalizedSku = sku?.trim() || "";

  useEffect(() => {
    setReady(false);
    setError(null);

    if (!normalizedSku || !svgRef.current) {
      return;
    }

    try {
      JsBarcode(svgRef.current, normalizedSku, {
        format: "CODE128",
        displayValue: true,
        fontSize: 14,
        height: 60,
        margin: 8,
        textMargin: 4,
        background: "#ffffff",
        lineColor: "#1F1F1F",
      });
      setReady(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate barcode.");
      setReady(false);
    }
  }, [normalizedSku]);

  function handlePrint() {
    if (!normalizedSku || !svgRef.current || !ready) {
      return;
    }

    const barcodeMarkup = svgRef.current.outerHTML;
    const title = productName?.trim() || "Ethnique product";
    const printWindow = window.open("", "_blank", "noopener,noreferrer,width=480,height=360");

    if (!printWindow) {
      setError("Pop-up blocked. Allow pop-ups to print the barcode label.");
      return;
    }

    printWindow.document.write(`<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Barcode ${normalizedSku}</title>
    <style>
      @page { margin: 4mm; size: auto; }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
        color: #1f1f1f;
      }
      .label {
        width: 60mm;
        min-height: 35mm;
        padding: 3mm;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2mm;
      }
      .name {
        font-size: 10px;
        text-align: center;
        max-width: 54mm;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .barcode svg {
        max-width: 54mm;
        height: auto;
      }
      .hint {
        display: none;
        margin-top: 12px;
        font-size: 12px;
        color: #666;
      }
      @media screen {
        body { padding: 16px; background: #f5f5f5; }
        .label {
          background: #fff;
          border: 1px dashed #ccc;
        }
        .hint { display: block; }
      }
    </style>
  </head>
  <body>
    <div class="label">
      <div class="name">${escapeHtml(title)}</div>
      <div class="barcode">${barcodeMarkup}</div>
    </div>
    <p class="hint">Choose your barcode / label printer in the print dialog (Code 128).</p>
    <script>
      window.onload = function () {
        window.focus();
        window.print();
      };
    </script>
  </body>
</html>`);
    printWindow.document.close();
  }

  if (!normalizedSku) {
    return (
      <div className="rounded-xl border border-dashed border-[#A79C89]/40 bg-[#F7F3EB] px-4 py-6 text-center text-sm text-[#A79C89]">
        Save a SKU to generate a Code 128 barcode for label printing.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex justify-center rounded-xl border border-[#A79C89]/30 bg-white p-4">
        <svg ref={svgRef} id={`barcode-${reactId.replace(/:/g, "")}`} role="img" aria-label={`Barcode ${normalizedSku}`} />
      </div>

      <p className="text-xs text-[#A79C89]">
        Code 128 barcode for <span className="font-medium text-[#3B0F14]">{normalizedSku}</span>.
        Use Print label and select your barcode printer.
      </p>

      <button
        type="button"
        disabled={!ready}
        onClick={handlePrint}
        className="rounded-xl bg-[#3B0F14] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#5C1520] disabled:opacity-60"
      >
        Print barcode label
      </button>
    </div>
  );
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
