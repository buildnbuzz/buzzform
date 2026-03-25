/**
 * Clamp a number between min and max bounds.
 *
 * @param value - The number to clamp
 * @param min - Minimum bound (optional)
 * @param max - Maximum bound (optional)
 * @returns Clamped number
 *
 * @example
 * clampNumber(5, 0, 10) // => 5
 * clampNumber(-5, 0, 10) // => 0
 * clampNumber(15, 0, 10) // => 10
 */
export function clampNumber(
  value: number,
  min?: number,
  max?: number,
): number {
  let result = value;
  if (min !== undefined && result < min) result = min;
  if (max !== undefined && result > max) result = max;
  return result;
}

/**
 * Apply numeric precision (decimal places) to a number.
 *
 * @param value - The number to format
 * @param precision - Number of decimal places
 * @returns Formatted number or undefined if input is undefined
 *
 * @example
 * applyNumericPrecision(3.14159, 2) // => 3.14
 * applyNumericPrecision(10, 2) // => 10
 */
export function applyNumericPrecision(
  value: number | undefined,
  precision?: number,
): number | undefined {
  if (value === undefined || precision === undefined) return value;
  return parseFloat(value.toFixed(precision));
}

/**
 * Format a number with thousand separators.
 *
 * @param value - The number to format
 * @param separator - Separator character (default: ',')
 * @returns Formatted string or empty string if value is undefined/NaN
 *
 * @example
 * formatNumberWithSeparator(1234567.89) // => '1,234,567.89'
 * formatNumberWithSeparator(1234567, ' ') // => '1 234 567'
 */
export function formatNumberWithSeparator(
  value: number | undefined,
  separator: string = ",",
): string {
  if (value === undefined || value === null || isNaN(value)) return "";
  const [intPart, decPart] = value.toString().split(".") as [string, string | undefined];
  const formattedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, separator);
  return decPart !== undefined ? `${formattedInt}.${decPart}` : formattedInt;
}

/**
 * Parse a formatted number string back to a number.
 *
 * @param str - Formatted string with separators
 * @param separator - Separator character to remove
 * @returns Parsed number or undefined if invalid
 *
 * @example
 * parseFormattedNumber('1,234,567.89') // => 1234567.89
 * parseFormattedNumber('1 234 567', ' ') // => 1234567
 */
export function parseFormattedNumber(
  str: string,
  separator: string = ",",
): number | undefined {
  if (!str || str === "") return undefined;
  const cleaned = str.split(separator).join("");
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}
