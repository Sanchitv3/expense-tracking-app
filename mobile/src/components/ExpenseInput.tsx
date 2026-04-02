import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';

interface ExpenseInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function ExpenseInput({
  value,
  onChangeText,
  onSubmit,
  isLoading,
}: ExpenseInputProps) {
  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.textInput}
        placeholder='e.g., Spent 500 on groceries at BigBazaar'
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="send"
        editable={!isLoading}
      />
      <TouchableOpacity
        style={[
          styles.addButton,
          (!value.trim() || isLoading) && styles.addButtonDisabled,
        ]}
        onPress={onSubmit}
        disabled={!value.trim() || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.addButtonText}>Add</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
