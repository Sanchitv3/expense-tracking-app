import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Expense, CATEGORY_EMOJIS, CATEGORY_COLORS } from '../types/expense';
import { formatAmount } from '../services/helpers';

interface SuccessCardProps {
  expense: Expense;
  fadeAnim: Animated.Value;
}

export default function SuccessCard({ expense, fadeAnim }: SuccessCardProps) {
  const color = CATEGORY_COLORS[expense.category] || '#6B7280';
  const emoji = CATEGORY_EMOJIS[expense.category] || '📦';

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <LinearGradient
        colors={['#ECFDF5', '#D1FAE5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View style={styles.checkCircle}>
            <Text style={styles.check}>✓</Text>
          </View>
          <Text style={styles.title}>Added Successfully</Text>
        </View>

        <View style={styles.details}>
          <View style={styles.row}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.value}>
              {formatAmount(expense.amount, expense.currency)}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Category</Text>
            <View style={[styles.categoryPill, { backgroundColor: color + '20' }]}>
              <Text style={styles.categoryEmoji}>{emoji}</Text>
              <Text style={[styles.categoryText, { color }]}>{expense.category}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Description</Text>
            <Text style={styles.value} numberOfLines={1}>
              {expense.description}
            </Text>
          </View>
          {expense.merchant && (
            <View style={styles.row}>
              <Text style={styles.label}>Merchant</Text>
              <Text style={styles.value}>{expense.merchant}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
  gradient: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  checkCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  check: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#065F46',
  },
  details: {
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: '#047857',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#065F46',
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryEmoji: {
    fontSize: 12,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
