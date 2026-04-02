import React from 'react';
import { useSidebar } from '../context/SidebarContext';

interface PaginationContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Pagination container that coordinates with sidebar state
 * Automatically adjusts position when sidebar opens/closes
 */
export const PaginationContainer: React.FC<PaginationContainerProps> = ({
  children,
  className = '',
}) => {
  const { sidebarOpen } = useSidebar();

  return (
    <div
      className={`fixed bottom-0 bg-white border-t border-gray-200 p-4 flex justify-between items-center shadow-lg z-50 transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'left-64' : 'left-20'
      } right-0 ${className}`}
    >
      {children}
    </div>
  );
};

export default PaginationContainer;
