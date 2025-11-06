import { StyleSheet, View } from 'react-native';

import { useMemo } from 'react';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useUser } from '@/contexts/user-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function HomeScreen() {
  const { name } = useUser();
  const colorScheme = useColorScheme() ?? 'light';
  const firstName = name ? name.split(' ')[0] : 'Explorer';
  const insets = useSafeAreaInsets();
  const cardBackground = useThemeColor(
    { light: 'rgba(245,102,0,0.12)', dark: 'rgba(82,45,128,0.45)' },
    'accent'
  );
  const accentBorder = useThemeColor({}, 'accent');
  const highlight = useThemeColor({}, 'tint');
  const cardStyle = useMemo(
    () => [styles.card, { backgroundColor: cardBackground, borderColor: accentBorder }],
    [cardBackground, accentBorder]
  );
  const containerStyle = useMemo(
    () => [styles.container, { paddingTop: Math.max(insets.top, 16) + 8 }],
    [insets.top]
  );

  return (
    <ThemedView style={containerStyle}>
      <ThemedText type="title" style={[styles.title, { color: highlight }]}>
        Welcome back, {firstName}!
      </ThemedText>
      <ThemedText style={styles.subtitle}>
        Earn points by showing up, cheering others on, and completing quests across campus.
      </ThemedText>
      <View style={[styles.progressRow, { borderColor: highlight }]}>
        <View style={[styles.progressFill, { backgroundColor: highlight }]} />
        <ThemedText type="defaultSemiBold" style={styles.progressText}>
          120 pts · Next reward at 200 pts
        </ThemedText>
      </View>
      <ThemedView style={cardStyle}>
        <View style={[styles.cardBadge, { backgroundColor: highlight }]}>
          <ThemedText style={styles.cardBadgeText} lightColor="#FFFFFF" darkColor="#FFFFFF">
            Daily Quest
          </ThemedText>
        </View>
        <ThemedText style={styles.cardText}>
          Introduce yourself to someone in your major and share one fun fact about yourself.
        </ThemedText>
      </ThemedView>
      <ThemedView style={cardStyle}>
        <View style={[styles.cardBadge, { backgroundColor: Colors[colorScheme].accent }]}>
          <ThemedText style={styles.cardBadgeText} lightColor="#FFFFFF" darkColor="#FFFFFF">
            Trending Events
          </ThemedText>
        </View>
        <ThemedText style={styles.cardText}>
          Tigers After Dark • Study Jam Session • Campus Run Club Meetup
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  progressRow: {
    borderWidth: 1,
    borderRadius: 999,
    padding: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '60%',
    opacity: 0.18,
  },
  progressText: {
    textAlign: 'center',
  },
  card: {
    padding: 20,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
  },
  cardBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  cardBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
  },
});
