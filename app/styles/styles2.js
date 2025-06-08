import { StyleSheet as StyleSheet2 } from 'react-native';

// Tailwind-derived variables converted to React Native-friendly format
export const COLORS = {
  background: 'hsl(0, 0%, 100%)',
  foreground: 'hsl(0, 0%, 3.9%)',
  card: 'hsl(0, 0%, 100%)',
  cardForeground: 'hsl(0, 0%, 3.9%)',
  popover: 'hsl(0, 0%, 100%)',
  popoverForeground: 'hsl(0, 0%, 3.9%)',
  primary: 'hsl(0, 0%, 9%)',
  primaryForeground: 'hsl(0, 0%, 98%)',
  secondary: 'hsl(0, 0%, 96.1%)',
  secondaryForeground: 'hsl(0, 0%, 9%)',
  muted: 'hsl(0, 0%, 96.1%)',
  mutedForeground: 'hsl(0, 0%, 45.1%)',
  accent: 'hsl(0, 0%, 96.1%)',
  accentForeground: 'hsl(0, 0%, 9%)',
  destructive: 'hsl(0, 84.2%, 60.2%)',
  destructiveForeground: 'hsl(0, 0%, 98%)',
  border: 'hsl(0, 0%, 89.8%)',
  input: 'hsl(0, 0%, 89.8%)',
  ring: 'hsl(0, 0%, 3.9%)',
};

// Dark mode overrides
export const DARK_COLORS = {
  background: 'hsl(0, 0%, 3.9%)',
  foreground: 'hsl(0, 0%, 98%)',
  border: 'hsl(0, 0%, 14.9%)',
};

export default StyleSheet2.create({
  // Global container (body)
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  // Default text
  text: {
    fontFamily: 'Arial, Helvetica, sans-serif',
    color: COLORS.foreground,
  },
  // Balanced text wrapping (iOS only)
  textBalance: {
    lineBreakStrategy: 'balanced',
  },
  // Default border style
  border: {
    borderColor: COLORS.border,
    borderWidth: 1,
  },
  // Dark mode container
  darkContainer: {
    backgroundColor: DARK_COLORS.background,
  },
  // Dark mode text
  darkText: {
    color: DARK_COLORS.foreground,
  },
});
