// src/presentation/components/survey/LikertScale.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/colors';

export interface LikertOption {
  value: number;
  label: string;
  shortLabel?: string;
}

type LikertVariant = 'badge' | 'checkbox' | 'list';
type LikertOrientation = 'horizontal' | 'vertical';

interface LikertScaleProps {
  options: LikertOption[];
  selected: number | null;
  onSelect: (value: number) => void;
  orientation?: LikertOrientation;
  variant?: LikertVariant;
  accentColor?: string;
}

export function LikertScale({
  options,
  selected,
  onSelect,
  orientation = 'horizontal',
  variant = 'badge',
  accentColor = '#eebe44',
}: LikertScaleProps) {
  // ─── Variant: list (uno por fila) ───────────────────────────
  if (variant === 'list') {
    return (
      <View style={styles.listContainer}>
        {options.map((option) => {
          const isSelected = selected === option.value;
          const label = option.shortLabel ?? option.label;

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.listOption,
                isSelected && {
                  backgroundColor: '#FFFDF5',
                  borderColor: accentColor,
                },
              ]}
              onPress={() => onSelect(option.value)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={option.label}
            >
              <View
                style={[
                  styles.listCheckbox,
                  isSelected && {
                    backgroundColor: accentColor,
                    borderColor: accentColor,
                  },
                ]}
              >
                {isSelected ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : null}
              </View>

              <Text
                style={[
                  styles.listLabel,
                  isSelected && styles.listLabelSelected,
                ]}
                numberOfLines={2}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  // ─── Variant: checkbox (horizontal, labels cortos) ──────────
  if (variant === 'checkbox') {
    return (
      <View
        style={[
          styles.container,
          orientation === 'vertical' && styles.containerVertical,
          styles.containerCheckbox,
        ]}
      >
        {options.map((option) => {
          const isSelected = selected === option.value;
          const label = option.shortLabel ?? option.label;

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.checkboxOption,
                isSelected && {
                  borderColor: accentColor,
                  backgroundColor: '#FFFDF5',
                },
              ]}
              onPress={() => onSelect(option.value)}
              activeOpacity={0.7}
              accessibilityRole="radio"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={option.label}
            >
              <View
                style={[
                  styles.checkbox,
                  isSelected && {
                    backgroundColor: accentColor,
                    borderColor: accentColor,
                  },
                ]}
              >
                {isSelected ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : null}
              </View>
              <Text
                style={[
                  styles.checkboxLabel,
                  isSelected && styles.checkboxLabelSelected,
                ]}
                numberOfLines={2}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    );
  }

  // ─── Variant: badge (número + label) ────────────────────────
  return (
    <View
      style={[
        styles.container,
        orientation === 'vertical' && styles.containerVertical,
      ]}
    >
      {options.map((option) => {
        const isSelected = selected === option.value;
        const label = option.shortLabel ?? option.label;

        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              orientation === 'vertical' && styles.optionVertical,
              isSelected && {
                borderColor: accentColor,
                backgroundColor: '#FFFDF5',
              },
            ]}
            onPress={() => onSelect(option.value)}
            activeOpacity={0.7}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={option.label}
          >
            <View
              style={[
                styles.valueBadge,
                isSelected && { backgroundColor: accentColor },
              ]}
            >
              <Text
                style={[
                  styles.valueText,
                  isSelected && styles.valueTextSelected,
                ]}
              >
                {option.value}
              </Text>
            </View>
            <Text
              style={[
                styles.optionLabel,
                isSelected && styles.optionLabelSelected,
              ]}
              numberOfLines={orientation === 'horizontal' ? 2 : 1}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
  },
  containerVertical: {
    flexDirection: 'column',
    gap: 10,
  },
  containerCheckbox: {
    flexDirection: 'row',
    gap: 6,
  },

  // ─── Variant: list ──────────────────────────────────────────
  listContainer: {
    gap: 8,
  },
  listOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    backgroundColor: '#FFFFFF',
    minHeight: 48,
  },
  listCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  listLabel: {
    flex: 1,
    fontSize: 14,
    color: COLORS.gray[600],
    fontWeight: '500',
  },
  listLabelSelected: {
    color: '#514343',
    fontWeight: '700',
  },

  // ─── Variant: badge ─────────────────────────────────────────
  option: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    backgroundColor: '#FFFFFF',
    gap: 6,
    minHeight: 76,
  },
  optionVertical: {
    flexDirection: 'row',
    flex: 0,
    justifyContent: 'flex-start',
    minHeight: 52,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 12,
  },
  valueBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray[600],
  },
  valueTextSelected: {
    color: '#FFFFFF',
  },
  optionLabel: {
    fontSize: 10,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 13,
    fontWeight: '500',
  },
  optionLabelSelected: {
    color: '#514343',
    fontWeight: '600',
  },

  // ─── Variant: checkbox ──────────────────────────────────────
  checkboxOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    backgroundColor: '#FFFFFF',
    gap: 6,
    minHeight: 70,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.gray[300],
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 9,
    color: COLORS.gray[600],
    textAlign: 'center',
    lineHeight: 12,
    fontWeight: '600',
  },
  checkboxLabelSelected: {
    color: '#514343',
    fontWeight: '700',
  },
});