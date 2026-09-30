export type DistrictName =
  | '桃園區'
  | '中壢區'
  | '蘆竹區'
  | '龜山區'
  | '八德區'
  | '大園區'
  | '大溪區'
  | '平鎮區';

export type BudgetRange = 'all' | '100' | '100-200' | '200-400' | '400-800' | '800+';

export interface HourSlot {
  open: string;
  close: string;
  overnight: boolean;
}

export interface Restaurant {
  id: string;
  name: string;
  district: string | null;
  address: string | null;
  phone: string | null;
  lat: number | null;
  lng: number | null;
  google_place_id: string | null;
  cuisine: string[];
  price_min: number | null;
  price_max: number | null;
  price_raw: string | null;
  hours: HourSlot[];
  hours_raw: string | null;
  hours_parsed: boolean;
  closed_days: number[];
  curator_note: string;
  confidence: 'high' | 'med' | 'none';
  notes?: string;
  sources: string[];
}

export interface SeedData {
  meta: {
    scope: string;
    districts: DistrictName[];
    cuisines: string[];
    generated_at: string;
    source_list: string;
    method: string[];
    coverage: {
      total: number;
      with_address: number;
      with_hours: number;
      with_price: number;
      with_district: number;
    };
    caveats: string[];
  };
  restaurants: Restaurant[];
}

export interface FilterState {
  districts: DistrictName[];
  cuisines: string[];
  macroCuisines: string[];
  budget: BudgetRange;
  openNow: boolean;
}

export type ExitMode = 'select' | 'fair_spin' | 'weighted_spin';

export interface SimulationTime {
  isSimulated: boolean;
  day: number; // 0-6
  hour: number; // 0-23
  minute: number; // 0-59
}
