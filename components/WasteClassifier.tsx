"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  Camera,
  Upload,
  Recycle,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  HelpCircle,
  Cpu,
  Lightbulb,
  BarChart2,
  ChevronRight,
  StopCircle,
  RefreshCw,
  Zap,
  Sparkles,
} from "lucide-react";
import {
  WASTE_TYPE_ICONS,
  CATEGORY_BADGE,
  type WasteClassificationResult,
} from "@/lib/wasteCategories";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface HistoryEntry extends WasteClassificationResult {
  id: string;
  imageUrl: string;
  timestamp: string;
}

type ApiStatus = "idle" | "ready" | "classifying" | "error";

// ─── Partition Bins Visualisation ──────────────────────────────────────────────

function PartitionBins({
  result,
}: {
  result: WasteClassificationResult | null;
}) {
  const highlightRecyclable =
    result !== null && result.partition === "recyclable";
  const highlightNonRecyclable =
    result !== null && result.partition === "non-recyclable";

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
        Smart Bin Partition
      </p>

      <div className="flex gap-8 items-end justify-center">
        {/* ── Recyclable Bin ── */}
        <div className="flex flex-col items-center gap-2">
          {highlightRecyclable && (
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400 text-xs font-bold animate-bounce">
              <ChevronRight className="w-3 h-3" />
              USE THIS
            </div>
          )}
          <div
            className={`relative w-28 transition-all duration-500 ${
              highlightRecyclable
                ? "scale-110 drop-shadow-[0_0_18px_rgba(34,197,94,0.65)]"
                : result
                  ? "opacity-35 scale-95"
                  : ""
            }`}
          >
            <div
              className={`w-full h-4 rounded-t-lg transition-colors duration-500 ${
                highlightRecyclable
                  ? "bg-green-500"
                  : "bg-green-300 dark:bg-green-700"
              }`}
            />
            <div
              className="relative w-full rounded-b-lg border-2 transition-colors duration-500 overflow-hidden"
              style={{
                height: 100,
                borderColor: highlightRecyclable ? "#22c55e" : undefined,
              }}
            >
              <div
                className={`border-2 w-full h-full ${
                  highlightRecyclable
                    ? "border-green-500 bg-green-50 dark:bg-green-900/30"
                    : "border-green-200 dark:border-green-800 bg-gray-50 dark:bg-gray-800"
                }`}
              />
              <div
                className="absolute bottom-0 left-0 right-0 bg-green-400/30 dark:bg-green-500/20 transition-all duration-700"
                style={{ height: highlightRecyclable ? "38%" : "20%" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Recycle
                  className={`w-8 h-8 transition-colors duration-500 ${
                    highlightRecyclable
                      ? "text-green-500"
                      : "text-green-300 dark:text-green-700"
                  }`}
                />
              </div>
            </div>
          </div>
          <span
            className={`text-xs font-semibold transition-colors duration-300 ${
              highlightRecyclable
                ? "text-green-600 dark:text-green-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            Recyclable
          </span>
        </div>

        {/* ── Non-Recyclable Bin ── */}
        <div className="flex flex-col items-center gap-2">
          {highlightNonRecyclable && (
            <div className="flex items-center gap-1 text-red-600 dark:text-red-400 text-xs font-bold animate-bounce">
              <ChevronRight className="w-3 h-3" />
              USE THIS
            </div>
          )}
          <div
            className={`relative w-28 transition-all duration-500 ${
              highlightNonRecyclable
                ? "scale-110 drop-shadow-[0_0_18px_rgba(239,68,68,0.65)]"
                : result
                  ? "opacity-35 scale-95"
                  : ""
            }`}
          >
            <div
              className={`w-full h-4 rounded-t-lg transition-colors duration-500 ${
                highlightNonRecyclable
                  ? "bg-red-500"
                  : "bg-red-300 dark:bg-red-700"
              }`}
            />
            <div
              className="relative w-full rounded-b-lg border-2 transition-colors duration-500 overflow-hidden"
              style={{
                height: 100,
                borderColor: highlightNonRecyclable ? "#ef4444" : undefined,
              }}
            >
              <div
                className={`border-2 w-full h-full ${
                  highlightNonRecyclable
                    ? "border-red-500 bg-red-50 dark:bg-red-900/30"
                    : "border-red-200 dark:border-red-800 bg-gray-50 dark:bg-gray-800"
                }`}
              />
              <div
                className="absolute bottom-0 left-0 right-0 bg-red-400/30 dark:bg-red-500/20 transition-all duration-700"
                style={{ height: highlightNonRecyclable ? "55%" : "35%" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Trash2
                  className={`w-8 h-8 transition-colors duration-500 ${
                    highlightNonRecyclable
                      ? "text-red-500"
                      : "text-red-300 dark:text-red-700"
                  }`}
                />
              </div>
            </div>
          </div>
          <span
            className={`text-xs font-semibold transition-colors duration-300 ${
              highlightNonRecyclable
                ? "text-red-600 dark:text-red-400"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            General Waste
          </span>
        </div>
      </div>

      {!result && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-2">
          Classify a waste item to see which bin to use
        </p>
      )}
    </div>
  );
}

// ─── Result Card ───────────────────────────────────────────────────────────────

function ResultCard({
  result,
  onClear,
}: {
  result: WasteClassificationResult;
  onClear: () => void;
}) {
  const badge = CATEGORY_BADGE[result.category];
  const icon = WASTE_TYPE_ICONS[result.wasteType];
  const confidencePct = Math.round(result.confidence * 100);

  const confBarColor =
    result.category === "recyclable"
      ? "bg-green-500"
      : result.category === "non-recyclable"
        ? "bg-red-500"
        : "bg-gray-400";

  return (
    <div
      className={`rounded-xl border-2 p-4 space-y-3 ${badge.bg} ${badge.border}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className={`font-bold text-base ${badge.text_color}`}>
              {result.label}
            </p>
            <span
              className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.border} ${badge.text_color}`}
            >
              {badge.text}
            </span>
          </div>
        </div>
        <button
          onClick={onClear}
          className="p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>

      {/* Confidence bar */}
      <div>
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-500 dark:text-gray-400 font-medium">
            AI Confidence
          </span>
          <span className={`font-bold ${badge.text_color}`}>
            {confidencePct}%
          </span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${confBarColor}`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
        {result.description}
      </p>

      {/* Disposal tip */}
      <div className="flex items-start gap-2 p-3 bg-white/60 dark:bg-black/20 rounded-lg border border-white/40 dark:border-white/10">
        <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          <span className="font-semibold">Tip: </span>
          {result.disposalTip}
        </p>
      </div>

      {/* Category icon */}
      <div className="flex items-center gap-2">
        {result.category === "recyclable" ? (
          <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
        ) : result.category === "non-recyclable" ? (
          <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
        ) : (
          <HelpCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        )}
        <span className={`text-xs font-semibold ${badge.text_color}`}>
          {result.category === "recyclable"
            ? "Place in the Recyclable partition"
            : result.category === "non-recyclable"
              ? "Place in the General Waste partition"
              : "Unable to determine — use General Waste as default"}
        </span>
      </div>
    </div>
  );
}

// ─── Stats Panel ───────────────────────────────────────────────────────────────

function StatsPanel({ history }: { history: HistoryEntry[] }) {
  const recyclable = history.filter((h) => h.category === "recyclable").length;
  const nonRecyclable = history.filter(
    (h) => h.category === "non-recyclable"
  ).length;
  const unknown = history.filter((h) => h.category === "unknown").length;
  const total = history.length;
  const recyclablePct = total > 0 ? Math.round((recyclable / total) * 100) : 0;
  const nonRecyclablePct =
    total > 0 ? Math.round((nonRecyclable / total) * 100) : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
        <BarChart2 className="w-4 h-4 text-indigo-500" />
        Session Stats
      </h3>
      {total === 0 ? (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-4">
          No classifications yet this session
        </p>
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Total classified</span>
            <span className="font-bold text-gray-800 dark:text-white">
              {total}
            </span>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-green-600 dark:text-green-400 font-medium">
                ♻ Recyclable
              </span>
              <span className="text-green-600 dark:text-green-400 font-bold">
                {recyclable} ({recyclablePct}%)
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${recyclablePct}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-red-600 dark:text-red-400 font-medium">
                🗑 General Waste
              </span>
              <span className="text-red-600 dark:text-red-400 font-bold">
                {nonRecyclable} ({nonRecyclablePct}%)
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-red-500 rounded-full transition-all duration-500"
                style={{ width: `${nonRecyclablePct}%` }}
              />
            </div>
          </div>
          {unknown > 0 && (
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {unknown} item{unknown > 1 ? "s" : ""} could not be identified
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function WasteClassifier() {
  const [apiStatus, setApiStatus] = useState<ApiStatus>("ready");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [classifying, setClassifying] = useState(false);
  const [result, setResult] = useState<WasteClassificationResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── Convert <img> element to base64 and call Gemini API ───────────────────
  const runClassification = useCallback(async (imgEl: HTMLImageElement) => {
    setClassifying(true);
    setApiStatus("classifying");
    setError(null);

    try {
      // Resize to max 1024px on the longest side to keep payload small
      const MAX_PX = 1024;
      const srcW = imgEl.naturalWidth || imgEl.width || 640;
      const srcH = imgEl.naturalHeight || imgEl.height || 480;
      const scale = Math.min(1, MAX_PX / Math.max(srcW, srcH));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(srcW * scale);
      canvas.height = Math.round(srcH * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");
      ctx.drawImage(imgEl, 0, 0, canvas.width, canvas.height);

      // Get base64 string (strip the data:image/xxx;base64, prefix)
      const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
      const base64 = dataUrl.split(",")[1];

      if (!base64) throw new Error("Failed to convert image to base64");

      const response = await fetch("/api/classify-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: "image/jpeg" }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Server error: ${response.status}`);
      }

      if (!data.success || !data.classification) {
        throw new Error("Invalid response from classification API");
      }

      const classification: WasteClassificationResult = {
        ...data.classification,
        rawPredictions: [
          {
            className: data.classification.label,
            probability: data.classification.confidence,
          },
        ],
      };

      setResult(classification);
      setApiStatus("ready");

      setHistory((prev) => [
        {
          ...classification,
          id: `hist-${Date.now()}`,
          imageUrl: imgEl.src,
          timestamp: new Date().toISOString(),
        },
        ...prev.slice(0, 19),
      ]);
    } catch (err) {
      console.error("Classification error:", err);
      const msg =
        err instanceof Error ? err.message : "Classification failed.";

      // Friendly message for missing API key
      if (msg.includes("GEMINI_API_KEY")) {
        setError(
          "Gemini API key not configured. Add GEMINI_API_KEY to your .env.local file."
        );
      } else {
        setError(`${msg} — Try a clearer, well-lit photo.`);
      }
      setApiStatus("error");
    } finally {
      setClassifying(false);
    }
  }, []);

  const handleImageLoad = () => {
    if (imgRef.current) runClassification(imgRef.current);
  };

  // ── File upload ────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    stopCamera();
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImageUrl(ev.target?.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // ── Camera ─────────────────────────────────────────────────────────────────
  const startCamera = async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraActive(true);
      setImageUrl(null);
      setResult(null);
    } catch {
      setError(
        "Camera access denied. Please allow camera permissions and try again."
      );
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
    const captured = canvas.toDataURL("image/jpeg", 0.92);
    setImageUrl(captured);
    setResult(null);
    stopCamera();
  };

  const clearAll = () => {
    setImageUrl(null);
    setResult(null);
    setError(null);
    stopCamera();
    if (apiStatus === "error") setApiStatus("ready");
  };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* ── Header ── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-500" />
            AI Waste Classifier
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-md">
            Upload or capture a photo of any waste item. Gemini AI instantly
            identifies it and tells you which bin to use.
          </p>
        </div>

        {/* Gemini status pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Gemini Vision
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-0.5">Classification Error</p>
            <p className="text-xs">{error}</p>
            {error.includes("GEMINI_API_KEY") && (
              <p className="text-xs mt-2 bg-red-100 dark:bg-red-900/40 rounded p-2 font-mono">
                Add to .env.local: GEMINI_API_KEY=your_key_here
                <br />
                Get a free key at:{" "}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  aistudio.google.com
                </a>
              </p>
            )}
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-800/40 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left column: image + result ── */}
        <div className="space-y-4">
          {/* Image area */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden">
            {/* Camera feed */}
            {cameraActive && (
              <div className="relative">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full max-h-72 object-cover bg-black"
                />
                {/* Viewfinder overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  {[
                    "top-3 left-3 border-t-2 border-l-2",
                    "top-3 right-3 border-t-2 border-r-2",
                    "bottom-3 left-3 border-b-2 border-l-2",
                    "bottom-3 right-3 border-b-2 border-r-2",
                  ].map((cls, i) => (
                    <div
                      key={i}
                      className={`absolute w-5 h-5 border-indigo-400 ${cls}`}
                    />
                  ))}
                </div>
                <p className="absolute bottom-3 left-1/2 -translate-x-1/2 text-white text-xs bg-black/60 px-3 py-1 rounded-full whitespace-nowrap">
                  Point camera at the waste item
                </p>
              </div>
            )}

            {/* Image preview */}
            {imageUrl && !cameraActive && (
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  ref={imgRef}
                  src={imageUrl}
                  alt="Waste item for classification"
                  onLoad={handleImageLoad}
                  className="w-full object-contain max-h-72 bg-gray-100 dark:bg-gray-900"
                  crossOrigin="anonymous"
                />
                {classifying && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 backdrop-blur-[2px]">
                    <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="text-white text-sm font-semibold">
                      Analysing with Gemini AI…
                    </p>
                    <p className="text-white/60 text-xs">
                      Identifying waste type and recyclability
                    </p>
                  </div>
                )}
                <button
                  onClick={clearAll}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full transition-colors"
                  title="Clear image"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            )}

            {/* Empty / placeholder state */}
            {!imageUrl && !cameraActive && (
              <div
                className="flex flex-col items-center justify-center py-16 px-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                  <Upload className="w-7 h-7 text-indigo-500" />
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium">
                  Click to upload an image
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  or use the camera button below
                </p>
                <p className="text-xs text-gray-300 dark:text-gray-600 mt-3">
                  Supported: JPG, PNG, WEBP — works with any real photo
                </p>
              </div>
            )}

            {/* Action buttons bar */}
            <div className="flex gap-2 p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
              {!cameraActive ? (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={classifying}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </button>
                  <button
                    onClick={startCamera}
                    disabled={classifying}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    Camera
                  </button>
                  {imageUrl && (
                    <button
                      onClick={clearAll}
                      className="px-3 py-2 border dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm rounded-lg transition-colors"
                      title="Clear"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    onClick={capturePhoto}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    <Zap className="w-4 h-4" />
                    Capture &amp; Classify
                  </button>
                  <button
                    onClick={stopCamera}
                    className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors"
                  >
                    <StopCircle className="w-4 h-4" />
                    Stop
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Classifying indicator */}
          {classifying && !imageUrl && (
            <div className="flex items-center gap-3 p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl text-sm text-indigo-700 dark:text-indigo-300">
              <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin flex-shrink-0" />
              <div>
                <p className="font-semibold">Gemini AI is analysing…</p>
                <p className="text-xs text-indigo-500 dark:text-indigo-400 mt-0.5">
                  This usually takes 2–4 seconds
                </p>
              </div>
            </div>
          )}

          {/* Classification result */}
          {result && !classifying && (
            <ResultCard result={result} onClear={() => setResult(null)} />
          )}

          {/* How it works info card — shown when idle */}
          {!result && !classifying && !error && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Powered by Gemini Vision AI
              </p>
              <ul className="text-xs text-indigo-600 dark:text-indigo-400 space-y-1 leading-relaxed">
                <li>
                  • Works with <strong>any real-world photo</strong> — crumpled,
                  dirty, partially visible waste items.
                </li>
                <li>
                  • Understands Indian waste items like chai cups, plastic
                  covers, newspaper bundles.
                </li>
                <li>
                  • Gives a specific <strong>disposal tip</strong> for each item
                  detected.
                </li>
                <li>
                  • The highlighted bin shows which{" "}
                  <strong>partition</strong> of the smart dustbin to use.
                </li>
              </ul>
            </div>
          )}
        </div>

        {/* ── Right column: partition bins + stats ── */}
        <div className="space-y-4">
          {/* Partition visualisation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-6">
            <PartitionBins result={result} />
          </div>

          {/* Quick-guide card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Waste Type Quick Guide
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {[
                {
                  icon: "🧴",
                  label: "Plastic",
                  bin: "Recyclable",
                  color: "text-green-600 dark:text-green-400",
                },
                {
                  icon: "🍶",
                  label: "Glass",
                  bin: "Recyclable",
                  color: "text-green-600 dark:text-green-400",
                },
                {
                  icon: "🥫",
                  label: "Metal / Cans",
                  bin: "Recyclable",
                  color: "text-green-600 dark:text-green-400",
                },
                {
                  icon: "📄",
                  label: "Clean Paper",
                  bin: "Recyclable",
                  color: "text-green-600 dark:text-green-400",
                },
                {
                  icon: "📦",
                  label: "Cardboard",
                  bin: "Recyclable",
                  color: "text-green-600 dark:text-green-400",
                },
                {
                  icon: "💻",
                  label: "Electronics",
                  bin: "E-Waste Centre",
                  color: "text-purple-600 dark:text-purple-400",
                },
                {
                  icon: "🍌",
                  label: "Food / Organic",
                  bin: "General Waste",
                  color: "text-red-600 dark:text-red-400",
                },
                {
                  icon: "🗑️",
                  label: "Hygiene Items",
                  bin: "General Waste",
                  color: "text-red-600 dark:text-red-400",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                >
                  <span className="text-base">{item.icon}</span>
                  <div>
                    <p className="font-medium text-gray-700 dark:text-gray-300">
                      {item.label}
                    </p>
                    <p className={`${item.color} font-semibold`}>{item.bin}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Session stats */}
          <StatsPanel history={history} />
        </div>
      </div>

      {/* ── Classification History ── */}
      {history.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-500" />
              Recent Classifications
              <span className="ml-1 px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 text-xs rounded-full font-medium">
                {history.length}
              </span>
            </h3>
            <button
              onClick={() => setHistory([])}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2">
            {history.map((entry) => {
              const isRec = entry.category === "recyclable";
              const isUnk = entry.category === "unknown";
              return (
                <div
                  key={entry.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs flex-shrink-0 ${
                    isRec
                      ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-700"
                      : isUnk
                        ? "bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600"
                        : "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700"
                  }`}
                >
                  <span className="text-base">
                    {WASTE_TYPE_ICONS[entry.wasteType]}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={`font-semibold truncate max-w-[96px] ${
                        isRec
                          ? "text-green-700 dark:text-green-400"
                          : isUnk
                            ? "text-gray-600 dark:text-gray-400"
                            : "text-red-700 dark:text-red-400"
                      }`}
                    >
                      {entry.label}
                    </p>
                    <p className="text-gray-400 dark:text-gray-500">
                      {new Date(entry.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
