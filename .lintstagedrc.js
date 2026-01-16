module.exports = {
  // Backend files
  'backend/**/*.{ts,js,json}': ['prettier --write'],
  'backend/**/*.ts': [
    'eslint --fix',
    () => 'cd backend && npx tsc --noEmit',
    (filenames) => `cd backend && npm test -- --bail --findRelatedTests ${filenames.join(' ')}`,
  ],

  // Frontend files
  'frontend/**/*.{ts,tsx,js,jsx,json}': ['prettier --write'],
  'frontend/**/*.{ts,tsx}': [
    'eslint --fix',
    () => 'cd frontend && npx tsc --noEmit',
    // Frontend tests not yet configured, will be added later
  ],

  // Common files
  '*.{md,yml,yaml}': ['prettier --write'],
};
