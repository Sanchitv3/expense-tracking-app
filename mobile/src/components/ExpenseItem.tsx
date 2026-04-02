import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Expense, CATEGORY_COLORS, CATEGORY_GRADIENTS } from '../types/expense';
import { timeAgo, formatAmount } from '../services/helpers';
import { TrashIcon, CATEGORY_ICONS } from './Icons';

interface ExpenseItemProps {
  item: Expense;
  isDeleting: boolean;
  onDelete: (id: number) => void;
}

export default function ExpenseItem({ item, isDeleting, onDelete }: ExpenseItemProps) {
  const color = CATEGORY_COLORS[item.category] || '#6B7280';
  const gradient = CATEGORY_GRADIENTS[item.category] || ['#6B7280', '#4B5563'];
  const IconComponent = CATEGORY_ICONS[item.category] || CATEGORY_ICONS['Other'];

  return (
    <View style={[styles.container, isDeleting && styles.containerDeleting]}>
      <LinearGradient
        colors={[color + '18', color + '08']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.iconContainer}
      >
        <IconComponent size={22} color={color} />
      </LinearGradient>

      <View style={styles.info}>
        <View style={styles.topRow}>
          <View style={styles.categoryPill}>
            <View style={[styles.dot, { backgroundColor: color }]} />
            <Text style={styles.categoryText}>{item.category}</Text>
          </View>
          <Text style={styles.amount}>{formatAmount(item.amount, item.currency)}</Text>
        </View>
        <Text style={styles.description} numberOfLines={1}>
          {item.description}
        </Text>
        <View style={styles.bottomRow}>
          <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
          {item.merchant && (
            <Text style={styles.merchant}>• {item.merchant}</Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.deleteBtn}
        onPress={() => onDelete(item.id)}
        disabled={isDeleting}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        {isDeleting ? (
          <ActivityIndicator size="small" color="#EF4444" />
        ) : (
          <TrashIcon size={18} color="#D1D5DB" />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  containerDeleting: {
    opacity: 0.4,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  amount: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 3,
  },
  time: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  merchant: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
});
