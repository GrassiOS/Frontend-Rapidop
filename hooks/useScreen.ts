import { useMemo } from 'react';
import { useWindowDimensions, Platform } from 'react-native';
import { useSafeAreaInsets, useSafeAreaFrame } from 'react-native-safe-area-context';
import { getBreakpoint, isTabletLike } from '@/utils/layout';

export type Orientation = 'portrait' | 'landscape';

export function useScreen() {
  const { width, height, scale, fontScale } = useWindowDimensions();
  const frame = useSafeAreaFrame(); // área útil sin “notch”
  const insets = useSafeAreaInsets();

  const orientation: Orientation = width >= height ? 'landscape' : 'portrait';
  const breakpoint = getBreakpoint(width);
  const tablet = isTabletLike(width, height);

  // Dimensiones útiles (restando insets)
  const usableWidth = Math.max(0, frame.width);
  const usableHeight = Math.max(0, frame.height);

  // Alturas útiles para layouts con barras
  const topPadding = insets.top;
  const bottomPadding = insets.bottom;

  // Ejemplo: altura útil para ScrollViews o contenedores
  const contentHeight = usableHeight;

  const platform = Platform.OS;

  return useMemo(
    () => ({
      // RN window
      width,
      height,
      scale,
      fontScale,

      // Safe area
      insets,
      usableWidth,
      usableHeight,
      topPadding,
      bottomPadding,
      contentHeight,

      // Derivados
      orientation,
      breakpoint,
      tablet,
      platform,
    }),
    [
      width,
      height,
      scale,
      fontScale,
      insets,
      usableWidth,
      usableHeight,
      topPadding,
      bottomPadding,
      contentHeight,
      orientation,
      breakpoint,
      tablet,
      platform,
    ]
  );
}
