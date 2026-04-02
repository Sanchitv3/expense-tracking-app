import React from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CategoryBreakdown, CATEGORY_COLORS, CATEGORY_GRADIENTS, CATEGORY_EMOJIS } from '../types/expense';
import { formatAmount } from '../services/helpers';
import { WalletIcon, ChartIcon } from './Icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface SummaryCardProps {
  totalSpends: number;
  totalCount: number;
  breakdown: CategoryBreakdown[];
}

export default function SummaryCard({ totalSpends, totalCount, breakdown }: SummaryCardProps) {
  const topCategories = breakdown.slice(0, 4);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#A78BFA']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientCard}
      >
        <View style={styles.headerRow}>
          <View style={styles.walletIcon}>
            <WalletIcon size={22} color="#fff" />
          </View>
          <Text style={styles.label}>Total Spends</Text>
        </View>
        <Text style={styles.amount}>{formatAmount(totalSpends, 'INR')}</Text>
        <Text style={styles.count}>{totalCount} expense{totalCount !== 1 ? 's' : ''}</Text>

        {topCategories.length > 0 && (
          <View style={styles.divider} />
        )}

        {topCategories.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.breakdownRow}
          >
            {topCategories.map((cat) => {
              const color = CATEGORY_COLORS[cat.category] || '#6B7280';
              const emoji = CATEGORY_EMOJIS[cat.category] || '📦';
              const pct = totalSpends > 0 ? ((cat.total / totalSpends) * 100).toFixed(0) : '0';

              return (
                <View key={cat.category} style={styles.breakdownItem}>
                  <View style={[styles.breakdownDot, { backgroundColor: color }]} />
                  <View>
                    <Text style={styles.breakdownLabel}>
                      {emoji} {cat.category}
                    </Text>
                    <Text style={styles.breakdownValue}>
                      {formatAmount(cat.total, 'INR')}{' '}
                      <Text style={styles.breakdownPct}>({pct}%)</Text>
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>
        )}
      </LinearGradient>

      {breakdown.length > 0 && (
        <View style={styles.barContainer}>
          {breakdown.map((cat) => {
            const color = CATEGORY_COLORS[cat.category] || '#6B7280';
            const pct = totalSpends > 0 ? (cat.total / totalSpends) * 100 : 0;
            const emoji = CATEGORY_EMOJIS[cat.category] || '📦';

            return (
              <View key={cat.category} style={styles.barRow}>
                <Text style={styles.barLabel}>
                  {emoji} {cat.category}
                </Text>
                <View style={styles.barTrack}>
                  <LinearGradient
                    colors={CATEGORY_GRADIENTS[cat.category] || ['#6B7280', '#4B5563']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.barFill, { width: `${Math.max(pct, 3)}%` }]}
                  />
                </View>
                <Text style={styles.barValue}>{formatAmount(cat.total, 'INR')}</Text>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  gradientCard: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  walletIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.8)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  amount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1,
  },
  count: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginVertical: 14,
  },
  breakdownRow: {
    gap: 16,
    paddingRight: 8,
  },
  breakdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  breakdownLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  breakdownValue: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
  },
  breakdownPct: {
    fontSize: 11,
    fontWeight: '400',
    color: 'rgba(255,255,255,0.6)',
  },
  barContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 10,
  },
  barLabel: {
    width: 120,
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 4,
  },
  barValue: {
    width: 70,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
    color: '#1F2937',
  },
});
