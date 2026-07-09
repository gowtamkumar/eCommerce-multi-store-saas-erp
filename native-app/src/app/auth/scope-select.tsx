import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Modal, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { GitBranch, Warehouse, ChevronDown, Check, LogOut, AlertTriangle } from 'lucide-react-native';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { useAuthStore } from '@/lib/store';
import { apiClient } from '@/lib/api-client';

interface ScopeItem {
  id: string;
  name: string;
  code?: string;
}

export default function ScopeSelectScreen() {
  const router = useRouter();

  // Zustand State & Actions
  const user = useAuthStore((state) => state.user);
  const setScopes = useAuthStore((state) => state.setScopes);
  const logout = useAuthStore((state) => state.logout);

  // Scopes List States
  const [branches, setBranches] = useState<ScopeItem[]>([]);
  const [warehouses, setWarehouses] = useState<ScopeItem[]>([]);

  // Selected States
  const [selectedBranch, setSelectedBranch] = useState<ScopeItem | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<ScopeItem | null>(null);

  // Status/UX States
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modal Control States
  const [isBranchModalOpen, setIsBranchModalOpen] = useState(false);
  const [isWarehouseModalOpen, setIsWarehouseModalOpen] = useState(false);

  useEffect(() => {
    fetchScopes();
  }, []);

  const fetchScopes = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both branches and warehouses concurrently
      const [branchesRes, warehousesRes] = await Promise.all([
        apiClient.get('/system/branches'),
        apiClient.get('/system/warehouses'),
      ]);

      const fetchedBranches = branchesRes.data?.data || [];
      const fetchedWarehouses = warehousesRes.data?.data || [];

      setBranches(fetchedBranches);
      setWarehouses(fetchedWarehouses);

      // Pre-select logic based on user profile preferences
      if (user) {
        // Match default/preferred branch
        const defaultBranchId = user.preferredBranchId || user.branchId;
        const matchingBranch = fetchedBranches.find((b: ScopeItem) => b.id === defaultBranchId);
        if (matchingBranch) {
          setSelectedBranch(matchingBranch);
        } else if (fetchedBranches.length === 1) {
          setSelectedBranch(fetchedBranches[0]); // Auto-select single branch
        }

        // Match default/preferred warehouse
        const defaultWarehouseId = user.warehouseId;
        const matchingWarehouse = fetchedWarehouses.find((w: ScopeItem) => w.id === defaultWarehouseId);
        if (matchingWarehouse) {
          setSelectedWarehouse(matchingWarehouse);
        } else if (fetchedWarehouses.length === 1) {
          setSelectedWarehouse(fetchedWarehouses[0]); // Auto-select single warehouse
        }
      }
    } catch (err: any) {
      console.error(err);
      setError('Could not retrieve active scopes. Please check backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmScopes = () => {
    if (!selectedBranch) {
      setError('Please select an active Branch');
      return;
    }
    if (!selectedWarehouse) {
      setError('Please select an active Warehouse');
      return;
    }

    setSubmitting(true);
    try {
      // Save working scopes to context (which injects headers into apiClient)
      setScopes(selectedBranch.id, selectedWarehouse.id);

      // Redirect user to Main App layout
      router.replace('/');
    } catch (err) {
      console.error(err);
      setError('Failed to register workspace scopes');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/auth/login');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="hsl(var(--primary))" />
        <Text style={styles.loadingText} className="text-muted-foreground mt-4">
          Synchronizing staff scopes...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top bar with Sign out */}
        <View style={styles.topBar}>
          <Text className="text-xs text-muted-foreground font-semibold">
            Signed in as: <Text className="font-bold text-foreground">{user?.username}</Text>
          </Text>
          <Button variant="ghost" size="sm" onPress={handleLogout} className="flex-row items-center gap-1">
            <LogOut size={14} className="text-destructive" />
            <Text className="text-xs text-destructive font-semibold">Sign Out</Text>
          </Button>
        </View>

        {/* Header Title */}
        <View style={styles.header}>
          <Text variant="h2" className="text-slate-900 dark:text-white font-extrabold mb-2">
            Select Working Scope
          </Text>
          <Text variant="muted" className="text-center">
            Specify your current physical location and logistics center scopes to bind transactions.
          </Text>
        </View>

        {/* Error Notification */}
        {error && (
          <View style={styles.errorContainer} className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
            <AlertTriangle size={16} className="text-red-600 dark:text-red-400 mr-2" />
            <Text className="text-red-700 dark:text-red-400 text-xs font-semibold flex-1">
              {error}
            </Text>
          </View>
        )}

        {/* Selector Forms */}
        <View style={styles.selectors}>
          
          {/* Branch Picker */}
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
            Active Branch Location
          </Text>
          <Pressable
            onPress={() => setIsBranchModalOpen(true)}
            style={styles.pickerTrigger}
            className="border border-border bg-background rounded-xl h-14 px-4 flex-row items-center justify-between"
          >
            <View style={styles.pickerLabelContainer}>
              <GitBranch size={18} className="text-muted-foreground mr-3" />
              <Text className={selectedBranch ? 'text-foreground' : 'text-slate-400'}>
                {selectedBranch ? selectedBranch.name : 'Choose a Branch...'}
              </Text>
            </View>
            <ChevronDown size={18} className="text-slate-400" />
          </Pressable>
          <Text className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 mb-5 ml-1">
            POS transactions will register under this branch code.
          </Text>

          {/* Warehouse Picker */}
          <Text className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">
            Active Warehouse Center
          </Text>
          <Pressable
            onPress={() => setIsWarehouseModalOpen(true)}
            style={styles.pickerTrigger}
            className="border border-border bg-background rounded-xl h-14 px-4 flex-row items-center justify-between"
          >
            <View style={styles.pickerLabelContainer}>
              <Warehouse size={18} className="text-muted-foreground mr-3" />
              <Text className={selectedWarehouse ? 'text-foreground' : 'text-slate-400'}>
                {selectedWarehouse ? selectedWarehouse.name : 'Choose a Warehouse...'}
              </Text>
            </View>
            <ChevronDown size={18} className="text-slate-400" />
          </Pressable>
          <Text className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 mb-6 ml-1">
            All picking, packing, inventory counts, and bin audits map here.
          </Text>

        </View>

        {/* Enter Dashboard Button */}
        <Button
          variant="default"
          onPress={handleConfirmScopes}
          disabled={submitting}
          className="w-full h-12 rounded-xl mt-6"
        >
          <Text className="text-white font-semibold">
            {submitting ? 'Initializing Workspace...' : 'Enter Dashboard'}
          </Text>
        </Button>
      </ScrollView>

      {/* BRANCH SELECTOR MODAL */}
      <Modal
        visible={isBranchModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsBranchModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent} className="bg-background border border-border">
            <Text variant="large" className="font-extrabold mb-4 text-foreground">
              Select Branch
            </Text>
            {branches.length === 0 ? (
              <Text className="text-slate-400 text-center py-6">No branches available</Text>
            ) : (
              <ScrollView style={styles.modalList}>
                {branches.map((b) => (
                  <Pressable
                    key={b.id}
                    onPress={() => {
                      setSelectedBranch(b);
                      setIsBranchModalOpen(false);
                      setError(null);
                    }}
                    style={styles.modalItem}
                    className="border-b border-border/40 py-4 flex-row items-center justify-between"
                  >
                    <View style={styles.modalItemText}>
                      <GitBranch size={16} className="text-slate-400 mr-2.5" />
                      <Text className="text-foreground font-medium">{b.name}</Text>
                    </View>
                    {selectedBranch?.id === b.id && (
                      <Check size={16} className="text-indigo-600 dark:text-indigo-400" />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            )}
            <Button
              variant="outline"
              onPress={() => setIsBranchModalOpen(false)}
              className="mt-4 rounded-xl"
            >
              <Text>Close</Text>
            </Button>
          </View>
        </View>
      </Modal>

      {/* WAREHOUSE SELECTOR MODAL */}
      <Modal
        visible={isWarehouseModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsWarehouseModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent} className="bg-background border border-border">
            <Text variant="large" className="font-extrabold mb-4 text-foreground">
              Select Warehouse
            </Text>
            {warehouses.length === 0 ? (
              <Text className="text-slate-400 text-center py-6">No warehouses available</Text>
            ) : (
              <ScrollView style={styles.modalList}>
                {warehouses.map((w) => (
                  <Pressable
                    key={w.id}
                    onPress={() => {
                      setSelectedWarehouse(w);
                      setIsWarehouseModalOpen(false);
                      setError(null);
                    }}
                    style={styles.modalItem}
                    className="border-b border-border/40 py-4 flex-row items-center justify-between"
                  >
                    <View style={styles.modalItemText}>
                      <Warehouse size={16} className="text-slate-400 mr-2.5" />
                      <Text className="text-foreground font-medium">{w.name}</Text>
                    </View>
                    {selectedWarehouse?.id === w.id && (
                      <Check size={16} className="text-indigo-600 dark:text-indigo-400" />
                    )}
                  </Pressable>
                ))}
              </ScrollView>
            )}
            <Button
              variant="outline"
              onPress={() => setIsWarehouseModalOpen(false)}
              className="mt-4 rounded-xl"
            >
              <Text>Close</Text>
            </Button>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  selectors: {
    width: '100%',
  },
  pickerTrigger: {
    width: '100%',
  },
  pickerLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    width: '100%',
    maxHeight: '70%',
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  modalList: {
    maxHeight: 300,
  },
  modalItem: {
    width: '100%',
  },
  modalItemText: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
