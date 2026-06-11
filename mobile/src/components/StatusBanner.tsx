import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { AsyncState, BookingData } from '../types/gym.js';

interface StatusBannerProps {
  state: AsyncState<BookingData>;
}

export const StatusBanner: React.FC<StatusBannerProps> = ({ state }) => {
  if (state.status === 'idle' || state.status === 'loading') return null;

  const isSuccess = state.status === 'success';

  return (
    <View style={[styles.banner, isSuccess ? styles.success : styles.error]}>
      <Text style={styles.icon}>{isSuccess ? '✓' : '✕'}</Text>
      <Text style={styles.message}>
        {isSuccess
          ? `Slot confirmed! ID: ${state.data.bookingId.slice(0, 8)}...`
          : state.message}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 10,
  },
  success: {
    backgroundColor: '#052e16',
    borderWidth: 1,
    borderColor: '#16a34a',
  },
  error: {
    backgroundColor: '#1c0a0a',
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  icon: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  message: {
    flex: 1,
    color: '#e5e7eb',
    fontSize: 14,
    fontWeight: '500',
  },
});