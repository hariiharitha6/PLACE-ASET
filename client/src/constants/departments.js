/**
 * Centralized Department Constants & Helpers for PLACE@ASET
 */

export const DEFAULT_DEPARTMENTS = [
  {
    id: 'cse',
    value: 'cse',
    code: 'CSE',
    name: 'Computer Science and Engineering (CSE)',
    label: 'Computer Science and Engineering (CSE)'
  },
  {
    id: 'aiml',
    value: 'aiml',
    code: 'AIML',
    name: 'Artificial Intelligence and Machine Learning (AIML)',
    label: 'Artificial Intelligence and Machine Learning (AIML)'
  },
  {
    id: 'ece',
    value: 'ece',
    code: 'ECE',
    name: 'Electronics and Communication Engineering (ECE)',
    label: 'Electronics and Communication Engineering (ECE)'
  },
  {
    id: 'eee',
    value: 'eee',
    code: 'EEE',
    name: 'Electrical and Electronics Engineering (EEE)',
    label: 'Electrical and Electronics Engineering (EEE)'
  },
  {
    id: 'me',
    value: 'me',
    code: 'ME',
    name: 'Mechanical Engineering (ME)',
    label: 'Mechanical Engineering (ME)'
  },
  {
    id: 'ce',
    value: 'ce',
    code: 'CE',
    name: 'Civil Engineering (CE)',
    label: 'Civil Engineering (CE)'
  }
];

/**
 * Normalizes a list of departments or returns the default ASET departments fallback.
 * Guarantees the resulting array is never empty.
 */
export function getDepartmentsForCollege(collegeId, fetchedDepts = []) {
  if (Array.isArray(fetchedDepts) && fetchedDepts.length > 0) {
    return fetchedDepts.map(d => ({
      id: d.id || d.value || (d.code ? d.code.toLowerCase() : String(d.name).toLowerCase()),
      value: d.id || d.value || (d.code ? d.code.toLowerCase() : String(d.name).toLowerCase()),
      code: d.code || d.value?.toUpperCase() || '',
      name: d.name || d.label,
      label: d.label || (d.name && d.code && !d.name.includes(`(${d.code})`) ? `${d.name} (${d.code})` : d.name || d.label)
    }));
  }

  return DEFAULT_DEPARTMENTS;
}
