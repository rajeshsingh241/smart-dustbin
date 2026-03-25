// lib/wasteCategories.ts

export type WasteCategory = 'recyclable' | 'non-recyclable' | 'unknown';

export type WasteType =
  | 'plastic'
  | 'glass'
  | 'metal'
  | 'paper'
  | 'cardboard'
  | 'e-waste'
  | 'organic'
  | 'general-waste'
  | 'unknown';

export interface WasteClassificationResult {
  category: WasteCategory;
  wasteType: WasteType;
  confidence: number;
  label: string;
  description: string;
  partition: 'recyclable' | 'non-recyclable';
  disposalTip: string;
  rawPredictions: Array<{ className: string; probability: number }>;
}

// ─── Recyclable Keyword Map ───────────────────────────────────────────────────
// Keys are lowercase substrings that may appear in a MobileNet className.
export const RECYCLABLE_MAPPING: Record<
  string,
  { type: WasteType; label: string; tip: string }
> = {
  // ── Plastic ────────────────────────────────────────────────────────────────
  'water bottle': {
    type: 'plastic',
    label: 'Plastic Water Bottle',
    tip: 'Rinse thoroughly and crush before placing in the recycling bin.',
  },
  'pop bottle': {
    type: 'plastic',
    label: 'Plastic Soda Bottle',
    tip: 'Remove the cap, rinse, and crush to save space.',
  },
  'plastic bag': {
    type: 'plastic',
    label: 'Plastic Bag',
    tip: 'Take to a designated plastic-bag drop-off; do not place in kerbside bin.',
  },
  'pill bottle': {
    type: 'plastic',
    label: 'Plastic Pill Bottle',
    tip: 'Remove labels, rinse, and recycle as rigid plastic.',
  },
  'bucket': {
    type: 'plastic',
    label: 'Plastic Bucket',
    tip: 'Clean thoroughly; check the recycling number on the base.',
  },
  'bathtub': {
    type: 'plastic',
    label: 'Plastic Container',
    tip: 'Rinse clean and place in rigid-plastic recycling.',
  },

  // ── Glass ──────────────────────────────────────────────────────────────────
  'beer bottle': {
    type: 'glass',
    label: 'Glass Beer Bottle',
    tip: 'Rinse and remove metal caps before placing in glass recycling.',
  },
  'wine bottle': {
    type: 'glass',
    label: 'Glass Wine Bottle',
    tip: 'Rinse well before placing in the glass recycling bank.',
  },
  'beer glass': {
    type: 'glass',
    label: 'Glass Tumbler',
    tip: 'Rinse and place in the glass recycling bin.',
  },
  'whiskey jug': {
    type: 'glass',
    label: 'Glass Jug',
    tip: 'Rinse and recycle in the glass bin.',
  },
  'cocktail shaker': {
    type: 'glass',
    label: 'Glass/Metal Container',
    tip: 'Separate glass from metal parts; recycle each accordingly.',
  },
  'carafe': {
    type: 'glass',
    label: 'Glass Carafe',
    tip: 'Rinse and place in glass recycling.',
  },
  'mason jar': {
    type: 'glass',
    label: 'Glass Jar',
    tip: 'Remove lid, rinse, and place in glass recycling.',
  },

  // ── Metal ──────────────────────────────────────────────────────────────────
  'beer can': {
    type: 'metal',
    label: 'Aluminium Can',
    tip: 'Rinse and crush lightly to save space in the recycling bin.',
  },
  'milk can': {
    type: 'metal',
    label: 'Metal Milk Can',
    tip: 'Clean thoroughly before placing in the metal recycling bin.',
  },
  'can opener': {
    type: 'metal',
    label: 'Metal Item',
    tip: 'Place in the metal/scrap recycling bin.',
  },
  'steel drum': {
    type: 'metal',
    label: 'Metal Drum',
    tip: 'Take to a scrap-metal facility for proper recycling.',
  },
  'safe': {
    type: 'metal',
    label: 'Metal Object',
    tip: 'Take to a scrap-metal recycling centre.',
  },
  'mailbox': {
    type: 'metal',
    label: 'Metal Mailbox',
    tip: 'Take to a scrap-metal or bulk recycling facility.',
  },
  'padlock': {
    type: 'metal',
    label: 'Metal Lock',
    tip: 'Place in metal recycling.',
  },
  'chain': {
    type: 'metal',
    label: 'Metal Chain',
    tip: 'Place in metal/scrap recycling.',
  },

  // ── Paper ──────────────────────────────────────────────────────────────────
  'newspaper': {
    type: 'paper',
    label: 'Newspaper',
    tip: 'Bundle neatly and place in the paper-recycling bin.',
  },
  'envelope': {
    type: 'paper',
    label: 'Paper Envelope',
    tip: 'Remove plastic windows; place remaining paper in recycling.',
  },
  'book jacket': {
    type: 'paper',
    label: 'Paper/Book Cover',
    tip: 'Place in paper recycling.',
  },
  'comic book': {
    type: 'paper',
    label: 'Paper/Magazine',
    tip: 'Recycle with mixed paper.',
  },
  'menu': {
    type: 'paper',
    label: 'Paper Menu',
    tip: 'Place in paper recycling if not laminated.',
  },
  'paper towel': {
    type: 'paper',
    label: 'Clean Paper Towel',
    tip: 'Only recyclable when completely unused/clean; used ones go in general waste.',
  },

  // ── Cardboard ──────────────────────────────────────────────────────────────
  'carton': {
    type: 'cardboard',
    label: 'Cardboard Carton',
    tip: 'Flatten before placing in the cardboard-recycling bin.',
  },
  'pencil box': {
    type: 'cardboard',
    label: 'Cardboard Box',
    tip: 'Flatten and place in cardboard recycling.',
  },
  'crate': {
    type: 'cardboard',
    label: 'Cardboard Crate',
    tip: 'Break down flat and place in cardboard recycling.',
  },
  'chest': {
    type: 'cardboard',
    label: 'Cardboard Chest',
    tip: 'Flatten and recycle with cardboard.',
  },

  // ── E-Waste ────────────────────────────────────────────────────────────────
  'computer keyboard': {
    type: 'e-waste',
    label: 'Keyboard (E-Waste)',
    tip: 'Take to a certified e-waste collection centre.',
  },
  'laptop': {
    type: 'e-waste',
    label: 'Laptop (E-Waste)',
    tip: 'Take to a certified e-waste recycler; wipe data first.',
  },
  'cellular telephone': {
    type: 'e-waste',
    label: 'Mobile Phone (E-Waste)',
    tip: 'Return to a phone retailer or e-waste facility; wipe data first.',
  },
  'remote control': {
    type: 'e-waste',
    label: 'Remote Control (E-Waste)',
    tip: 'Remove batteries (recycle separately) then take to e-waste centre.',
  },
  'radio': {
    type: 'e-waste',
    label: 'Electronics (E-Waste)',
    tip: 'Take to an e-waste collection facility.',
  },
  'television': {
    type: 'e-waste',
    label: 'TV (E-Waste)',
    tip: 'Take to an e-waste recycling centre; never place in general waste.',
  },
  'monitor': {
    type: 'e-waste',
    label: 'Monitor (E-Waste)',
    tip: 'Take to a certified e-waste collection point.',
  },
  'mouse': {
    type: 'e-waste',
    label: 'Computer Mouse (E-Waste)',
    tip: 'Take to an e-waste facility.',
  },
  'joystick': {
    type: 'e-waste',
    label: 'Game Controller (E-Waste)',
    tip: 'Take to an e-waste collection centre.',
  },
  'modem': {
    type: 'e-waste',
    label: 'Networking Device (E-Waste)',
    tip: 'Take to an e-waste facility or return to your ISP.',
  },
  'printer': {
    type: 'e-waste',
    label: 'Printer (E-Waste)',
    tip: 'Remove ink cartridges (recycle separately) then take to e-waste centre.',
  },
};

// ─── Non-Recyclable Keyword Map ───────────────────────────────────────────────
export const NON_RECYCLABLE_MAPPING: Record<
  string,
  { type: WasteType; label: string; tip: string }
> = {
  // ── Organic / Food ─────────────────────────────────────────────────────────
  'banana': {
    type: 'organic',
    label: 'Organic Food Waste',
    tip: 'Compost banana peels or dispose in organic/food-waste bin.',
  },
  'apple': {
    type: 'organic',
    label: 'Organic Food Waste',
    tip: 'Compost fruit scraps in a home compost or food-waste bin.',
  },
  'orange': {
    type: 'organic',
    label: 'Organic Food Waste',
    tip: 'Compost citrus peels or place in organic waste collection.',
  },
  'lemon': {
    type: 'organic',
    label: 'Organic Food Waste',
    tip: 'Compost or place in organic waste bin.',
  },
  'pizza': {
    type: 'organic',
    label: 'Food Waste',
    tip: 'Dispose of food waste in the general or organic waste bin.',
  },
  'hamburger': {
    type: 'organic',
    label: 'Food Waste',
    tip: 'Place in general/organic waste bin.',
  },
  'hot dog': {
    type: 'organic',
    label: 'Food Waste',
    tip: 'Dispose in general waste.',
  },
  'sandwich': {
    type: 'organic',
    label: 'Food Waste',
    tip: 'Place in general or organic waste bin.',
  },
  'french loaf': {
    type: 'organic',
    label: 'Organic/Food Waste',
    tip: 'Compost stale bread or place in organic waste bin.',
  },
  'meat loaf': {
    type: 'organic',
    label: 'Food Waste',
    tip: 'Place in general waste bin.',
  },
  'broccoli': {
    type: 'organic',
    label: 'Organic Vegetable Waste',
    tip: 'Compost vegetable scraps.',
  },
  'corn': {
    type: 'organic',
    label: 'Organic Waste',
    tip: 'Compost corn husks and cobs.',
  },
  'mushroom': {
    type: 'organic',
    label: 'Organic Waste',
    tip: 'Compost organic waste.',
  },
  'strawberry': {
    type: 'organic',
    label: 'Organic Food Waste',
    tip: 'Compost fruit waste.',
  },
  'ice cream': {
    type: 'organic',
    label: 'Food Waste',
    tip: 'Place liquid/food waste in general waste.',
  },
  'pretzel': {
    type: 'organic',
    label: 'Food Waste',
    tip: 'Place in general or organic waste bin.',
  },

  // ── General / Non-Recyclable Materials ─────────────────────────────────────
  'diaper': {
    type: 'general-waste',
    label: 'Hygiene Product',
    tip: 'Cannot be recycled — always dispose in general waste.',
  },
  'rubber eraser': {
    type: 'general-waste',
    label: 'Rubber Item',
    tip: 'Dispose in general waste bin.',
  },
  'face powder': {
    type: 'general-waste',
    label: 'Cosmetic Waste',
    tip: 'Dispose in general waste; check brand take-back programmes.',
  },
  'toilet tissue': {
    type: 'general-waste',
    label: 'Used Tissue/Paper',
    tip: 'Used hygiene paper cannot be recycled — place in general waste.',
  },
  'syringe': {
    type: 'general-waste',
    label: 'Medical/Sharps Waste',
    tip: 'Place in a sharps container and take to a medical waste disposal facility.',
  },
  'candle': {
    type: 'general-waste',
    label: 'Wax Candle',
    tip: 'Wax is not recyclable; dispose in general waste.',
  },
  'lighter': {
    type: 'general-waste',
    label: 'Disposable Lighter',
    tip: 'Ensure completely empty; dispose as hazardous waste.',
  },
  'band aid': {
    type: 'general-waste',
    label: 'Used Bandage',
    tip: 'Dispose of used medical dressings in general waste.',
  },
  'rubber glove': {
    type: 'general-waste',
    label: 'Rubber Gloves',
    tip: 'Dispose in general waste; not recyclable through kerbside collection.',
  },
  'shower cap': {
    type: 'general-waste',
    label: 'Plastic Film (Non-Recyclable)',
    tip: 'Dispose in general waste bin.',
  },
  'toothbrush': {
    type: 'general-waste',
    label: 'Used Toothbrush',
    tip: 'Check brand recycling schemes; otherwise place in general waste.',
  },
  'styrofoam': {
    type: 'general-waste',
    label: 'Polystyrene/Styrofoam',
    tip: 'Not accepted in kerbside recycling — check specialist drop-off points.',
  },
  'foam': {
    type: 'general-waste',
    label: 'Foam Packaging',
    tip: 'Dispose in general waste unless a specialist foam recycler is available.',
  },
};

// ─── Classification Helper ────────────────────────────────────────────────────

/**
 * Maps an array of MobileNet predictions to a human-friendly
 * WasteClassificationResult, checking all keyword aliases.
 */
export function classifyWaste(
  predictions: Array<{ className: string; probability: number }>
): WasteClassificationResult {
  for (const prediction of predictions) {
    // MobileNet sometimes returns comma-separated synonyms, e.g.
    // "water bottle, plastic bottle" — check each token separately.
    const tokens = prediction.className
      .toLowerCase()
      .split(',')
      .map((t) => t.trim());

    for (const token of tokens) {
      // ── Check recyclable map ────────────────────────────────────────────
      for (const [keyword, info] of Object.entries(RECYCLABLE_MAPPING)) {
        if (token.includes(keyword)) {
          return {
            category: 'recyclable',
            wasteType: info.type,
            confidence: prediction.probability,
            label: info.label,
            description: `This item is ${info.type} and can be recycled through the appropriate channel.`,
            partition: 'recyclable',
            disposalTip: info.tip,
            rawPredictions: predictions,
          };
        }
      }

      // ── Check non-recyclable map ────────────────────────────────────────
      for (const [keyword, info] of Object.entries(NON_RECYCLABLE_MAPPING)) {
        if (token.includes(keyword)) {
          return {
            category: 'non-recyclable',
            wasteType: info.type,
            confidence: prediction.probability,
            label: info.label,
            description: `This item cannot be recycled through standard kerbside collection.`,
            partition: 'non-recyclable',
            disposalTip: info.tip,
            rawPredictions: predictions,
          };
        }
      }
    }
  }

  // ── Fallback: unknown ─────────────────────────────────────────────────────
  return {
    category: 'unknown',
    wasteType: 'unknown',
    confidence: predictions[0]?.probability ?? 0,
    label: predictions[0]?.className ?? 'Unknown Item',
    description:
      'The model could not confidently identify this item as recyclable or non-recyclable.',
    partition: 'non-recyclable',
    disposalTip:
      'When uncertain, place in the general waste bin to avoid contaminating the recycling stream.',
    rawPredictions: predictions,
  };
}

// ─── UI Helpers ───────────────────────────────────────────────────────────────

export const WASTE_TYPE_COLORS: Record<WasteType, string> = {
  plastic: 'blue',
  glass: 'cyan',
  metal: 'slate',
  paper: 'yellow',
  cardboard: 'amber',
  'e-waste': 'purple',
  organic: 'lime',
  'general-waste': 'gray',
  unknown: 'gray',
};

export const WASTE_TYPE_ICONS: Record<WasteType, string> = {
  plastic: '🧴',
  glass: '🍶',
  metal: '🥫',
  paper: '📄',
  cardboard: '📦',
  'e-waste': '💻',
  organic: '🍌',
  'general-waste': '🗑️',
  unknown: '❓',
};

export const CATEGORY_BADGE: Record<WasteCategory, { text: string; bg: string; border: string; text_color: string }> = {
  recyclable: {
    text: 'RECYCLABLE',
    bg: 'bg-green-100 dark:bg-green-900/40',
    border: 'border-green-400 dark:border-green-600',
    text_color: 'text-green-800 dark:text-green-300',
  },
  'non-recyclable': {
    text: 'NON-RECYCLABLE',
    bg: 'bg-red-100 dark:bg-red-900/40',
    border: 'border-red-400 dark:border-red-600',
    text_color: 'text-red-800 dark:text-red-300',
  },
  unknown: {
    text: 'UNKNOWN',
    bg: 'bg-gray-100 dark:bg-gray-800',
    border: 'border-gray-400 dark:border-gray-600',
    text_color: 'text-gray-700 dark:text-gray-300',
  },
};
