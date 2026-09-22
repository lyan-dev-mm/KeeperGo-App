// src/presentation/components/survey/SurveyLayout.tsx

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../../constants/colors';
import { SurveyProgress } from './SurveyProgress';

interface SurveyLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  progress?: { current: number; total: number; label?: string };
  primaryAction?: {
    label: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
    icon?: keyof typeof Ionicons.glyphMap;
  };
  secondaryAction?: {
    label: string;
    onPress: () => void;
  };
  onClose?: () => void;
  /** @deprecated Ya no se muestra en el header. Se mantiene por compatibilidad. */
  answeredCounter?: { answered: number; total: number };
  /** Color de acento. Default: verde oscuro de Keeper Go */
  accentColor?: string;
}

export function SurveyLayout({
  title,
  subtitle,
  children,
  progress,
  primaryAction,
  secondaryAction,
  onClose,
  accentColor = COLORS.primaryDark,
}: SurveyLayoutProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ─── Header ─────────────────────────────────────────── */}
      <View style={styles.header}>
        {/* X a la izquierda — color primaryDark */}
        {onClose ? (
          <TouchableOpacity onPress={onClose} style={styles.headerIcon}>
            <Ionicons name="close" size={24} color={COLORS.primaryDark} />
          </TouchableOpacity>
        ) : (
          <View style={styles.headerIcon} />
        )}

        {/* Título y subtítulo — centrados, se truncan si son muy largos */}
        <View style={styles.headerCenter}>
          <Text
            style={styles.headerTitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={styles.headerSubtitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* Placeholder simétrico a la derecha (mismo ancho que la X) */}
        <View style={styles.headerIcon} />
      </View>

      {/* ─── Progress ───────────────────────────────────────── */}
      {progress ? (
        <SurveyProgress
          current={progress.current}
          total={progress.total}
          label={progress.label}
        />
      ) : null}

      {/* ─── Contenido ──────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>

      {/* ─── Footer ─────────────────────────────────────────── */}
      {(primaryAction || secondaryAction) ? (
        <View style={styles.footer}>
          {secondaryAction ? (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={secondaryAction.onPress}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryText}>{secondaryAction.label}</Text>
            </TouchableOpacity>
          ) : null}

          {primaryAction ? (
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: accentColor },
                (primaryAction.disabled || primaryAction.loading) &&
                  styles.primaryButtonDisabled,
              ]}
              onPress={primaryAction.onPress}
              disabled={primaryAction.disabled || primaryAction.loading}
              activeOpacity={0.85}
            >
              {primaryAction.loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.primaryText}>{primaryAction.label}</Text>
                  {primaryAction.icon ? (
                    <Ionicons name={primaryAction.icon} size={20} color="#FFFFFF" />
                  ) : null}
                </>
              )}
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFDF5' },

  // ─── Header ───────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    minHeight: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray[100],
  },
  headerIcon: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#514343',
    textAlign: 'center',
    width: '110%',
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray[500],
    marginTop: 2,
    textAlign: 'center',
    width: '100%',
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 16,
  },

  // ─── Footer ───────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray[100],
    backgroundColor: '#FFFFFF',
  },
  secondaryButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.gray[200],
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray[700],
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#eebe44',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonDisabled: {
    backgroundColor: COLORS.gray[200],
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});