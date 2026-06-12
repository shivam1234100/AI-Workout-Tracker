/**
 * Centralized, personalized health calculations.
 *
 * Single source of truth for BMR, resting energy, step-calories and distance so
 * every screen shows the SAME real, body-personalized numbers instead of generic
 * constants. All inputs come from the user's real profile + real pedometer steps.
 */

export interface BodyProfile {
    weight?: number | null; // kg
    height?: number | null; // cm
    gender?: string | null;
    age?: number | null;
}

// Fallbacks used only when the user hasn't filled in their profile yet.
const DEFAULT_WEIGHT = 70; // kg
const DEFAULT_HEIGHT = 170; // cm
const DEFAULT_AGE = 30; // years

/**
 * Basal Metabolic Rate (kcal/day) — Mifflin–St Jeor equation.
 * This is the body's resting energy expenditure over a full day.
 */
export function computeBMR({ weight, height, gender, age }: BodyProfile): number {
    const w = weight || DEFAULT_WEIGHT;
    const h = height || DEFAULT_HEIGHT;
    const a = age || DEFAULT_AGE;
    const base = 10 * w + 6.25 * h - 5 * a;
    return Math.round(gender?.toLowerCase() === 'female' ? base - 161 : base + 5);
}

/**
 * Resting energy actually burned so far today (kcal), scaled by how much of the
 * day has elapsed. Grows through the day from 0 toward the full daily BMR.
 */
export function restingCaloriesSoFar(profile: BodyProfile, now: Date = new Date()): number {
    const bmr = computeBMR(profile);
    const hoursPassed = now.getHours() + now.getMinutes() / 60;
    return Math.round(bmr * (hoursPassed / 24));
}

/**
 * Active calories burned from steps (kcal), personalized by body weight.
 * Baseline ≈ 0.04 kcal/step at 70 kg, scaled linearly with weight.
 */
export function caloriesFromSteps(steps: number, weight?: number | null): number {
    const w = weight || DEFAULT_WEIGHT;
    return Math.round(steps * 0.04 * (w / 70));
}

/**
 * Walking + running distance (km) from steps, using a height-derived stride
 * length (stride ≈ 41.5% of height) instead of a fixed average.
 */
export function distanceFromSteps(steps: number, height?: number | null): number {
    const h = height || DEFAULT_HEIGHT;
    const strideMeters = (h * 0.415) / 100;
    return (steps * strideMeters) / 1000;
}
