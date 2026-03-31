import { useEffect, useRef, RefObject } from 'react';

/**
 * Custom hook to handle form field navigation with Enter key
 * - Auto-focuses first input field when form opens or dependency changes
 * - Enter key navigates to next field
 * - Enter on last field submits the form
 * 
 * @param {number} fields - Total number of input fields in the form
 * @param {function} onSubmit - Callback function to execute on form submission
 * @param {boolean|any} isOpen - Optional dependency to trigger focus when modal/form opens (e.g., isModalOpen)
 * @returns {object} - Object containing refs array and handler function
 */
export function useFormNavigation(fields: number, onSubmit: () => void, isOpen: boolean = true) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Auto-focus the first input field when component mounts or when form/modal opens
  useEffect(() => {
    if (isOpen && inputRefs.current.length > 0 && inputRefs.current[0]) {
      // Use setTimeout to ensure DOM has updated before focusing
      const timer = setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  /**
   * Handles Enter key press for field navigation
   * @param {KeyboardEvent} e - The keyboard event
   * @param {number} fieldIndex - The current field index
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, fieldIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      const isLastField = fieldIndex === fields - 1;

      if (isLastField) {
        // Submit the form if it's the last field
        if (onSubmit && typeof onSubmit === 'function') {
          onSubmit();
        }
      } else {
        // Move to next field
        const nextInput = inputRefs.current[fieldIndex + 1];
        if (nextInput) {
          nextInput.focus();
        }
      }
    }
  };

  return {
    inputRefs,
    handleKeyDown,
  };
}
