# Visual Regression Baseline Screenshots

This directory contains baseline screenshots for visual regression testing during color system migration.

## Required Screenshots

Before implementing color system changes, capture these screenshots:

### Light Mode

- `baseline-login-light.png` - Login page in light mode
- `baseline-header-light.png` - Header with language/theme switchers
- `baseline-forms-light.png` - Generic form example page

### Dark Mode

- `baseline-login-dark.png` - Login page in dark mode
- `baseline-header-dark.png` - Header in dark mode
- `baseline-forms-dark.png` - Generic form example in dark mode

## How to Capture

1. Start dev server: `cd frontend && npm run dev`
2. Navigate to `http://localhost:3000/en/login`
3. Set viewport to 1920x1080
4. Capture screenshots using browser tools or automated tool
5. Toggle theme switcher and capture dark mode variants

## Comparison

After migration, capture new screenshots in `tests/visual-regression/current/` and compare:

```bash
# Manual comparison
diff baseline/baseline-login-light.png current/current-login-light.png

# Or use image diff tool like pixelmatch
```

**Acceptance Criteria**:

- Light mode: <1% pixel difference
- Dark mode: Properly themed appearance with good contrast
- No layout shifts or visual artifacts
