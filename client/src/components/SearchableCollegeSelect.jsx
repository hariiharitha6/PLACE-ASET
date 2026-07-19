import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';

export default function SearchableCollegeSelect({
  colleges,
  selectedId,
  onChange,
  disabled,
  placeholder = 'Select College'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Filter colleges based on search query
  const filtered = colleges.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    (c.full_name && c.full_name.toLowerCase().includes(search.toLowerCase()))
  );

  const selectedCollege = colleges.find(c => c.id === selectedId);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        onChange(filtered[highlightedIndex].id);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex(prev => Math.min(prev + 1, filtered.length - 1));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (isOpen) {
        setHighlightedIndex(prev => Math.max(prev - 1, 0));
      }
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  return (
    <div 
      ref={containerRef}
      onKeyDown={handleKeyDown}
      style={{ position: 'relative', width: '100%' }}
    >
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="college-listbox"
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          color: selectedCollege ? 'var(--text-primary)' : 'var(--text-secondary)',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          outline: 'none',
          fontSize: '14px',
          transition: 'border-color 0.15s ease'
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-color)'; }}
        onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
      >
        <span>
          {selectedCollege ? (selectedCollege.name === 'ASET' ? 'ASET (Ahalia School of Engineering and Technology)' : selectedCollege.name) : placeholder}
        </span>
        <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
      </div>

      {isOpen && (
        <div
          role="listbox"
          id="college-listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            zIndex: 1000,
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
            padding: '8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            maxHeight: '240px',
            overflowY: 'auto'
          }}
        >
          {/* Search box inside dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 10px', borderBottom: '1px solid var(--border-color)', marginBottom: '4px' }}>
            <Search size={14} style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search college..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setHighlightedIndex(-1); }}
              onClick={(e) => e.stopPropagation()} // Prevent closing dropdown on input click
              style={{
                border: 'none',
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                outline: 'none',
                width: '100%',
                fontSize: '13px'
              }}
              autoFocus
            />
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              No colleges found
            </div>
          ) : (
            filtered.map((c, index) => {
              const isSelected = c.id === selectedId;
              const isHighlighted = index === highlightedIndex;
              return (
                <div
                  key={c.id}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => { onChange(c.id); setIsOpen(false); }}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '13px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? 'var(--bg-glass-hover)' : isHighlighted ? 'var(--border-color)' : 'transparent',
                    color: isSelected ? 'var(--accent-color)' : 'var(--text-primary)',
                    fontWeight: isSelected ? '600' : 'normal',
                    transition: 'background-color 0.15s ease'
                  }}
                  onMouseOver={() => setHighlightedIndex(index)}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span>{c.name}</span>
                    {c.full_name && c.full_name !== c.name && (
                      <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {c.full_name}
                      </span>
                    )}
                  </div>
                  {isSelected && <Check size={14} style={{ color: 'var(--accent-color)' }} />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
