import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useGymCapacity } from '../hooks/useGymCapacity.js';
import { CapacityRing } from '../components/CapacityRing.js';
import { BookingButton } from '../components/BookingButton.js';
import { StatusBanner } from '../components/StatusBanner.js';
import { getNextSlotTime } from '../utils/capacityConfig.js';

interface GymCapacityScreenProps {
  gymId: string;
  userId: string;
}

export const GymCapacityScreen: React.FC<GymCapacityScreenProps> = ({
  gymId,
  userId,
}) => {
  const { capacityState, bookingState, refresh, bookSlot } = useGymCapacity(gymId);

  const handleBook = useCallback(() => {
    bookSlot(userId, getNextSlotTime());
  }, [bookSlot, userId]);

  if (capacityState.status === 'loading' || capacityState.status === 'idle') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centred}>
          <ActivityIndicator size="large" color="#6366f1" />
          <Text style={styles.loadingText}>Loading capacity...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (capacityState.status === 'error') {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centred}>
          <Text style={styles.errorTitle}>Could not load gym data</Text>
          <Text style={styles.errorMessage}>{capacityState.message}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={refresh}>
            <Text style={styles.retryText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const { data } = capacityState;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={capacityState.status === 'loading'}
            onRefresh={refresh}
            tintColor="#6366f1"
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.gymName}>{data.gymName}</Text>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </View>

        <View style={styles.ringWrapper}>
          <CapacityRing percentageFull={data.percentageFull} />
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{data.currentBookings}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{data.capacity}</Text>
            <Text style={styles.statLabel}>Max Capacity</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{data.capacity - data.currentBookings}</Text>
            <Text style={styles.statLabel}>Available</Text>
          </View>
        </View>

        <View style={styles.bookingSection}>
          <BookingButton
            onPress={handleBook}
            isLoading={bookingState.status === 'loading'}
            isDisabled={!data.available}
          />
          <StatusBanner state={bookingState} />
        </View>

        <Text style={styles.refreshHint}>Pull down to refresh · auto-updates every 30s</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f0f14',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
  },
  centred: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#9ca3af',
    fontSize: 15,
    marginTop: 12,
  },
  errorTitle: {
    color: '#f87171',
    fontSize: 18,
    fontWeight: '700',
  },
  errorMessage: {
    color: '#9ca3af',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 28,
    backgroundColor: '#1f2937',
    borderRadius: 8,
  },
  retryText: {
    color: '#e5e7eb',
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 36,
    alignSelf: 'flex-start',
  },
  gymName: {
    color: '#f9fafb',
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#14532d',
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 3,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#22c55e',
  },
  liveText: {
    color: '#22c55e',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  ringWrapper: {
    marginBottom: 32,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 24,
    width: '100%',
    marginBottom: 36,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    color: '#f9fafb',
    fontSize: 24,
    fontWeight: '700',
  },
  statLabel: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#2d2d3a',
    marginVertical: 4,
  },
  bookingSection: {
    alignItems: 'center',
    width: '100%',
  },
  refreshHint: {
    color: '#4b5563',
    fontSize: 12,
    marginTop: 28,
    textAlign: 'center',
  },
});