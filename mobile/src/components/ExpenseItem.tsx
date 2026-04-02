import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { Expense, CATEGORY_EMOJIS, CATEGORY_COLORS } from '../types/expense';
import { timeAgo, formatAmount } from '../services/helpers';

interface ExpenseItemProps {
  item: Expense;
  isDeleting: boolean;
  onDelete: (id: number) => void;
}

export default function ExpenseItem({ item, isDeleting, onDelete }: ExpenseItemProps) {
  const emoji = CATEGORY_EMOJIS[item.category] || '📦';
  const color = CATEGORY_COLORS[item.category] || '#6B7280';

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
        onPress={() => onDelete(item.id)}
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
}

const styles = StyleSheet.create({
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
