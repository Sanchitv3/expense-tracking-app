import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { CalendarIcon, CloseIcon } from './Icons';

interface DateFilterProps {
  fromDate: string;
  toDate: string;
  onFromChange: (date: string) => void;
  onToChange: (date: string) => void;
  onClear: () => void;
}

const PRESETS = [
  { label: 'Today', days: 0 },
  { label: 'Last 7 Days', days: 7 },
  { label: 'Last 30 Days', days: 30 },
  { label: 'This Month', days: -1 },
];

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getStartOfMonth(): string {
  const now = new Date();
  return formatDate(new Date(now.getFullYear(), now.getMonth(), 1));
}

function formatDisplay(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function DateFilter({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
  onClear,
}: DateFilterProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectingFrom, setSelectingFrom] = useState(true);

  const applyPreset = (days: number) => {
    const today = formatDate(new Date());
    onToChange(today);
    if (days === -1) {
      onFromChange(getStartOfMonth());
    } else {
      const from = new Date();
      from.setDate(from.getDate() - days);
      onFromChange(formatDate(from));
    }
    setShowPicker(false);
  };

  const hasFilter = fromDate || toDate;

  // Generate days for calendar
  const generateCalendar = () => {
    const baseDate = selectingFrom
      ? (fromDate ? new Date(fromDate + 'T00:00:00') : new Date())
      : (toDate ? new Date(toDate + 'T00:00:00') : new Date());

    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    return { days, year, month };
  };

  const [calMonth, setCalMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  const handleDaySelect = (day: number) => {
    const selected = formatDate(new Date(calMonth.year, calMonth.month, day));
    if (selectingFrom) {
      onFromChange(selected);
      setSelectingFrom(false);
    } else {
      onToChange(selected);
      setShowPicker(false);
      setSelectingFrom(true);
    }
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setShowPicker(true)}
      >
        <CalendarIcon size={18} color={hasFilter ? '#6366F1' : '#9CA3AF'} />
        <Text style={[styles.filterText, hasFilter && styles.filterTextActive]}>
          {hasFilter
            ? `${formatDisplay(fromDate)} — ${formatDisplay(toDate)}`
            : 'Filter by date'}
        </Text>
        {hasFilter && (
          <TouchableOpacity onPress={onClear} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <CloseIcon size={14} color="#9CA3AF" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal visible={showPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => { setShowPicker(false); setSelectingFrom(true); }}
        >
          <View style={styles.modal} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>
              {selectingFrom ? 'Select Start Date' : 'Select End Date'}
            </Text>

            <View style={styles.presetsRow}>
              {PRESETS.map((p) => (
                <TouchableOpacity
                  key={p.label}
                  style={styles.presetChip}
                  onPress={() => applyPreset(p.days)}
                >
                  <Text style={styles.presetText}>{p.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.calendarHeader}>
              <TouchableOpacity
                onPress={() => setCalMonth((m) => ({
                  month: m.month === 0 ? 11 : m.month - 1,
                  year: m.month === 0 ? m.year - 1 : m.year,
                }))}
              >
                <Text style={styles.navArrow}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthTitle}>
                {monthNames[calMonth.month]} {calMonth.year}
              </Text>
              <TouchableOpacity
                onPress={() => setCalMonth((m) => ({
                  month: m.month === 11 ? 0 : m.month + 1,
                  year: m.month === 11 ? m.year + 1 : m.year,
                }))}
              >
                <Text style={styles.navArrow}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekHeader}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <Text key={i} style={styles.weekDay}>{d}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {generateCalendar().days.map((day, i) => {
                if (day === null) return <View key={`empty-${i}`} style={styles.dayCell} />;

                const dateStr = formatDate(new Date(calMonth.year, calMonth.month, day));
                const isSelected = (selectingFrom ? fromDate : toDate) === dateStr;
                const isInRange =
                  fromDate && toDate && dateStr >= fromDate && dateStr <= toDate;

                return (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayCell,
                      isSelected && styles.daySelected,
                      isInRange && !isSelected && styles.dayInRange,
                    ]}
                    onPress={() => handleDaySelect(day)}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                        isInRange && !isSelected && styles.dayTextInRange,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => { setShowPicker(false); setSelectingFrom(true); }}
            >
              <Text style={styles.closeBtnText}>Done</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterText: {
    flex: 1,
    fontSize: 13,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#4B5563',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 20,
  },
  presetChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  presetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6366F1',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  navArrow: {
    fontSize: 28,
    color: '#6366F1',
    fontWeight: '300',
    paddingHorizontal: 12,
  },
  monthTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  weekHeader: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  daySelected: {
    backgroundColor: '#6366F1',
    borderRadius: 20,
  },
  dayInRange: {
    backgroundColor: '#EEF2FF',
    borderRadius: 8,
  },
  dayText: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#fff',
    fontWeight: '700',
  },
  dayTextInRange: {
    color: '#6366F1',
  },
  closeBtn: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
});
