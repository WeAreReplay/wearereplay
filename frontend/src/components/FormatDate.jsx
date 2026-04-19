/*
  ! FormatDate
  --------------------------------------------------
  ? format raw date strings into a readable format

  * Input:
  * - dateString (string | null | undefined): raw ISO or date string
  
  * Output:
  * - formatted date string (e.g. "Apr 19, 2026") or "—" if empty
*/

export const FormatDate = (dateString) => {
  /*
    ! Fallback handling
    * If no date exists, return a dash placeholder
  */
  if (!dateString) return "—";

  /*
    ! Date formatting
    * Converts raw date into readable format:
    * Example: 2026-04-19 → Apr 19, 2026
  */
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};
