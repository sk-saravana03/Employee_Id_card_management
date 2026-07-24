/**
 * Designation → ID Card Theme Mapping
 *
 * Each theme defines the visual identity for the physical/digital ID card:
 *  - headerBg      : gradient for the top header band
 *  - headerText    : text / icon color inside the header
 *  - accentBorder  : card outer border + photo frame border
 *  - badgeColor    : employee ID badge chip style
 *  - bodyBg        : card body background + text color
 *  - accentGlow    : subtle glow class for premium look
 *  - stripColor    : back-side magnetic stripe color
 *  - label         : human-readable theme name shown in UI
 *  - dot           : small dot colour swatch shown in dropdowns/badges
 */

export const DESIGNATION_THEMES = {
  /** ── C-Suite / Executive Level ──────────────────────────────── */
  EXECUTIVE: {
    label: 'Executive Gold',
    dot: '#f59e0b',
    headerBg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
    headerText: '#f59e0b',
    accentBorder: '#f59e0b40',
    badgeBg: '#f59e0b15',
    badgeText: '#d97706',
    badgeBorder: '#f59e0b40',
    bodyBg: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    cardText: '#f1f5f9',
    subText: '#94a3b8',
    divider: '#334155',
    glow: '0 0 40px #f59e0b20, 0 4px 24px #0f172a80',
    stripBg: '#0f172a',
    chipColor: '#f59e0b33',
    chipText: '#f59e0b',
    keywords: ['ceo', 'cto', 'cfo', 'coo', 'ciso', 'chief', 'president', 'vp', 'vice president', 'director', 'executive', 'managing'],
  },

  /** ── Senior Management / Head Level ────────────────────────── */
  MANAGEMENT: {
    label: 'Management Indigo',
    dot: '#6366f1',
    headerBg: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #1e1b4b 100%)',
    headerText: '#a5b4fc',
    accentBorder: '#6366f140',
    badgeBg: '#6366f115',
    badgeText: '#4f46e5',
    badgeBorder: '#6366f140',
    bodyBg: 'linear-gradient(180deg, #1e1b4b 0%, #1e293b 100%)',
    cardText: '#e0e7ff',
    subText: '#818cf8',
    divider: '#312e81',
    glow: '0 0 40px #6366f125, 0 4px 24px #1e1b4b80',
    stripBg: '#1e1b4b',
    chipColor: '#6366f133',
    chipText: '#818cf8',
    keywords: ['manager', 'head', 'lead', 'senior manager', 'department head', 'team lead', 'supervisor', 'superintendent'],
  },

  /** ── Engineering / Technology ───────────────────────────────── */
  ENGINEER: {
    label: 'Tech Teal',
    dot: '#06b6d4',
    headerBg: 'linear-gradient(135deg, #0c4a6e 0%, #0e7490 40%, #134e4a 100%)',
    headerText: '#67e8f9',
    accentBorder: '#22d3ee40',
    badgeBg: '#06b6d415',
    badgeText: '#0891b2',
    badgeBorder: '#22d3ee40',
    bodyBg: 'linear-gradient(180deg, #0c4a6e 0%, #0f172a 100%)',
    cardText: '#ecfeff',
    subText: '#67e8f9',
    divider: '#0e7490',
    glow: '0 0 40px #06b6d425, 0 4px 24px #0c4a6e80',
    stripBg: '#083344',
    chipColor: '#06b6d433',
    chipText: '#22d3ee',
    keywords: ['engineer', 'developer', 'programmer', 'architect', 'devops', 'fullstack', 'frontend', 'backend', 'software', 'qa', 'tester', 'data scientist', 'ml', 'ai'],
  },

  /** ── Design / Creative ───────────────────────────────────────── */
  DESIGN: {
    label: 'Creative Violet',
    dot: '#8b5cf6',
    headerBg: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 50%, #701a75 100%)',
    headerText: '#d8b4fe',
    accentBorder: '#a855f740',
    badgeBg: '#8b5cf615',
    badgeText: '#7c3aed',
    badgeBorder: '#a855f740',
    bodyBg: 'linear-gradient(180deg, #2e1065 0%, #1a0533 100%)',
    cardText: '#faf5ff',
    subText: '#c4b5fd',
    divider: '#4c1d95',
    glow: '0 0 40px #8b5cf625, 0 4px 24px #2e106580',
    stripBg: '#1e0a4b',
    chipColor: '#8b5cf633',
    chipText: '#c4b5fd',
    keywords: ['designer', 'design', 'ui', 'ux', 'creative', 'graphic', 'brand', 'visual', 'illustrator', 'content', 'media', 'marketing', 'communications'],
  },

  /** ── Finance / Accounting ───────────────────────────────────── */
  FINANCE: {
    label: 'Finance Emerald',
    dot: '#10b981',
    headerBg: 'linear-gradient(135deg, #022c22 0%, #064e3b 50%, #052e16 100%)',
    headerText: '#34d399',
    accentBorder: '#10b98140',
    badgeBg: '#10b98115',
    badgeText: '#059669',
    badgeBorder: '#10b98140',
    bodyBg: 'linear-gradient(180deg, #022c22 0%, #0f172a 100%)',
    cardText: '#ecfdf5',
    subText: '#6ee7b7',
    divider: '#064e3b',
    glow: '0 0 40px #10b98125, 0 4px 24px #022c2280',
    stripBg: '#022c22',
    chipColor: '#10b98133',
    chipText: '#34d399',
    keywords: ['finance', 'financial', 'accountant', 'accounting', 'auditor', 'audit', 'treasurer', 'analyst', 'investment', 'budget', 'payroll', 'controller'],
  },

  /** ── Security / Safety ──────────────────────────────────────── */
  SECURITY: {
    label: 'Security Red',
    dot: '#ef4444',
    headerBg: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #3b0a0a 100%)',
    headerText: '#fca5a5',
    accentBorder: '#ef444440',
    badgeBg: '#ef444415',
    badgeText: '#dc2626',
    badgeBorder: '#ef444440',
    bodyBg: 'linear-gradient(180deg, #450a0a 0%, #0f172a 100%)',
    cardText: '#fff1f2',
    subText: '#fca5a5',
    divider: '#7f1d1d',
    glow: '0 0 40px #ef444425, 0 4px 24px #450a0a80',
    stripBg: '#2a0505',
    chipColor: '#ef444433',
    chipText: '#fca5a5',
    keywords: ['security', 'guard', 'officer', 'safety', 'compliance', 'protection', 'enforcement', 'patrol', 'surveillance'],
  },

  /** ── HR / People & Culture ──────────────────────────────────── */
  HR: {
    label: 'HR Rose',
    dot: '#f43f5e',
    headerBg: 'linear-gradient(135deg, #4c0519 0%, #881337 50%, #3b0764 100%)',
    headerText: '#fda4af',
    accentBorder: '#f43f5e40',
    badgeBg: '#f43f5e15',
    badgeText: '#e11d48',
    badgeBorder: '#f43f5e40',
    bodyBg: 'linear-gradient(180deg, #4c0519 0%, #1a0a2e 100%)',
    cardText: '#fff1f2',
    subText: '#fda4af',
    divider: '#881337',
    glow: '0 0 40px #f43f5e25, 0 4px 24px #4c051980',
    stripBg: '#2a0a14',
    chipColor: '#f43f5e33',
    chipText: '#fda4af',
    keywords: ['hr', 'human resources', 'people', 'talent', 'recruitment', 'recruiter', 'training', 'culture', 'welfare', 'benefits'],
  },

  /** ── Operations / Logistics ─────────────────────────────────── */
  OPERATIONS: {
    label: 'Ops Amber',
    dot: '#f97316',
    headerBg: 'linear-gradient(135deg, #431407 0%, #7c2d12 50%, #451a03 100%)',
    headerText: '#fdba74',
    accentBorder: '#f9731640',
    badgeBg: '#f9731615',
    badgeText: '#ea580c',
    badgeBorder: '#f9731640',
    bodyBg: 'linear-gradient(180deg, #431407 0%, #0f172a 100%)',
    cardText: '#fff7ed',
    subText: '#fdba74',
    divider: '#7c2d12',
    glow: '0 0 40px #f9731625, 0 4px 24px #43140780',
    stripBg: '#27080a',
    chipColor: '#f9731633',
    chipText: '#fdba74',
    keywords: ['operations', 'logistics', 'supply chain', 'warehouse', 'procurement', 'purchasing', 'facilities', 'maintenance', 'technician', 'mechanic', 'operator'],
  },

  /** ── Sales / Business Development ──────────────────────────── */
  SALES: {
    label: 'Sales Blue',
    dot: '#3b82f6',
    headerBg: 'linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 50%, #1e3a5f 100%)',
    headerText: '#93c5fd',
    accentBorder: '#3b82f640',
    badgeBg: '#3b82f615',
    badgeText: '#2563eb',
    badgeBorder: '#3b82f640',
    bodyBg: 'linear-gradient(180deg, #1e3a5f 0%, #0f172a 100%)',
    cardText: '#eff6ff',
    subText: '#93c5fd',
    divider: '#1d4ed8',
    glow: '0 0 40px #3b82f625, 0 4px 24px #1e3a5f80',
    stripBg: '#0e1f40',
    chipColor: '#3b82f633',
    chipText: '#93c5fd',
    keywords: ['sales', 'business development', 'bd', 'account manager', 'account executive', 'client', 'customer', 'revenue', 'commercial'],
  },

  /** ── Default / General Staff ────────────────────────────────── */
  DEFAULT: {
    label: 'Staff Slate',
    dot: '#64748b',
    headerBg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
    headerText: '#94a3b8',
    accentBorder: '#64748b40',
    badgeBg: '#64748b15',
    badgeText: '#475569',
    badgeBorder: '#64748b40',
    bodyBg: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
    cardText: '#f1f5f9',
    subText: '#94a3b8',
    divider: '#334155',
    glow: '0 0 30px #64748b15, 0 4px 20px #0f172a60',
    stripBg: '#0f172a',
    chipColor: '#64748b33',
    chipText: '#94a3b8',
    keywords: [],
  },
};

/**
 * Resolve the best-matching theme for a given designation string.
 *
 * Matching priority:
 *  1. Exact keyword match (full designation contains keyword)
 *  2. First partial substring match
 *  3. Falls back to DEFAULT
 *
 * @param {string} designation - Employee's designation/job title
 * @returns {object} Theme definition object
 */
export const getDesignationTheme = (designation = '') => {
  const lower = designation.toLowerCase().trim();

  for (const [, theme] of Object.entries(DESIGNATION_THEMES)) {
    if (!theme.keywords || theme.keywords.length === 0) continue;
    if (theme.keywords.some((kw) => lower.includes(kw))) {
      return theme;
    }
  }

  return DESIGNATION_THEMES.DEFAULT;
};

/**
 * Returns all theme entries as an array for rendering selectors.
 * @returns {{ key: string, theme: object }[]}
 */
export const getAllThemes = () =>
  Object.entries(DESIGNATION_THEMES).map(([key, theme]) => ({ key, theme }));
