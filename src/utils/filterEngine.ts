import { Restaurant, FilterState, SimulationTime } from '../types';
import { matchesMacroCategories } from './cuisineMapping';

/**
 * Checks if a time string "HH:mm" is between open and close.
 * Special handling for overnight:
 * When overnight is true (e.g. open 17:00, close 02:00):
 * now >= open OR now <= close
 */
export function isSlotOpen(nowStr: string, openStr: string, closeStr: string, overnight: boolean): boolean {
  if (overnight) {
    // e.g. 17:00 to 02:00:
    // Any time >= 17:00 OR any time <= 02:00 is within operating hours.
    return nowStr >= openStr || nowStr <= closeStr;
  }
  // Standard day slot (e.g. 11:00 to 14:00)
  return nowStr >= openStr && nowStr <= closeStr;
}

/**
 * Determines whether a restaurant is open at a specified day of week (0=Sun..6=Sat) and time (HH:mm).
 * Returns true if open, false if closed.
 * Note: hours_parsed === false means it cannot be reliably structured;
 * per specification: hours_parsed=false does NOT pass the "open now" filter.
 */
export function isRestaurantOpenAt(
  restaurant: Restaurant,
  dayOfWeek: number,
  timeStr: string
): boolean {
  if (!restaurant.hours_parsed) {
    return false;
  }

  // Check if closed today
  if (restaurant.closed_days && restaurant.closed_days.includes(dayOfWeek)) {
    // If today is closed day, check if it's currently early morning (e.g. 01:00)
    // and yesterday was an open day that stayed open overnight into today!
    const yesterday = (dayOfWeek + 6) % 7;
    const yesterdayWasOpen = !restaurant.closed_days.includes(yesterday);
    if (yesterdayWasOpen) {
      const overnightSlot = restaurant.hours.find((h) => h.overnight);
      if (overnightSlot && timeStr <= overnightSlot.close) {
        return true;
      }
    }
    return false;
  }

  // If today is not closed, check if currently matching any of today's slots
  for (const slot of restaurant.hours) {
    if (isSlotOpen(timeStr, slot.open, slot.close, slot.overnight)) {
      return true;
    }
  }

  // Also check if current time is early morning carrying over from yesterday's overnight slot
  const yesterday = (dayOfWeek + 6) % 7;
  const yesterdayWasOpen = !restaurant.closed_days.includes(yesterday);
  if (yesterdayWasOpen) {
    const overnightSlot = restaurant.hours.find((h) => h.overnight);
    if (overnightSlot && timeStr <= overnightSlot.close) {
      return true;
    }
  }

  return false;
}

/**
 * Filter matching budget
 */
export function matchesBudget(restaurant: Restaurant, budget: FilterState['budget']): boolean {
  if (budget === 'all') return true;

  const min = restaurant.price_min;
  const max = restaurant.price_max;

  // If price is completely unknown, it cannot participate in specific budget filtering
  if (min === null && max === null) {
    return false;
  }

  const effectiveMin = min !== null ? min : max!;
  const effectiveMax = max !== null ? max : min!;

  switch (budget) {
    case '100':
      return effectiveMin <= 100;
    case '100-200':
      return effectiveMin <= 200 && effectiveMax >= 100;
    case '200-400':
      return effectiveMin <= 400 && effectiveMax >= 200;
    case '400-800':
      return effectiveMin <= 800 && effectiveMax >= 400;
    case '800+':
      return effectiveMax >= 800;
    default:
      return true;
  }
}

/**
 * Master filter engine
 */
export function filterRestaurants(
  restaurants: Restaurant[],
  filters: FilterState,
  simTime: SimulationTime
): Restaurant[] {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const nowStr = `${pad(simTime.hour)}:${pad(simTime.minute)}`;
  const currentDay = simTime.day;

  return restaurants.filter((r) => {
    // 1. District filter
    // If restaurant has district, must match selected districts.
    // If restaurant has null district, only include if all 8 districts are selected.
    if (r.district) {
      if (!filters.districts.includes(r.district as any)) {
        return false;
      }
    } else {
      // Unspecified district only appears if all 8 districts are checked
      if (filters.districts.length < 8) {
        return false;
      }
    }

    // 2. Converged Cuisine filter (Macro Categories)
    if (filters.macroCuisines && filters.macroCuisines.length > 0) {
      const matchMacro = matchesMacroCategories(r.cuisine, filters.macroCuisines);
      if (!matchMacro) return false;
    }

    // Optional legacy granular cuisine filter
    if (filters.cuisines.length > 0) {
      const hasMatch = r.cuisine.some((c) => filters.cuisines.includes(c));
      if (!hasMatch) return false;
    }

    // 3. Budget filter
    if (!matchesBudget(r, filters.budget)) {
      return false;
    }

    // 4. Open Now filter
    if (filters.openNow) {
      const isOpen = isRestaurantOpenAt(r, currentDay, nowStr);
      if (!isOpen) return false;
    }

    return true;
  });
}

/**
 * Calculate weight for weighted spin
 * Based on:
 * - confidence (high=3, med=2, none=1)
 * - has curator note (+2 if rich recommendation note)
 * - has full address (+1)
 */
export function calculateWeight(restaurant: Restaurant): number {
  let score = 1;
  if (restaurant.confidence === 'high') score += 2;
  else if (restaurant.confidence === 'med') score += 1;

  if (restaurant.curator_note && restaurant.curator_note.length > 5) {
    score += 2;
  }

  if (restaurant.address) {
    score += 1;
  }

  return score;
}
