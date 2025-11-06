/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const clemsonOrange = '#F56600';
const clemsonPurple = '#522D80';

export const Colors = {
  light: {
    text: '#1F1A3D',
    background: '#FFFFFF',
    tint: clemsonOrange,
    accent: clemsonPurple,
    icon: '#5D3A9A',
    tabIconDefault: '#9D9DB8',
    tabIconSelected: clemsonOrange,
  },
  dark: {
    text: '#ECEDEE',
    background: '#1B133C',
    tint: clemsonOrange,
    accent: clemsonPurple,
    icon: '#C8B6FF',
    tabIconDefault: '#8676B8',
    tabIconSelected: clemsonOrange,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
