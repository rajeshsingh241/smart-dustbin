export interface Dustbin {
  id: string;
  location: string;
  address: string;
  fillLevel: number;
  latitude: number;
  longitude: number;
  status: "normal" | "warning" | "critical";
  lastUpdated: string;
  zone: string;
  recyclableFillLevel?: number;
  nonRecyclableFillLevel?: number;
}

export interface Alert {
  id: string;
  dustbinId: string;
  location: string;
  message: string;
  timestamp: string;
  status: "sent" | "pending";
  sentTo: string[];
}

export type WasteCategory = "recyclable" | "non-recyclable" | "unknown";

export type WasteType =
  | "plastic"
  | "glass"
  | "metal"
  | "paper"
  | "cardboard"
  | "e-waste"
  | "organic"
  | "general-waste"
  | "unknown";

export interface WasteClassificationResult {
  category: WasteCategory;
  wasteType: WasteType;
  confidence: number;
  label: string;
  description: string;
  partition: "recyclable" | "non-recyclable";
  disposalTip: string;
  rawPredictions: Array<{ className: string; probability: number }>;
}

export interface ClassificationHistoryEntry extends WasteClassificationResult {
  id: string;
  imageUrl: string;
  timestamp: string;
  dustbinId?: string;
}

export interface PartitionStats {
  recyclableCount: number;
  nonRecyclableCount: number;
  unknownCount: number;
  totalClassifications: number;
  recyclablePercentage: number;
  nonRecyclablePercentage: number;
  topWasteTypes: Array<{ type: WasteType; count: number }>;
}
