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
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Expense, CategoryBreakdown } from '../types/expense';
import { addExpense, getExpenses, deleteExpense } from '../services/api';
import ExpenseInput from '../components/ExpenseInput';
import SuccessCard from '../components/SuccessCard';
import ExpenseItem from '../components/ExpenseItem';
import SummaryCard from '../components/SummaryCard';
import DateFilter from '../components/DateFilter';
import { WalletIcon, FilterIcon, RefreshIcon } from '../components/Icons';

export default function ExpenseTrackerScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [successExpense, setSuccessExpense] = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [totalSpends, setTotalSpends] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [breakdown, setBreakdown] = useState<CategoryBreakdown[]>([]);

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const headerScale = useRef(new Animated.Value(1)).current;

  const fetchExpenses = useCallback(async () => {
    try {
      const result = await getExpenses(fromDate || undefined, toDate || undefined);
      setExpenses(result.expenses);
      setTotalSpends(result.totalSpends);
      setTotalCount(result.totalCount);
      setBreakdown(result.breakdown);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setIsFetching(false);
      setRefreshing(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    setIsFetching(true);
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
    Animated.spring(headerScale, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();

    try {
      const expense = await addExpense(inputText.trim());
      setExpenses((prev) => [expense, ...prev]);
      setTotalSpends((prev) => prev + expense.amount);
      setTotalCount((prev) => prev + 1);
      setInputText('');
      showSuccess(expense);
      fetchExpenses();
    } catch (error: any) {
      Alert.alert('Could not parse expense', error.message || 'Please include an amount');
    } finally {
      setIsLoading(false);
      Animated.spring(headerScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
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
            fetchExpenses();
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

  const clearFilter = () => {
    setFromDate('');
    setToDate('');
  };

  const today = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header */}
      <Animated.View style={{ transform: [{ scale: headerScale }] }}>
        <LinearGradient
          colors={['#4F46E5', '#6366F1', '#818CF8']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerLeft}>
              <View style={styles.walletBadge}>
                <WalletIcon size={20} color="#fff" />
              </View>
              <View>
                <Text style={styles.headerTitle}>Expense Tracker</Text>
                <Text style={styles.headerDate}>{today}</Text>
              </View>
            </View>
          </View>

          {/* Quick stats */}
          <View style={styles.quickStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                ₹{totalSpends.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.statLabel}>Total Spent</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalCount}</Text>
              <Text style={styles.statLabel}>Expenses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {totalCount > 0 ? `₹${Math.round(totalSpends / totalCount).toLocaleString('en-IN')}` : '₹0'}
              </Text>
              <Text style={styles.statLabel}>Avg / Expense</Text>
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      {/* Input */}
      <ExpenseInput
        value={inputText}
        onChangeText={setInputText}
        onSubmit={handleAdd}
        isLoading={isLoading}
      />

      {/* Date Filter */}
      <DateFilter
        fromDate={fromDate}
        toDate={toDate}
        onFromChange={setFromDate}
        onToChange={setToDate}
        onClear={clearFilter}
      />

      {/* Summary Card */}
      {totalCount > 0 && (
        <SummaryCard
          totalSpends={totalSpends}
          totalCount={totalCount}
          breakdown={breakdown}
        />
      )}

      {/* Success Feedback */}
      {successExpense && (
        <SuccessCard expense={successExpense} fadeAnim={fadeAnim} />
      )}

      {/* Expense List */}
      <View style={styles.listSection}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Recent Expenses</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
            <RefreshIcon size={16} color="#6366F1" />
          </TouchableOpacity>
        </View>

        {isFetching && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : expenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBg}>
              <Text style={styles.emptyEmoji}>💰</Text>
            </View>
            <Text style={styles.emptyTitle}>No expenses yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first expense by typing above
            </Text>
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
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#6366F1"
              />
            }
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5FA',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  walletBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  headerDate: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 1,
    fontWeight: '500',
  },
  quickStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 14,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 2,
  },
  listSection: {
    flex: 1,
    paddingTop: 12,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1F2937',
  },
  refreshBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 60,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 80,
    paddingHorizontal: 40,
  },
  emptyIconBg: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyEmoji: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});
