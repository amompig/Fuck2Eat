import { DistrictName, FilterState } from '../types';

export const ALL_DISTRICTS: DistrictName[] = [
  '桃園區',
  '中壢區',
  '蘆竹區',
  '龜山區',
  '八德區',
  '大園區',
  '大溪區',
  '平鎮區',
];

export const DEFAULT_FILTERS: FilterState = {
  districts: [...ALL_DISTRICTS],
  cuisines: [],
  macroCuisines: [],
  budget: 'all',
  openNow: true,
};

export function parseFiltersFromUrl(): FilterState {
  if (typeof window === 'undefined') return DEFAULT_FILTERS;

  try {
    const params = new URLSearchParams(window.location.search);
    const dParam = params.get('d');
    const cParam = params.get('c');
    const mcParam = params.get('mc');
    const pParam = params.get('p');
    const openParam = params.get('open');

    let districts = DEFAULT_FILTERS.districts;
    if (dParam !== null) {
      if (dParam.trim() === '') {
        districts = [];
      } else {
        const parsed = dParam.split(',').filter((d) => ALL_DISTRICTS.includes(d as DistrictName));
        districts = parsed.length > 0 ? (parsed as DistrictName[]) : [];
      }
    }

    let cuisines: string[] = [];
    if (cParam) {
      cuisines = cParam.split(',').map((c) => c.trim()).filter(Boolean);
    }

    let macroCuisines: string[] = [];
    if (mcParam) {
      macroCuisines = mcParam.split(',').map((c) => c.trim()).filter(Boolean);
    }

    const budget = (pParam as FilterState['budget']) || 'all';
    const openNow = openParam !== null ? openParam === '1' : true;

    return {
      districts,
      cuisines,
      macroCuisines,
      budget,
      openNow,
    };
  } catch (err) {
    console.error('Failed to parse URL query params', err);
    return DEFAULT_FILTERS;
  }
}

export function syncFiltersToUrl(filters: FilterState, selectedId: string | null = null): void {
  if (typeof window === 'undefined') return;

  try {
    const params = new URLSearchParams();

    // Only write 'd' if different from all districts
    if (filters.districts.length !== ALL_DISTRICTS.length || !ALL_DISTRICTS.every((d) => filters.districts.includes(d))) {
      params.set('d', filters.districts.join(','));
    }

    if (filters.macroCuisines && filters.macroCuisines.length > 0) {
      params.set('mc', filters.macroCuisines.join(','));
    }

    if (filters.cuisines.length > 0) {
      params.set('c', filters.cuisines.join(','));
    }

    if (filters.budget !== 'all') {
      params.set('p', filters.budget);
    }

    if (!filters.openNow) {
      params.set('open', '0');
    } else {
      params.set('open', '1');
    }

    if (selectedId) {
      params.set('res', selectedId);
    }

    const queryString = params.toString();
    const newRelativePathQuery = queryString
      ? `${window.location.pathname}?${queryString}`
      : window.location.pathname;

    window.history.replaceState(null, '', newRelativePathQuery);
  } catch (err) {
    console.error('Failed to sync filters to URL', err);
  }
}

export function getSelectedIdFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('res');
}
