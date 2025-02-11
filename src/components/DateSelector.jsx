import React, { useState, useRef, useEffect } from 'react';
import { MdCalendarToday, MdArrowForward, MdArrowBack } from 'react-icons/md';

const getCurrentMonth = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export default function DateSelector({ value = getCurrentMonth(), onChange, className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentDate = value ? new Date(value + '-01') : new Date();
  const handleClickOutside = useRef(null); // Changed to useRef

  // Create the handler once when component mounts
  useEffect(() => {
    handleClickOutside.current = (event) => {
      // Check if click is outside and dropdown is open
      if (dropdownRef.current && 
          !dropdownRef.current.contains(event.target) && 
          isOpen) {
        setIsOpen(false);
      }
    };

    return () => {
      // Cleanup on unmount
      if (handleClickOutside.current) {
        document.removeEventListener('mousedown', handleClickOutside.current);
      }
    };
  }, []); // Empty dependency array - only run on mount

  // Handle attaching/detaching listener when isOpen changes
  useEffect(() => {
    if (isOpen && handleClickOutside.current) {
      document.addEventListener('mousedown', handleClickOutside.current);
    }
    return () => {
      if (handleClickOutside.current) {
        document.removeEventListener('mousedown', handleClickOutside.current);
      }
    };
  }, [isOpen]);

  const handlePrevMonth = () => {
    const date = new Date(currentDate.setMonth(currentDate.getMonth() - 1));
    onChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleNextMonth = () => {
    const date = new Date(currentDate.setMonth(currentDate.getMonth() + 1));
    onChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleYearChange = (year) => {
    const date = new Date(currentDate);
    date.setFullYear(year);
    onChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
  };

  const handleMonthSelect = (monthIndex) => {
    const date = new Date(currentDate);
    date.setMonth(monthIndex);
    onChange(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    setIsOpen(false);
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const years = Array.from({ length: 10 }, (_, i) => currentDate.getFullYear() - 5 + i);

  return (
    <div className={`flex items-center gap-1 sm:gap-2 ${className}`} ref={dropdownRef}>
      <button
        onClick={handlePrevMonth}
        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Previous month"
      >
        <MdArrowBack className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
      </button>
      
      <div className="flex-1 sm:flex-none relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 
                    bg-white border border-gray-200 rounded-lg shadow-sm hover:border-gray-300"
        >
          <MdCalendarToday className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 truncate">
            {value ? formatDate(currentDate) : 'Select Month'}
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-20">
            {/* Year selector */}
            <select
              value={currentDate.getFullYear()}
              onChange={(e) => handleYearChange(parseInt(e.target.value))}
              className="w-full mb-2 px-2 py-1.5 border border-gray-200 rounded text-sm"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            {/* Months grid */}
            <div className="grid grid-cols-3 gap-1">
              {months.map((month, index) => (
                <button
                  key={month}
                  onClick={() => handleMonthSelect(index)}
                  className={`p-2 text-sm rounded
                    ${currentDate.getMonth() === index 
                      ? 'bg-blue-500 text-white' 
                      : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  {month.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <button
        onClick={handleNextMonth}
        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Next month"
      >
        <MdArrowForward className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
      </button>
    </div>
  );
}
