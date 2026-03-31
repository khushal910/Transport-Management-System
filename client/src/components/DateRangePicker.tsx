import { useState, useRef, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaCalendar } from 'react-icons/fa';

export default function DateRangePicker({ startDate, endDate, onDateChange, onApply }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selecting, setSelecting] = useState('start'); // 'start' or 'end'
  const [tempStartDate, setTempStartDate] = useState(new Date(startDate));
  const [tempEndDate, setTempEndDate] = useState(new Date(endDate));
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isDateInRange = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date >= tempStartDate && date <= tempEndDate;
  };

  const isStartDate = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === tempStartDate.toDateString();
  };

  const isEndDate = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    return date.toDateString() === tempEndDate.toDateString();
  };

  const handleDayClick = (day) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);

    if (selecting === 'start') {
      setTempStartDate(date);
      setSelecting('end');
      // Auto-advance if end date is before new start date
      if (date > tempEndDate) {
        setTempEndDate(date);
      }
    } else {
      if (date < tempStartDate) {
        setTempStartDate(date);
        setTempEndDate(date);
        setSelecting('end');
      } else {
        setTempEndDate(date);
        setSelecting('start');
      }
    }
  };

  const handleApply = () => {
    onDateChange({
      startDate: tempStartDate.toISOString().split('T')[0],
      endDate: tempEndDate.toISOString().split('T')[0],
    });
    setIsOpen(false);
    onApply?.();
  };

  const handleReset = () => {
    setTempStartDate(new Date(startDate));
    setTempEndDate(new Date(endDate));
    setSelecting('start');
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    // Empty cells before the first day
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const isInRange = isDateInRange(day);
      const isStart = isStartDate(day);
      const isEnd = isEndDate(day);

      days.push(
        <button
          key={day}
          onClick={() => handleDayClick(day)}
          className={`p-2 text-sm rounded transition ${
            isStart
              ? 'bg-blue-600 text-white font-bold'
              : isEnd
              ? 'bg-blue-600 text-white font-bold'
              : isInRange
              ? 'bg-blue-100 text-gray-900'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const startDateStr = tempStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const endDateStr = tempEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const daysDiff = Math.ceil((tempEndDate - tempStartDate) / (1000 * 60 * 60 * 24)) + 1;

  return (
    <div className="relative inline-block w-full" ref={pickerRef}>
      {/* Display Box */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg flex items-center justify-between hover:shadow-md transition cursor-pointer"
      >
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 text-gray-700 font-medium">
            <FaCalendar className="text-blue-600" />
            <span>{startDateStr}</span>
            <span className="text-gray-400">→</span>
            <span>{endDateStr}</span>
          </div>
          <div className="text-xs text-gray-600 mt-1 font-semibold">
            {daysDiff} day{daysDiff !== 1 ? 's' : ''} selected • {selecting === 'start' ? 'Select Start Date' : 'Select End Date'}
          </div>
        </div>
        <FaChevronRight className={`text-blue-600 transition ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {/* Calendar Picker */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white border-2 border-blue-300 rounded-lg shadow-xl z-50 p-6 min-w-max">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded transition"
            >
              <FaChevronLeft className="text-gray-600" />
            </button>
            <h3 className="text-lg font-bold text-gray-900 min-w-48 text-center">{monthYear}</h3>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded transition"
            >
              <FaChevronRight className="text-gray-600" />
            </button>
          </div>

          {/* Day Labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="w-10 text-center text-xs font-bold text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-6 bg-gray-50 p-3 rounded">
            {renderCalendar()}
          </div>

          {/* Selected Dates Summary */}
          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-600 font-semibold">START DATE</p>
                <p className="text-base font-bold text-blue-700">{startDateStr}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 font-semibold">END DATE</p>
                <p className="text-base font-bold text-blue-700">{endDateStr}</p>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-700 font-semibold">
              Duration: {daysDiff} days
            </div>
          </div>

          {/* Selection Mode Indicator */}
          <div className="mb-4 p-2 bg-gradient-to-r from-amber-50 to-amber-100 border border-amber-200 rounded text-xs font-medium text-amber-800">
            <span className="font-bold">Mode:</span> {selecting === 'start' ? '📅 Select Start Date' : '📅 Select End Date'}
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium text-sm"
            >
              Reset
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
