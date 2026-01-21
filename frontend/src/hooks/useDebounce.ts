import { useState, useEffect } from 'react';

/**
 * useDebounce - Debounce a value by a specified delay.
 *
 * Returns the debounced value which updates only after the delay
 * has passed without the input value changing.
 *
 * @param value - The value to debounce
 * @param delay - The debounce delay in milliseconds (default: 300ms)
 *
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * function SearchBar() {
 *   const [query, setQuery] = useState('');
 *   const debouncedQuery = useDebounce(query, 300);
 *
 *   // This effect only runs when user stops typing for 300ms
 *   useEffect(() => {
 *     if (debouncedQuery) {
 *       performSearch(debouncedQuery);
 *     }
 *   }, [debouncedQuery]);
 *
 *   return (
 *     <input
 *       value={query}
 *       onChange={(e) => setQuery(e.target.value)}
 *       placeholder="Search..."
 *     />
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With form validation
 * function EmailInput() {
 *   const [email, setEmail] = useState('');
 *   const debouncedEmail = useDebounce(email, 500);
 *   const [isValidating, setIsValidating] = useState(false);
 *
 *   useEffect(() => {
 *     if (debouncedEmail) {
 *       setIsValidating(true);
 *       checkEmailAvailability(debouncedEmail)
 *         .then(/* handle result *\/)
 *         .finally(() => setIsValidating(false));
 *     }
 *   }, [debouncedEmail]);
 *
 *   return (
 *     <div>
 *       <input value={email} onChange={(e) => setEmail(e.target.value)} />
 *       {isValidating && <span>Checking...</span>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Set up the timeout
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up on value change or unmount
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
