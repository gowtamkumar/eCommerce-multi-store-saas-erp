import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import axios from 'axios';
import { Settings, ShieldCheck, AlertCircle } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/store';

export default function TenantScreen() {
  const router = useRouter();
  const setTenantInfo = useAuthStore((state) => state.setTenantInfo);

  // States
  const [subdomain, setSubdomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dev Settings Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiHost, setApiHost] = useState('http://localhost:3900'); // Default dev server port

  const handleResolveTenant = async () => {
    if (!subdomain.trim()) {
      setError('Please enter a workspace subdomain');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const normalizedSubdomain = subdomain.trim().toLowerCase();
      // Call public stores endpoint to lookup the store by subdomain
      const url = `${apiHost}/api/v1/stores?subdomain=${normalizedSubdomain}`;
      const response = await axios.get(url);

      if (response.data?.success && response.data?.data) {
        const store = response.data.data;
        const apiBaseUrl = `${apiHost}/api/v1`;

        // Save store details to secure persisted Zustand store
        setTenantInfo(store.id, apiBaseUrl, store.name);

        // Redirect to login screen
        router.push('/auth/login');
      } else {
        setError('Failed to resolve workspace details');
      }
    } catch (err: any) {
      if (err.response?.status === 404) {
        setError('Workspace not found. Check the subdomain spelling.');
      } else {
        setError('Network error. Check connection or platform API host.');
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
          {/* Header Action (Settings Gear for API Host selection) */}
          <View style={styles.header}>
            <Button
              variant="ghost"
              size="icon"
              onPress={() => setIsSettingsOpen(true)}
              className="rounded-full"
            >
              <Settings size={20} className="text-muted-foreground" />
            </Button>
          </View>

          {/* Main Card */}
          <View style={styles.cardContainer}>
            <View style={styles.logoContainer} className="bg-indigo-50 dark:bg-indigo-900/20">
              <ShieldCheck size={40} className="text-indigo-600 dark:text-indigo-400" />
            </View>

            <Text variant="h2" style={styles.title} className="text-slate-900 dark:text-white font-extrabold text-center">
              Connect Workspace
            </Text>
            <Text variant="muted" style={styles.subtitle} className="text-center">
              Enter your store subdomain to resolve and sync the business operational environment.
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

            {/* Subdomain Input */}
            <View style={styles.inputGroup}>
              <Input
                label="Workspace Subdomain"
                placeholder="e.g. fast-mart"
                value={subdomain}
                onChangeText={(text) => {
                  setSubdomain(text);
                  setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 self-start">
                Format: name.domain.com (only enter the 'name' subdomain part)
              </Text>
            </View>

            {/* Resolve Button */}
            <Button
              variant="default"
              onPress={handleResolveTenant}
              disabled={loading}
              className="w-full mt-6 h-12 rounded-xl"
            >
              <Text className="text-white font-semibold">
                {loading ? 'Resolving...' : 'Continue'}
              </Text>
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Development Settings Modal */}
      <Modal
        visible={isSettingsOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsSettingsOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent} className="bg-background border border-border">
            <Text variant="large" className="font-extrabold mb-2 text-foreground">
              Developer Settings
            </Text>
            <Text variant="muted" className="mb-4">
              Point the mobile application to a custom development backend API server.
            </Text>

            <Input
              label="Platform API Host"
              placeholder="e.g. http://192.168.1.100:3900"
              value={apiHost}
              onChangeText={setApiHost}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.modalActions}>
              <Button
                variant="outline"
                onPress={() => setIsSettingsOpen(false)}
                className="flex-1 rounded-xl"
              >
                <Text>Cancel</Text>
              </Button>
              <Button
                variant="default"
                onPress={() => setIsSettingsOpen(false)}
                className="flex-1 rounded-xl"
              >
                <Text className="text-white">Save</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    position: 'absolute',
    top: 10,
    right: 20,
    zIndex: 10,
  },
  cardContainer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    borderRadius: 24,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 8,
  },
  subtitle: {
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
  inputGroup: {
    width: '100%',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
});
