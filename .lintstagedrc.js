module.exports = {
  // Backend files
  'backend/**/*.{ts,js,json}': ['prettier --write'],
  'backend/**/*.ts': [
    // Check for forbidden patterns - use bash -c to properly handle shell operators
    (filenames) =>
      `bash -c 'grep -l -E "(eslint-disable-next-line|@ts-ignore)" ${filenames.join(' ')} && exit 1 || exit 0'`,
    'eslint --fix --config backend/eslint.config.mjs',
    () => 'cd backend && npx tsc --noEmit',
    (filenames) => `cd backend && npm test -- --bail --findRelatedTests ${filenames.join(' ')}`,
  ],

  // Frontend files
  'frontend/**/*.{ts,tsx,js,jsx,json}': ['prettier --write'],
  'frontend/**/*.{ts,tsx}': [
    // Check for forbidden patterns - use bash -c to properly handle shell operators
    (filenames) =>
      `bash -c 'grep -l -E "(eslint-disable-next-line|@ts-ignore)" ${filenames.join(' ')} && exit 1 || exit 0'`,
    'eslint --fix --config frontend/eslint.config.mjs',
    () => 'cd frontend && npx tsc --noEmit',
    // Frontend tests not yet configured, will be added later
  ],

  // Common files
  '*.{md,yml,yaml}': ['prettier --write'],
};
