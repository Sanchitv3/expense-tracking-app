import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  RefreshControl,
} from 'react-native';
import { Expense } from '../types/expense';
import { addExpense, getExpenses, deleteExpense } from '../services/api';
import ExpenseInput from '../components/ExpenseInput';
import SuccessCard from '../components/SuccessCard';
import ExpenseItem from '../components/ExpenseItem';

export default function ExpenseTrackerScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [successExpense, setSuccessExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const fetchExpenses = useCallback(async () => {
    try {
      const data = await getExpenses();
      setExpenses(data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setIsFetching(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const showSuccess = (expense: Expense) => {
    setSuccessExpense(expense);
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setSuccessExpense(null));
      }, 3000);
    });
  };

  const handleAdd = async () => {
    if (!inputText.trim() || isLoading) return;

    setIsLoading(true);
    try {
      const expense = await addExpense(inputText.trim());
      setExpenses((prev) => [expense, ...prev]);
      setInputText('');
      showSuccess(expense);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to add expense');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete Expense', 'Are you sure you want to delete this expense?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeletingId(id);
          try {
            await deleteExpense(id);
            setExpenses((prev) => prev.filter((e) => e.id !== id));
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to delete');
          } finally {
            setDeletingId(null);
          }
        },
      },
    ]);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchExpenses();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>💰 AI Expense Tracker</Text>
        <Text style={styles.subtitle}>Add expenses in plain English</Text>
      </View>

      <ExpenseInput
        value={inputText}
        onChangeText={setInputText}
        onSubmit={handleAdd}
        isLoading={isLoading}
      />

      {successExpense && (
        <SuccessCard expense={successExpense} fadeAnim={fadeAnim} />
      )}

      <View style={styles.listContainer}>
        <Text style={styles.listTitle}>Recent Expenses</Text>
        {isFetching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : expenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>📝</Text>
            <Text style={styles.emptyText}>No expenses yet.</Text>
            <Text style={styles.emptySubtext}>Add your first one!</Text>
          </View>
        ) : (
          <FlatList
            data={expenses}
            renderItem={({ item }) => (
              <ExpenseItem
                item={item}
                isDeleting={deletingId === item.id}
                onDelete={handleDelete}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#6366F1',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#C7D2FE',
    marginTop: 4,
  },
  listContainer: {
    flex: 1,
    paddingTop: 16,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listContent: {
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
