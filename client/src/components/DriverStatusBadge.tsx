import { FaCircle } from 'react-icons/fa';

export default function DriverStatusBadge({ status, size = 'md', showLabel = true, onClick = null }) {
  const statusColors = {
    available: {
      bg: 'bg-green-100',
      text: 'text-green-800',
      dot: 'bg-green-500',
      label: 'Available',
    },
    off_duty: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
      dot: 'bg-gray-500',
      label: 'Off Duty',
    },
    on_trip: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
      dot: 'bg-blue-500',
      label: 'On Trip',
    },
    suspended: {
      bg: 'bg-red-100',
      text: 'text-red-800',
      dot: 'bg-red-500',
      label: 'Suspended',
    },
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs gap-1',
    md: 'px-3 py-1 rounded-full text-sm gap-2 font-medium',
    lg: 'px-4 py-2 rounded-lg text-base gap-2 font-medium',
  };

  const dotSizes = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const color = statusColors[status] || statusColors.off_duty;
  const containerClass = `${sizeClasses[size]} ${color.bg} ${color.text} rounded-full flex items-center gap-2 inline-flex`;

  const content = (
    <>
      <FaCircle className={`${dotSizes[size]} ${color.dot}`} />
      {showLabel && color.label}
    </>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className={`${containerClass} hover:shadow-md transition cursor-pointer`}>
        {content}
      </button>
    );
  }

  return <div className={containerClass}>{content}</div>;
}
