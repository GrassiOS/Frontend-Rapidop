export const breakpoints = {
  xs: 0,
  sm: 360,
  md: 600,
  lg: 840,
  xl: 1200,
} as const;

export type BreakpointKey = keyof typeof breakpoints;

export const getBreakpoint = (width: number): BreakpointKey => {
  if (width >= breakpoints.xl) return 'xl';
  if (width >= breakpoints.lg) return 'lg';
  if (width >= breakpoints.md) return 'md';
  if (width >= breakpoints.sm) return 'sm';
  return 'xs';
};

export const isTabletLike = (width: number, height: number) =>
  Math.min(width, height) >= breakpoints.md;
