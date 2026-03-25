"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
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
} from "lucide-react";
import {
  classifyWaste,
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

type ModelStatus = "idle" | "loading" | "ready" | "error";

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
            {/* Lid */}
            <div
              className={`w-full h-4 rounded-t-lg transition-colors duration-500 ${
                highlightRecyclable
                  ? "bg-green-500"
                  : "bg-green-300 dark:bg-green-700"
              }`}
            />
            {/* Body */}
            <div
              className={`relative w-full rounded-b-lg border-2 transition-colors duration-500 overflow-hidden`}
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
              {/* fill level */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-green-400/30 dark:bg-green-500/20 transition-all duration-700"
                style={{ height: highlightRecyclable ? "38%" : "20%" }}
              />
              {/* Icon */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <Recycle
                  className={`w-8 h-8 transition-colors duration-500 ${
                    highlightRecyclable
                      ? "text-green-600 dark:text-green-400"
                      : "text-green-300 dark:text-green-700"
                  }`}
                />
                <div className="flex gap-0.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-500 ${
                        highlightRecyclable
                          ? "bg-green-500 h-5"
                          : "bg-green-200 dark:bg-green-800 h-2"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <span
            className={`text-xs font-bold transition-colors duration-300 ${
              highlightRecyclable
                ? "text-green-600 dark:text-green-400"
                : "text-gray-400 dark:text-gray-600"
            }`}
          >
            ♻️ RECYCLABLE
          </span>
        </div>

        {/* ── Divider ── */}
        <div className="text-gray-200 dark:text-gray-700 text-3xl self-center select-none">
          │
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
            {/* Lid */}
            <div
              className={`w-full h-4 rounded-t-lg transition-colors duration-500 ${
                highlightNonRecyclable
                  ? "bg-red-500"
                  : "bg-red-300 dark:bg-red-800"
              }`}
            />
            {/* Body */}
            <div
              className={`relative w-full rounded-b-lg border-2 transition-colors duration-500 overflow-hidden`}
              style={{
                height: 100,
                borderColor: highlightNonRecyclable ? "#ef4444" : undefined,
              }}
            >
              <div
                className={`border-2 w-full h-full ${
                  highlightNonRecyclable
                    ? "border-red-500 bg-red-50 dark:bg-red-900/30"
                    : "border-red-200 dark:border-red-900 bg-gray-50 dark:bg-gray-800"
                }`}
              />
              {/* fill level */}
              <div
                className="absolute bottom-0 left-0 right-0 bg-red-400/30 dark:bg-red-500/20 transition-all duration-700"
                style={{ height: highlightNonRecyclable ? "58%" : "42%" }}
              />
              {/* Icon */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                <Trash2
                  className={`w-8 h-8 transition-colors duration-500 ${
                    highlightNonRecyclable
                      ? "text-red-600 dark:text-red-400"
                      : "text-red-300 dark:text-red-800"
                  }`}
                />
                <div className="flex gap-0.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-500 ${
                        highlightNonRecyclable
                          ? "bg-red-500 h-5"
                          : "bg-red-200 dark:bg-red-900 h-2"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          <span
            className={`text-xs font-bold transition-colors duration-300 ${
              highlightNonRecyclable
                ? "text-red-600 dark:text-red-400"
                : "text-gray-400 dark:text-gray-600"
            }`}
          >
            🗑️ GENERAL WASTE
          </span>
        </div>
      </div>

      {!result && (
        <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
          Upload or capture an image to see
          <br />
          which bin partition to use
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
    confidencePct >= 70
      ? "bg-green-500"
      : confidencePct >= 40
        ? "bg-yellow-500"
        : "bg-red-400";

  return (
    <div
      className={`rounded-xl border-2 p-5 ${badge.bg} ${badge.border} relative`}
    >
      <button
        onClick={onClear}
        className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
        title="Clear result"
      >
        <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
      </button>

      {/* Category badge */}
      <div className="inline-flex items-center gap-2 mb-3">
        {result.category === "recyclable" ? (
          <CheckCircle className={`w-5 h-5 ${badge.text_color}`} />
        ) : result.category === "non-recyclable" ? (
          <AlertCircle className={`w-5 h-5 ${badge.text_color}`} />
        ) : (
          <HelpCircle className={`w-5 h-5 ${badge.text_color}`} />
        )}
        <span
          className={`text-sm font-extrabold tracking-wide ${badge.text_color}`}
        >
          {badge.text}
        </span>
      </div>

      {/* Item info */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-4xl">{icon}</span>
        <div>
          <p
            className={`font-bold text-base leading-tight ${badge.text_color}`}
          >
            {result.label}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 capitalize mt-0.5">
            Category: {result.wasteType.replace("-", " ")}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {result.description}
          </p>
        </div>
      </div>

      {/* Confidence */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-gray-600 dark:text-gray-400 font-semibold">
            Model Confidence
          </span>
          <span className="font-bold text-gray-800 dark:text-gray-200">
            {confidencePct}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
          <div
            className={`h-2.5 rounded-full transition-all duration-700 ${confBarColor}`}
            style={{ width: `${confidencePct}%` }}
          />
        </div>
        {confidencePct < 40 && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            ⚠ Low confidence — try a clearer or closer image.
          </p>
        )}
      </div>

      {/* Disposal tip */}
      <div className="flex gap-2 bg-white/60 dark:bg-black/20 rounded-lg p-3">
        <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
          <strong className="text-gray-800 dark:text-gray-200">
            Disposal tip:{" "}
          </strong>
          {result.disposalTip}
        </p>
      </div>

      {/* Raw predictions (collapsible) */}
      {result.rawPredictions.length > 0 && (
        <details className="mt-3 group">
          <summary className="text-xs text-gray-400 dark:text-gray-500 cursor-pointer select-none hover:text-gray-600 dark:hover:text-gray-300 list-none flex items-center gap-1">
            <ChevronRight className="w-3 h-3 transition-transform group-open:rotate-90" />
            Raw model predictions
          </summary>
          <div className="mt-2 space-y-1 pl-1">
            {result.rawPredictions.slice(0, 5).map((p, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-xs"
              >
                <span className="text-gray-600 dark:text-gray-400 truncate max-w-[72%]">
                  {p.className}
                </span>
                <span className="text-gray-500 dark:text-gray-400 font-mono">
                  {(p.probability * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

// ─── Session Stats ─────────────────────────────────────────────────────────────

function StatsPanel({ history }: { history: HistoryEntry[] }) {
  if (history.length === 0) return null;

  const recyclable = history.filter((h) => h.category === "recyclable").length;
  const nonRecyclable = history.filter(
    (h) => h.category === "non-recyclable",
  ).length;
  const unknown = history.filter((h) => h.category === "unknown").length;
  const total = history.length;

  const recyclablePct = Math.round((recyclable / total) * 100);
  const nonRecyclablePct = Math.round((nonRecyclable / total) * 100);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-5">
      <div className="flex items-center gap-2 mb-4">
        <BarChart2 className="w-5 h-5 text-indigo-500" />
        <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
          Session Statistics
        </h3>
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
          {total} item{total !== 1 ? "s" : ""} classified
        </span>
      </div>

      {/* Stacked bar */}
      <div className="w-full h-3 rounded-full overflow-hidden flex mb-3 bg-gray-200 dark:bg-gray-700">
        <div
          className="bg-green-500 transition-all duration-500"
          style={{ width: `${recyclablePct}%` }}
        />
        <div
          className="bg-red-500 transition-all duration-500"
          style={{ width: `${nonRecyclablePct}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-300">
            Recyclable{" "}
            <span className="font-bold text-green-600 dark:text-green-400">
              {recyclable}
            </span>{" "}
            ({recyclablePct}%)
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
          <span className="text-gray-600 dark:text-gray-300">
            Non-Recyclable{" "}
            <span className="font-bold text-red-600 dark:text-red-400">
              {nonRecyclable}
            </span>{" "}
            ({nonRecyclablePct}%)
          </span>
        </div>
        {unknown > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-400 flex-shrink-0" />
            <span className="text-gray-600 dark:text-gray-300">
              Unknown{" "}
              <span className="font-bold text-gray-600 dark:text-gray-400">
                {unknown}
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function WasteClassifier() {
  const [modelStatus, setModelStatus] = useState<ModelStatus>("idle");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [model, setModel] = useState<any>(null);
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

  // ── Load TF + MobileNet (client-only, dynamic import) ──────────────────────
  const loadModel = useCallback(async () => {
    if (model) return model;
    setModelStatus("loading");
    setError(null);
    try {
      await import("@tensorflow/tfjs");
      const mobilenetMod = await import("@tensorflow-models/mobilenet");
      const loaded = await mobilenetMod.load({ version: 2, alpha: 1.0 });
      setModel(loaded);
      setModelStatus("ready");
      return loaded;
    } catch (err) {
      console.error("Model load error:", err);
      setModelStatus("error");
      setError("Failed to load the AI model. Check your connection and retry.");
      return null;
    }
  }, [model]);

  useEffect(() => {
    loadModel();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Run classification on the loaded <img> element ─────────────────────────
  const runClassification = useCallback(
    async (imgEl: HTMLImageElement) => {
      setClassifying(true);
      setError(null);
      try {
        const currentModel = model ?? (await loadModel());
        if (!currentModel) return;

        const predictions: Array<{ className: string; probability: number }> =
          await currentModel.classify(imgEl);

        const classification = classifyWaste(predictions);
        setResult(classification);

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
        setError("Classification failed. Try a clearer, well-lit image.");
      } finally {
        setClassifying(false);
      }
    },
    [model, loadModel],
  );

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
        "Camera access denied. Please allow camera permissions and try again.",
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
  };

  // ── Model status badge config ──────────────────────────────────────────────
  const STATUS_CONFIG: Record<
    ModelStatus,
    { label: string; dot: string; bg: string; text: string }
  > = {
    idle: {
      label: "Not loaded",
      dot: "bg-gray-400",
      bg: "bg-gray-100 dark:bg-gray-700",
      text: "text-gray-600 dark:text-gray-300",
    },
    loading: {
      label: "Loading AI model…",
      dot: "bg-yellow-400 animate-pulse",
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      text: "text-yellow-700 dark:text-yellow-300",
    },
    ready: {
      label: "AI Model Ready",
      dot: "bg-green-500",
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-700 dark:text-green-300",
    },
    error: {
      label: "Model failed",
      dot: "bg-red-500",
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-700 dark:text-red-300",
    },
  };

  const statusCfg = STATUS_CONFIG[modelStatus];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
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
            Upload or capture an image of a waste item. The on-device MobileNet
            model instantly classifies it and highlights the correct bin
            partition.
          </p>
        </div>

        {/* Model status pill */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${statusCfg.bg} ${statusCfg.text}`}
        >
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${statusCfg.dot}`}
          />
          {statusCfg.label}
          {modelStatus === "error" && (
            <button onClick={() => loadModel()} className="ml-1 underline">
              Retry
            </button>
          )}
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-800/40 transition-colors"
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
                  {/* corner brackets */}
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
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 backdrop-blur-[2px]">
                    <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                    <p className="text-white text-sm font-semibold">
                      Analysing with AI…
                    </p>
                    <p className="text-white/60 text-xs">
                      Running MobileNet v2
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
                  Supported: JPG, PNG, WEBP, GIF
                </p>
              </div>
            )}

            {/* Action buttons bar */}
            <div className="flex gap-2 p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900/40">
              {!cameraActive ? (
                <>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={classifying || modelStatus === "loading"}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Image
                  </button>
                  <button
                    onClick={startCamera}
                    disabled={classifying || modelStatus === "loading"}
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

          {/* Model loading indicator */}
          {modelStatus === "loading" && (
            <div className="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl text-sm text-yellow-700 dark:text-yellow-300">
              <div className="w-4 h-4 border-2 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin flex-shrink-0" />
              <div>
                <p className="font-semibold">Loading MobileNet v2 model…</p>
                <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-0.5">
                  First load downloads ~16 MB. Subsequent loads use the browser
                  cache.
                </p>
              </div>
            </div>
          )}

          {/* Classification result */}
          {result && !classifying && (
            <ResultCard result={result} onClear={() => setResult(null)} />
          )}

          {/* How it works info card */}
          {!result && !classifying && modelStatus === "ready" && (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-4">
              <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                How it works
              </p>
              <ul className="text-xs text-indigo-600 dark:text-indigo-400 space-y-1 leading-relaxed">
                <li>
                  • MobileNet v2 runs <strong>entirely in your browser</strong>{" "}
                  — no data is sent to any server.
                </li>
                <li>
                  • The model identifies over 1 000 object classes and maps them
                  to waste categories.
                </li>
                <li>
                  • The highlighted bin shows which <strong>partition</strong>{" "}
                  of the smart dustbin to use.
                </li>
                <li>
                  • For best results, ensure the item is well-lit and centred in
                  the frame.
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

          {/* Scrollable chip row */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
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
