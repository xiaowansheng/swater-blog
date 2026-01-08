'use client';

import { useState, useRef, useEffect } from 'react';
import { KAOMOJI_EMOJIS } from './constants';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  trigger?: React.ReactNode;
}

export default function EmojiPicker({ onEmojiSelect, trigger }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('全部');
  const pickerRef = useRef<HTMLDivElement>(null);

  const categories = ['全部', ...Array.from(new Set(KAOMOJI_EMOJIS.map(e => e.category)))];

  const getScaleClass = (emoji: string) => {
    const length = [...emoji].length;
    if (length > 12) return 'scale-75';
    if (length > 8) return 'scale-90';
    return 'scale-100';
  };

  const filteredEmojis = activeCategory === '全部'
    ? KAOMOJI_EMOJIS
    : KAOMOJI_EMOJIS.filter(e => e.category === activeCategory);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleEmojiClick = (emoji: string) => {
    onEmojiSelect(emoji);
    setIsOpen(false);
  };

  return (
    <div ref={pickerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-pink-50 transition-colors duration-200 group"
        title="选择表情"
      >
        {trigger || (
          <svg className="w-6 h-6 text-pink-400 group-hover:text-pink-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 bottom-full left-0 mb-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border-2 border-pink-100 overflow-hidden animate-fade-in">
          <div className="flex gap-1 p-2 bg-gradient-to-r from-pink-50 to-purple-50 overflow-x-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-pink-100">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                  activeCategory === category
                    ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white shadow-md'
                    : 'hover:bg-pink-100 text-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="p-4 max-h-72 overflow-y-auto scrollbar-thin scrollbar-thumb-pink-300 scrollbar-track-pink-100">
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
              {filteredEmojis.map((emoji) => (
                <button
                  key={emoji.id}
                  type="button"
                  onClick={() => handleEmojiClick(emoji.name)}
                  className="w-12 h-12 sm:w-14 sm:h-14 p-2 text-xl sm:text-2xl hover:bg-pink-50 rounded-lg transition-all duration-200 text-center hover:scale-105 transform flex items-center justify-center leading-none overflow-hidden"
                  title={emoji.category}
                >
                  <span className={`block origin-center ${getScaleClass(emoji.name)}`}>{emoji.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="absolute bottom-2 right-2 w-12 h-12 opacity-10 pointer-events-none select-none">
            <span className="text-4xl">✨</span>
          </div>
        </div>
      )}
    </div>
  );
}
