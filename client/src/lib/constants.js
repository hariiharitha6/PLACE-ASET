export const APP_NAME = 'PLACE@ASET';
export const APP_FULL_NAME = 'Platform for Learning And Competitive Excellence';
export const APP_DESCRIPTION = 'Competitive Learning & Assessment Platform for placement preparation, aptitude training, weekly challenges, and collaborative learning.';

export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  COLLEGE_ADMIN: 'college_admin',
  HOST: 'host',
  FACULTY: 'faculty',
  STUDENT: 'student',
  GUEST: 'guest',
};

export const DIFFICULTY_LEVELS = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard',
};

export const QUESTION_CATEGORIES = {
  QUANTITATIVE_APTITUDE: 'quantitative_aptitude',
  LOGICAL_REASONING: 'logical_reasoning',
  VERBAL_APTITUDE: 'verbal_aptitude',
  TECHNICAL_APTITUDE: 'technical_aptitude',
};

export const TECHNICAL_SUBCATEGORIES = [
  'C', 'C++', 'Java', 'Python',
  'DBMS', 'OS', 'CN', 'OOP', 'DSA',
];

export const CHALLENGE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ACTIVE: 'active',
  ENDED: 'ended',
  CANCELLED: 'cancelled',
};

export const COMPANIES = [
  { name: 'TCS', slug: 'tcs' },
  { name: 'Infosys', slug: 'infosys' },
  { name: 'Wipro', slug: 'wipro' },
  { name: 'Cognizant', slug: 'cognizant' },
  { name: 'Accenture', slug: 'accenture' },
  { name: 'Capgemini', slug: 'capgemini' },
  { name: 'IBM', slug: 'ibm' },
  { name: 'Deloitte', slug: 'deloitte' },
  { name: 'EY', slug: 'ey' },
  { name: 'KPMG', slug: 'kpmg' },
  { name: 'Amazon', slug: 'amazon' },
  { name: 'Google', slug: 'google' },
  { name: 'Microsoft', slug: 'microsoft' },
];

export const XP_VALUES = {
  EASY: 10,
  MEDIUM: 20,
  HARD: 30,
  CHALLENGE_BONUS: 50,
  CONTRIBUTION_APPROVED: 25,
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};
