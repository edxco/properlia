"use client";

import { useRef, useState } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Color } from "@tiptap/extension-color";
import { Download } from "lucide-react";
import { TextStyle } from "@tiptap/extension-text-style";
import { ImagePreview } from "./ImagePreview";

const PRESETS = {
  square: { label: "Square (1:1)", ratio: "1 / 1" },
  landscape: { label: "Landscape (16:9)", ratio: "16 / 9" },
  portrait: { label: "Portrait (4:5)", ratio: "4 / 5" },
  story: { label: "Story (9:16)", ratio: "9 / 16" },
} as const;

type Preset = keyof typeof PRESETS;

export function ImageGenerator() {
  const previewRef = useRef<HTMLDivElement>(null);
  const [bgColor, setBgColor] = useState("#1e3a5f");
  const [preset, setPreset] = useState<Preset>("square");
  const [isCapturing, setIsCapturing] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TextStyle,
      Color,
    ],
    content:
      '<h1 style="text-align: center">Titulo de la solicitud</h1><h2 style="text-align: center">Subtitulo con detalles</h2><p style="text-align: left"><strong>ZONAS:</strong><br />Lomas de angelopolis, Cuautlancingo, San Pedro Cholula, Blvd Atlixco</p><p style="text-align: left"><strong>CARACTERISTICAS:</strong><br />2 recamaras, 2 estacionamientos, 2 baños, terreno de 120m2, preferentemente en esquina</p><h2 style="text-align: center">Recurso propio con presupuesto máximo de 3.4M</h2><p style="text-align: center"><strong>Zonas a evitar: Tlaxcalancingo y cerca de las piramides</strong></p>',
    editorProps: {
      attributes: {
        class: "ig-editor outline-none w-full h-full",
      },
    },
    immediatelyRender: false,
  });

  const handleDownload = async () => {
    if (!previewRef.current) return;
    setIsCapturing(true);
    try {
      const html2canvas = (await import("html2canvas-pro")).default;
      const canvas = await html2canvas(previewRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: bgColor,
        onclone: (doc, element) => {
          const view = doc.defaultView;
          if (!view) return;
          // Strip oklch/lab/etc. from <style> tags so html2canvas parser doesn't choke
          doc.querySelectorAll("style").forEach((styleEl) => {
            if (styleEl.textContent) {
              styleEl.textContent = styleEl.textContent.replace(
                /\b(oklch|lab|oklab|lch)\([^)]*\)/g,
                "transparent"
              );
            }
          });
          const isUnsupported = (val: string) =>
            /\b(lab|oklch|oklab|lch)\s*\(/.test(val);
          element.style.backgroundColor = bgColor;
          element.querySelectorAll<HTMLElement>("*").forEach((el) => {
            const s = view.getComputedStyle(el);
            if (isUnsupported(s.backgroundColor))
              el.style.backgroundColor = "transparent";
            if (isUnsupported(s.color)) el.style.color = "#373435";
          });
        },
      });
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "properlia-image.png";
        a.click();
        URL.revokeObjectURL(url);
      }, "image/png");
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <>
      <style>{`
        .ig-editor { text-align: center; }
        .ig-editor h1 { font-size: 2em; font-weight: 700; margin-bottom: 0.1em; line-height: 1.2; color: #214c9b; }
        .ig-editor h2 { font-size: 1.4em; font-weight: 600; margin-bottom: 0.4em; line-height: 1.3; }
        .ig-editor p { margin-bottom: 0.6em; line-height: 1.6; }
        .ig-editor p:last-child { margin-bottom: 0; }
        .ig-editor strong { font-weight: 700; }
        .ig-editor em { font-style: italic; }
        .ig-editor p[style*="text-align: center"], .ig-editor h1[style*="text-align: center"], .ig-editor h2[style*="text-align: center"] { text-align: center; }
        .ig-editor p[style*="text-align: right"], .ig-editor h1[style*="text-align: right"], .ig-editor h2[style*="text-align: right"] { text-align: right; }
      `}</style>

      <div className="flex gap-8">
        {/* Left: Controls */}
        <div className="w-64 shrink-0 space-y-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              Image Generator
            </h1>
            <p className="text-sm text-gray-500">
              Design and export marketing images
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Background color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="h-9 w-14 rounded border border-gray-300 cursor-pointer p-0.5"
                />
                <span className="text-sm text-gray-500 font-mono">
                  {bgColor}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dimensions
              </label>
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value as Preset)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {(
                  Object.entries(PRESETS) as [
                    Preset,
                    { label: string; ratio: string }
                  ][]
                ).map(([key, { label }]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleDownload}
            disabled={isCapturing}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-md px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            {isCapturing ? "Generating..." : "Download PNG"}
          </button>
        </div>

        {/* Right: Preview */}
        <ImagePreview
          editor={editor}
          aspectRatio={PRESETS[preset].ratio}
          previewRef={previewRef}
        />
      </div>
    </>
  );
}
