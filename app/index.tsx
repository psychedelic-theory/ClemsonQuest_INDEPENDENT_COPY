import { useEffect, useMemo, useRef, useState } from 'react';
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

const CLEMSON_EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@clemson\.edu$/i;

export default function LoginScreen() {
  const router = useRouter();
  const { firstName, lastName, email, setUserProfile } = useUser();
  const lastNameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const [formValues, setFormValues] = useState({
    firstName,
    lastName,
    email,
  });
  const [error, setError] = useState('');
  const colorScheme = useColorScheme() ?? 'light';
  const insets = useSafeAreaInsets();

  const inputBackground = useThemeColor(
    { light: 'rgba(82,45,128,0.08)', dark: 'rgba(255,255,255,0.08)' },
    'background'
  );
  const buttonBackground = useThemeColor({}, 'tint');
  const buttonTextColor = '#FFFFFF';
  const accentColor = useThemeColor({}, 'accent');

  useEffect(() => {
    setFormValues({
      firstName,
      lastName,
      email,
    });
  }, [email, firstName, lastName]);

  const handleChange = (field: keyof typeof formValues) => (value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (error) {
      setError('');
    }
  };

  const trimmedFirst = formValues.firstName.trim();
  const trimmedLast = formValues.lastName.trim();
  const trimmedEmail = formValues.email.trim().toLowerCase();
  const isSubmitDisabled =
    !trimmedFirst || !trimmedLast || !CLEMSON_EMAIL_REGEX.test(trimmedEmail);

  const handleContinue = () => {
    if (!trimmedFirst) {
      setError('Please enter your first name.');
      return;
    }
    if (!trimmedLast) {
      setError('Please enter your last name.');
      return;
    }
    if (!trimmedEmail) {
      setError('Please enter your Clemson email.');
      return;
    }
    if (!CLEMSON_EMAIL_REGEX.test(trimmedEmail)) {
      setError('Use a Clemson email that ends with @clemson.edu.');
      return;
    }

    setError('');
    setUserProfile({
      firstName: trimmedFirst,
      lastName: trimmedLast,
      email: trimmedEmail,
    });
    router.replace('/(tabs)');
  };

  const contentStyle = useMemo(
    () => [
      styles.content,
      {
        paddingHorizontal: 24,
        paddingTop: Math.max(32, insets.top + 16),
        paddingBottom: Math.max(32, insets.bottom + 24),
      },
    ],
    [insets.bottom, insets.top]
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: 'height' })}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={contentStyle}>
            <ThemedText type="title" style={[styles.title, { color: buttonBackground }]}>
              ClemsonQuest
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Sign in to start connecting with fellow students.
            </ThemedText>
            <TextInput
              placeholder="First name"
              placeholderTextColor={Colors[colorScheme].icon}
              value={formValues.firstName}
              onChangeText={handleChange('firstName')}
              onSubmitEditing={() => lastNameInputRef.current?.focus()}
              returnKeyType="next"
              autoCapitalize="words"
              autoComplete="given-name"
              style={[
                styles.input,
                {
                  backgroundColor: inputBackground,
                  color: Colors[colorScheme].text,
                  borderColor: accentColor,
                },
              ]}
            />
            <TextInput
              ref={lastNameInputRef}
              placeholder="Last name"
              placeholderTextColor={Colors[colorScheme].icon}
              value={formValues.lastName}
              onChangeText={handleChange('lastName')}
              onSubmitEditing={() => emailInputRef.current?.focus()}
              returnKeyType="next"
              autoCapitalize="words"
              autoComplete="family-name"
              style={[
                styles.input,
                {
                  backgroundColor: inputBackground,
                  color: Colors[colorScheme].text,
                  borderColor: accentColor,
                },
              ]}
            />
            <TextInput
              ref={emailInputRef}
              placeholder="Clemson email"
              placeholderTextColor={Colors[colorScheme].icon}
              value={formValues.email}
              onChangeText={handleChange('email')}
              onSubmitEditing={handleContinue}
              returnKeyType="done"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              keyboardType="email-address"
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
              style={[
                styles.button,
                {
                  backgroundColor: buttonBackground,
                  opacity: isSubmitDisabled ? 0.55 : 1,
                },
              ]}
              onPress={handleContinue}
              disabled={isSubmitDisabled}
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
  content: {
    gap: 16,
    flex: 1,
    justifyContent: 'center',
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
