import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, Search, Check } from 'lucide-react';
import { getDepartmentsForCollege, DEFAULT_DEPARTMENTS } from '../constants/departments';

export default function SearchableDepartmentSelect({
  collegeId = 'aset',
  departments = [],
  selectedId,
  onChange,
  disabled = false,
  placeholder = 'Select Department'
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Compute safe department options with fallback logic
  const safeDepartments = useMemo(() => {
    return getDepartmentsForCollege(collegeId, departments);
  }, [collegeId, departments]);

  // Search filter
  const filtered = useMemo(() => {
    if (!search.trim()) return safeDepartments;
    const lowerSearch = search.toLowerCase();
    return safeDepartments.filter(d => 
      (d.name && d.name.toLowerCase().includes(lowerSearch)) || 
      (d.label && d.label.toLowerCase().includes(lowerSearch)) ||
      (d.code && d.code.toLowerCase().includes(lowerSearch))
    );
  }, [safeDepartments, search]);

  const selectedDepartment = useMemo(() => {
    if (!selectedId) return null;
    return safeDepartments.find(
      d => d.id === selectedId || d.value === selectedId || d.code.toLowerCase() === String(selectedId).toLowerCase()
    ) || null;
  }, [safeDepartments, selectedId]);

  // Click outside to close
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
      } else if (highlightedIndex === 0) {
        onChange('');
        setIsOpen(false);
      } else if (highlightedIndex > 0 && highlightedIndex <= filtered.length) {
        const item = filtered[highlightedIndex - 1];
        onChange(item.id || item.value);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex(prev => Math.min(prev + 1, filtered.length));
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

  const renderDepartmentLabel = (d) => {
    if (!d) return placeholder;
    return d.label || d.name || placeholder;
  };

  return (
    <div 
      ref={containerRef}
      onKeyDown={handleKeyDown}
      style={{ position: 'relative', width: '100%' }}
      id="department-select-container"
    >
      <div
        role="combobox"
        aria-expanded={isOpen}
        aria-controls="department-listbox"
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        id="department-select-trigger"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 14px',
          backgroundColor: 'var(--bg-primary)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          color: selectedDepartment ? 'var(--text-primary)' : 'var(--text-secondary)',
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
          {renderDepartmentLabel(selectedDepartment)}
        </span>
        <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s ease' }} />
      </div>

      {isOpen && (
        <div
          role="listbox"
          id="department-listbox"
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
              placeholder="Search department..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setHighlightedIndex(-1); }}
              onClick={(e) => e.stopPropagation()}
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

          {/* First Option: Select Department */}
          <div
            role="option"
            aria-selected={!selectedId}
            onClick={() => { onChange(''); setIsOpen(false); }}
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '13px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              backgroundColor: highlightedIndex === 0 ? 'var(--border-color)' : 'transparent',
              fontStyle: 'italic'
            }}
            onMouseOver={() => setHighlightedIndex(0)}
          >
            Select Department
          </div>

          {filtered.length === 0 ? (
            <div style={{ padding: '8px 12px', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center' }}>
              No departments found
            </div>
          ) : (
            filtered.map((d, index) => {
              const itemVal = d.id || d.value;
              const isSelected = selectedId === itemVal || (selectedDepartment && (selectedDepartment.id === itemVal || selectedDepartment.value === itemVal));
              const isHighlighted = (index + 1) === highlightedIndex;
              return (
                <div
                  key={itemVal || index}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => { onChange(itemVal); setIsOpen(false); }}
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
                  onMouseOver={() => setHighlightedIndex(index + 1)}
                >
                  <span>{d.label || d.name}</span>
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
