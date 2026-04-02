import React from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { Expense, CATEGORY_EMOJIS } from '../types/expense';
import { formatAmount } from '../services/helpers';

interface SuccessCardProps {
  expense: Expense;
  fadeAnim: Animated.Value;
}

export default function SuccessCard({ expense, fadeAnim }: SuccessCardProps) {
  return (
    <Animated.View style={[styles.successCard, { opacity: fadeAnim }]}>
      <Text style={styles.successTitle}>✅ Added Successfully!</Text>
      <View style={styles.successDetails}>
        <Text style={styles.successText}>
          Amount: {formatAmount(expense.amount, expense.currency)}
        </Text>
        <Text style={styles.successText}>
          Category: {CATEGORY_EMOJIS[expense.category]}{' '}
          {expense.category}
        </Text>
        <Text style={styles.successText}>
          Description: {expense.description}
        </Text>
        {expense.merchant && (
          <Text style={styles.successText}>
            Merchant: {expense.merchant}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
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
});
