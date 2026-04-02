import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  RefreshControl,
} from 'react-native';
import { Expense, CATEGORY_EMOJIS, CATEGORY_COLORS } from '../types/expense';
import { addExpense, getExpenses, deleteExpense } from '../services/api';
import { timeAgo, formatAmount } from '../utils/helpers';

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

  const renderExpenseItem = ({ item }: { item: Expense }) => {
    const emoji = CATEGORY_EMOJIS[item.category] || '📦';
    const color = CATEGORY_COLORS[item.category] || '#6B7280';
    const isDeleting = deletingId === item.id;

    return (
      <View style={[styles.expenseItem, isDeleting && styles.expenseItemDeleting]}>
        <View style={[styles.categoryBadge, { backgroundColor: color + '20' }]}>
          <Text style={styles.categoryEmoji}>{emoji}</Text>
        </View>
        <View style={styles.expenseInfo}>
          <View style={styles.expenseHeader}>
            <Text style={styles.categoryText}>{item.category}</Text>
            <Text style={styles.amountText}>
              {formatAmount(item.amount, item.currency)}
            </Text>
          </View>
          <Text style={styles.descriptionText} numberOfLines={1}>
            {item.description}
          </Text>
          <Text style={styles.timeText}>{timeAgo(item.created_at)}</Text>
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <ActivityIndicator size="small" color="#EF4444" />
          ) : (
            <Text style={styles.deleteIcon}>✕</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>💰 AI Expense Tracker</Text>
        <Text style={styles.subtitle}>Add expenses in plain English</Text>
      </View>

      {/* Input Section */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder='e.g., Spent 500 on groceries at BigBazaar'
          placeholderTextColor="#9CA3AF"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleAdd}
          returnKeyType="send"
          editable={!isLoading}
        />
        <TouchableOpacity
          style={[
            styles.addButton,
            (!inputText.trim() || isLoading) && styles.addButtonDisabled,
          ]}
          onPress={handleAdd}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>Add</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Card */}
      {successExpense && (
        <Animated.View style={[styles.successCard, { opacity: fadeAnim }]}>
          <Text style={styles.successTitle}>✅ Added Successfully!</Text>
          <View style={styles.successDetails}>
            <Text style={styles.successText}>
              Amount: {formatAmount(successExpense.amount, successExpense.currency)}
            </Text>
            <Text style={styles.successText}>
              Category: {CATEGORY_EMOJIS[successExpense.category]}{' '}
              {successExpense.category}
            </Text>
            <Text style={styles.successText}>
              Description: {successExpense.description}
            </Text>
            {successExpense.merchant && (
              <Text style={styles.successText}>
                Merchant: {successExpense.merchant}
              </Text>
            )}
          </View>
        </Animated.View>
      )}

      {/* Expense List */}
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
            renderItem={renderExpenseItem}
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
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  addButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  addButtonDisabled: {
    backgroundColor: '#A5B4FC',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  successCard: {
    backgroundColor: '#ECFDF5',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
    marginBottom: 8,
  },
  successDetails: {
    gap: 2,
  },
  successText: {
    fontSize: 14,
    color: '#047857',
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
  expenseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  expenseItemDeleting: {
    opacity: 0.5,
  },
  categoryBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  expenseInfo: {
    flex: 1,
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  descriptionText: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  timeText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteIcon: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '700',
  },
});
