import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, User, AlertCircle, RefreshCw } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';

export default function LoginScreen() {
  const router = useRouter();
  
  // Zustand States & Actions
  const storeName = useAuthStore((state) => state.storeName);
  const setLoginData = useAuthStore((state) => state.setLoginData);
  const logout = useAuthStore((state) => state.logout);
  const clearTenant = () => {
    // Clear tenant settings to return to Onboarding Domain Lookup
    useAuthStore.setState({ storeId: null, storeName: null, apiBaseUrl: null });
  };

  // Form States
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!usernameOrEmail.trim() || !password.trim()) {
      setError('Please fill in all credentials');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // POST Request via our Axios apiClient
      const response = await apiClient.post('/admin/login', {
        usernameOrEmail: usernameOrEmail.trim(),
        password: password.trim(),
      });

      if (response.data?.success && response.data?.data) {
        const { user, accessToken, refreshToken } = response.data.data;

        // Save session credentials and profile locally
        setLoginData(user, accessToken, refreshToken);

        // Check if user has platform bypass permissions (Super Admin)
        const isSuperAdmin = user.role === 'SUPER_ADMIN' || user.isAdmin;

        if (isSuperAdmin) {
          // Navigate directly to the main dashboard
          router.replace('/');
        } else {
          // Navigate to scope selection gate for active Branch & Warehouse selection
          router.replace('/auth/scope-select');
        }
      } else {
        setError('Invalid login response from server');
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Invalid username/email or password');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Connection failed. Server may be offline.');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
          {/* Workspace badge */}
          <View style={styles.badgeContainer} className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <Text className="text-xs text-slate-600 dark:text-slate-300 font-semibold">
              Connected to: <Text className="text-indigo-600 dark:text-indigo-400 font-bold">{storeName}</Text>
            </Text>
            <Pressable onPress={clearTenant} style={styles.switchButton}>
              <RefreshCw size={12} className="text-indigo-600 dark:text-indigo-400 mr-1" />
              <Text className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase">Switch</Text>
            </Pressable>
          </View>

          {/* Login Card */}
          <View style={styles.cardContainer}>
            <View style={styles.iconContainer} className="bg-indigo-50 dark:bg-indigo-900/20">
              <Lock size={36} className="text-indigo-600 dark:text-indigo-400" />
            </View>

            <Text variant="h2" style={styles.title} className="text-slate-900 dark:text-white font-extrabold">
              Staff Portal Login
            </Text>
            <Text variant="muted" style={styles.subtitle}>
              Sign in with your administrator, cashier, WMS, or employee account credentials.
            </Text>

            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer} className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                <AlertCircle size={16} className="text-red-600 dark:text-red-400 mr-2" />
                <Text className="text-red-700 dark:text-red-400 text-xs font-semibold flex-1">
                  {error}
                </Text>
              </View>
            )}

            {/* Form Inputs */}
            <View style={styles.form}>
              <Input
                label="Username or Email"
                placeholder="Enter username or email"
                value={usernameOrEmail}
                onChangeText={(text) => {
                  setUsernameOrEmail(text);
                  setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <View style={styles.passwordWrapper}>
                <Input
                  label="Password"
                  placeholder="Enter account password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError(null);
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} className="text-muted-foreground" />
                  ) : (
                    <Eye size={20} className="text-muted-foreground" />
                  )}
                </Pressable>
              </View>
            </View>

            {/* Submit Button */}
            <Button
              variant="default"
              onPress={handleLogin}
              disabled={loading}
              className="w-full mt-6 h-12 rounded-xl"
            >
              <Text className="text-white font-semibold">
                {loading ? 'Authenticating...' : 'Sign In'}
              </Text>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 20,
    alignSelf: 'stretch',
  },
  switchButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 10,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    width: '100%',
  },
  form: {
    width: '100%',
  },
  passwordWrapper: {
    position: 'relative',
    width: '100%',
  },
  eyeButton: {
    position: 'absolute',
    right: 14,
    top: 38,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
