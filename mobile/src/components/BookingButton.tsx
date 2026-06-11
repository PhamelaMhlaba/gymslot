import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

interface BookingButtonProps {
  onPress: () => void;
  isLoading: boolean;
  isDisabled: boolean;
  label?: string;
}

export const BookingButton: React.FC<BookingButtonProps> = ({
  onPress,
  isLoading,
  isDisabled,
  label = 'Book My Slot',
}) => {
  const disabled = isLoading || isDisabled;

  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, busy: isLoading }}
    >
      {isLoading ? (
        <View style={styles.row}>
          <ActivityIndicator color="#fff" size="small" />
          <Text style={styles.text}>  Booking...</Text>
        </View>
      ) : (
        <Text style={styles.text}>{isDisabled ? 'Gym Full' : label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 14,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  disabled: {
    backgroundColor: '#374151',
    shadowOpacity: 0,
    elevation: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});