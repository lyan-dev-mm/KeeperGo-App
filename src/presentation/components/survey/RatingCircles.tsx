// src/presentation/components/survey/RatingCircles.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { COLORS } from '../../../../constants/colors';

export interface RatingCircleOption {
  value: number;
  color: string;
  /** Label que aparece debajo del círculo (opcional) */
  label?: string;
}

interface RatingCirclesProps {
  options: RatingCircleOption[];
  selected: number | null;
  onSelect: (value: number) => void;
  /** Labels en los extremos (debajo de los círculos) */
  leftLabel?: string;
  rightLabel?: string;
}

export function RatingCircles({
  options,
  selected,
  onSelect,
  leftLabel,
  rightLabel,
}: RatingCirclesProps) {
  return (
    <View style={styles.container}>
      <View style={styles.circlesRow}>
        {options.map((option) => {
          const isSelected = selected === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onSelect(option.value)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              style={styles.circleColumn}
            >
              <View
                style={[
                  styles.circle,
                  { borderColor: option.color },
                  isSelected && {
                    backgroundColor: option.color,
                    borderWidth: 2.5,
                  },
                ]}
              />
              {option.label ? (
                <Text
                  style={[
                    styles.optionLabel,
                    isSelected && styles.optionLabelSelected,
                  ]}
                >
                  {option.label}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {(leftLabel || rightLabel) ? (
        <View style={styles.labelsRow}>
          <Text style={styles.extremeLabel}>{leftLabel ?? ''}</Text>
          <Text style={styles.extremeLabel}>{rightLabel ?? ''}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 10,
  },
  circlesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  circleColumn: {
    alignItems: 'center',
    gap: 6,
    padding: 4,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    backgroundColor: '#FFFFFF',
  },
  optionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray[600],
  },
  optionLabelSelected: {
    color: '#514343',
    fontWeight: '700',
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 2,
  },
  extremeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#514343',
  },
});