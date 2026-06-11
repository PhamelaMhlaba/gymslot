import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { getCapacityThreshold } from '../utils/capacityConfig.js';

interface CapacityRingProps {
  percentageFull: number;
  size?: number;
  strokeWidth?: number;
}

export const CapacityRing: React.FC<CapacityRingProps> = ({
  percentageFull,
  size = 180,
  strokeWidth = 14,
}) => {
  const threshold = getCapacityThreshold(percentageFull);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPercent = Math.min(Math.max(percentageFull, 0), 100);
  const strokeDashoffset = circumference - (clampedPercent / 100) * circumference;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#2d2d3a"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={threshold.ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.labelContainer}>
        <Text style={[styles.percentage, { color: threshold.color }]}>
          {clampedPercent}%
        </Text>
        <Text style={styles.levelLabel}>{threshold.label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1,
  },
  levelLabel: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
});