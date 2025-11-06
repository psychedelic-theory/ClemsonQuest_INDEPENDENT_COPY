import { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useUser } from '@/contexts/user-context';

export default function LoginScreen() {
  const router = useRouter();
  const { setName } = useUser();
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const colorScheme = useColorScheme() ?? 'light';
  const insets = useSafeAreaInsets();

  const inputBackground = useThemeColor(
    { light: 'rgba(82,45,128,0.08)', dark: 'rgba(255,255,255,0.08)' },
    'background'
  );
  const buttonBackground = useThemeColor({}, 'tint');
  const badgeBackground = useThemeColor(
    { light: 'rgba(82,45,128,0.9)', dark: 'rgba(82,45,128,0.7)' },
    'accent'
  );
  const buttonTextColor = '#FFFFFF';
  const accentColor = useThemeColor({}, 'accent');

  const handleContinue = () => {
    const trimmed = input.trim();
    if (!trimmed) {
      setError('Please enter your name to continue.');
      return;
    }

    setError('');
    setName(trimmed);
    router.replace('/(tabs)');
  };

  return (
    <ThemedView style={{ flex: 1 }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.content}>
            <ThemedText type="title" style={[styles.title, { color: buttonBackground }]}>
              ClemsonQuest
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Sign in to start connecting with fellow students.
            </ThemedText>
            <TextInput
              placeholder="Your name"
              placeholderTextColor={Colors[colorScheme].icon}
              value={input}
              onChangeText={(text) => {
                setInput(text);
                if (error) {
                  setError('');
                }
              }}
              onSubmitEditing={handleContinue}
              returnKeyType="done"
              autoCapitalize="words"
              style={[
                styles.input,
                {
                  backgroundColor: inputBackground,
                  color: Colors[colorScheme].text,
                  borderColor: accentColor,
                },
              ]}
            />
            {!!error && (
              <ThemedText lightColor="#d93025" darkColor="#ff6f6f" style={styles.errorText}>
                {error}
              </ThemedText>
            )}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: buttonBackground }]}
              onPress={handleContinue}
              activeOpacity={0.9}
            >
              <ThemedText style={[styles.buttonText, { color: buttonTextColor }]}>
                Continue
              </ThemedText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  avoidingView: {
    flex: 1,
    justifyContent: 'center',
  },
  content: {
    gap: 16,
    flex: 1,
    justifyContent: 'center'
  },
  badge: {
    alignSelf: 'center',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
  },
  errorText: {
    textAlign: 'center',
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 3,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
  },
});
