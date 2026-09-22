// src/presentation/components/bitacora/PanelBienestar.tsx

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutAnimation,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS } from '../../../../constants/colors';
import {
  Alerta,
  Recomendacion,
} from '../../../domain/usecases/bitacora/DetectarPatronesUseCase';

import KiiTranquilo from '../../../../assets/images/kii-normal.svg';
import KiiPreocupado from '../../../../assets/images/kii-preocupado.svg';
import KiiMuyPreocupado from '../../../../assets/images/kii-muy-preocupado.svg';

export interface PanelBienestarProps {
  alertas: Alerta[];
  resumen: string;
  recomendaciones?: Recomendacion[];
  requiereProfesional?: boolean;
  // Callbacks opcionales: si el padre no los pasa, el componente navega solo.
  onVerProfesionales?: () => void;
  onIrARelajacion?: () => void;
  onHablarConKii?: () => void;
}

type PerfilKii = 'tranquilo' | 'preocupado' | 'muyPreocupado';

interface KiiProfile {
  nombre: string;
  SvgComponent: React.FC<any>;
  mensajeRespaldo: string;
  nivelTexto: string;
  nivelColor: string;
  nivelFondo: string;
}

const KII_PROFILES: Record<PerfilKii, KiiProfile> = {
  tranquilo: {
    nombre: 'Kii Tranquilo',
    SvgComponent: KiiTranquilo,
    mensajeRespaldo: 'Ninguna novedad',
    nivelTexto: 'Nivel bajo',
    nivelColor: COLORS.white,
    nivelFondo: COLORS.primaryDark,
  },
  preocupado: {
    nombre: 'Kii Preocupado',
    SvgComponent: KiiPreocupado,
    mensajeRespaldo:
      'He notado algunos patrones que podrían ser interesantes explorar juntos.',
    nivelTexto: 'Nivel medio',
    nivelColor: '#FF9800',
    nivelFondo: '#FFF3E0',
  },
  muyPreocupado: {
    nombre: 'Kii Muy Preocupado',
    SvgComponent: KiiMuyPreocupado,
    mensajeRespaldo: 'He notado algunos patrones que requieren tu atención.',
    nivelTexto: 'Nivel alto',
    nivelColor: '#F44336',
    nivelFondo: '#FFEBEE',
  },
};

function primeraOracion(texto: string): string {
  if (!texto) return '';
  const limpio = texto.replace(/\s+/g, ' ').trim();
  if (!limpio) return '';
  const match = limpio.match(/^[^.!?]+[.!?]/);
  return (match ? match[0] : limpio).trim();
}

export default function PanelBienestar({
  alertas,
  resumen,
  recomendaciones = [],
  requiereProfesional = false,
  onVerProfesionales,
  onIrARelajacion,
  onHablarConKii,
}: PanelBienestarProps) {
  const router = useRouter();
  const [expandido, setExpandido] = useState(false);

  // Resetear el estado expandido cuando cambia el análisis
  useEffect(() => {
    setExpandido(false);
  }, [resumen, alertas?.length]);

  const perfilKii: PerfilKii = useMemo(() => {
    if (!alertas || alertas.length === 0) return 'tranquilo';
    const tieneAlto = alertas.some((a) => a.nivel === 'alto');
    if (tieneAlto || requiereProfesional) return 'muyPreocupado';
    const tieneMedio = alertas.some((a) => a.nivel === 'medio');
    if (tieneMedio) return 'preocupado';
    return 'tranquilo';
  }, [alertas, requiereProfesional]);

  const kii = KII_PROFILES[perfilKii];
  const hayAlertas = !!alertas && alertas.length > 0;

  const mensajeCerrado = primeraOracion(resumen) || kii.mensajeRespaldo;
  const mensajePrincipal = hayAlertas ? alertas[0].mensaje : '';
  const sugerenciaPrincipal = hayAlertas ? alertas[0].sugerencia : '';

  const recomendacionesSecundarias = useMemo(
    () => (recomendaciones ?? []).filter((r) => !r.prioritaria),
    [recomendaciones]
  );

  const toggleExpandido = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandido((prev) => !prev);
  };

  const handleHablarConKii = () => {
    if (onHablarConKii) return onHablarConKii();
    router.push('/kii-chat');
  };

  const handleIrARelajacion = () => {
    if (onIrARelajacion) return onIrARelajacion();
    router.push('/zona-relajacion');
  };

  const handleVerProfesionales = () => {
    router.push('/specialists');
  };

  if (!expandido) {
    return (
      <TouchableOpacity
        style={styles.cardCerrado}
        onPress={toggleExpandido}
        activeOpacity={0.8}
      >
        <View style={styles.cardCerradoContent}>
          <View style={styles.kiiContainerCerrado}>
            <kii.SvgComponent width={85} height={85} />
          </View>
          <View style={styles.cardCerradoTextContainer}>
            <Text
              style={styles.cardCerradoMensaje}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {mensajeCerrado}
            </Text>
            <View
              style={[styles.nivelBadge, { backgroundColor: kii.nivelFondo }]}
            >
              <Text style={[styles.nivelTexto, { color: kii.nivelColor }]}>
                {kii.nivelTexto}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-down" size={18} color={COLORS.primaryDark} />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.cardAbierto}>
      <Text style={styles.titulo}>Panel de Bienestar</Text>

      {!!resumen && <Text style={styles.resumenTexto}>{resumen}</Text>}

      {!!mensajePrincipal && (
        <View style={styles.alertaCard}>
          <View style={styles.alertaCardHeader}>
            <Ionicons name="alert-circle-outline" size={16} color="#D97706" />
            <Text style={styles.alertaCardLabel}>Alerta principal</Text>
          </View>
          <Text style={styles.alertaMensaje}>{mensajePrincipal}</Text>
          {!!sugerenciaPrincipal && (
            <View style={styles.sugerenciaWrap}>
              <Ionicons name="bulb-outline" size={14} color="#92400E" />
              <Text style={styles.sugerenciaPrincipal}>
                {sugerenciaPrincipal}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* CTA especialistas */}
      {requiereProfesional && (
        <TouchableOpacity
          style={styles.botonProfesional}
          onPress={handleVerProfesionales}
          activeOpacity={0.85}
        >
          <Ionicons name="medkit-outline" size={18} color="#FFFFFF" />
          <Text style={styles.botonProfesionalTexto}>
            Ver especialistas cercanos
          </Text>
        </TouchableOpacity>
      )}

      {/* Recomendaciones secundarias */}
      {recomendacionesSecundarias.length > 0 && (
        <View style={styles.recomendacionesContainer}>
          <Text style={styles.recomendacionesTitulo}>¿Qué puedes intentar?</Text>
          {recomendacionesSecundarias.map((rec, index) => (
            <View key={`${rec.accion}-${index}`} style={styles.recomendacionItem}>
              <View style={styles.recomendacionHeader}>
                <Ionicons
                  name="heart-outline"
                  size={18}
                  color={COLORS.primaryDark}
                />
                <Text style={styles.recomendacionAccion}>{rec.accion}</Text>
              </View>
              <Text style={styles.recomendacionDetalle}>{rec.detalle}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Accesos rápidos */}
      <View style={styles.accionesContainer}>
        <Text style={styles.accionesTitulo}>¿Qué puedes hacer hoy?</Text>

        <TouchableOpacity
          style={styles.accionItem}
          onPress={handleHablarConKii}
          activeOpacity={0.7}
        >
          <View style={styles.accionIconWrap}>
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={20}
              color={COLORS.primaryDark}
            />
          </View>
          <View style={styles.accionTexto}>
            <Text style={styles.accionTitulo}>Hablar con Kii</Text>
            <Text style={styles.accionSubtitulo}>Puedes contarle tu día</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.gray[400]} />
        </TouchableOpacity>

        <View style={styles.accionSeparador} />

        <TouchableOpacity
          style={styles.accionItem}
          onPress={handleIrARelajacion}
          activeOpacity={0.7}
        >
          <View style={styles.accionIconWrap}>
            <Ionicons name="leaf-outline" size={20} color={COLORS.primaryDark} />
          </View>
          <View style={styles.accionTexto}>
            <Text style={styles.accionTitulo}>Ir a la zona de relajación</Text>
            <Text style={styles.accionSubtitulo}>
              Siempre es importante hacer un espacio para conectar contigo
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={COLORS.gray[400]} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.botonCerrar}
        onPress={toggleExpandido}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-up" size={24} color={COLORS.primaryDark} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  // Vista cerrada
  cardCerrado: {
    marginTop: 16,
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    padding: 22,
    shadowColor: '#348915',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardCerradoContent: { 
  flexDirection: 'row', 
  alignItems: 'center' 
  },
  kiiContainerCerrado: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    flexShrink: 0,
  },
  cardCerradoTextContainer: { 
  flex: 1, 
  marginRight: 8 
  },
  cardCerradoMensaje: {
    fontSize: 13,
    color: COLORS.gray[700],
    lineHeight: 18,
    marginBottom: 8,
  },
  nivelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  nivelTexto: { 
  fontSize: 12, 
  fontWeight: '600' 
  },
  // Vista expandida
  cardAbierto: {
    marginTop: 16,
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: COLORS.secondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primaryDark,
    marginBottom: 12,
  },
  resumenTexto: {
    fontSize: 14,
    color: COLORS.gray[700],
    lineHeight: 20,
    marginBottom: 10,
  },
  alertaCard: {
    backgroundColor: '#FEF3E2',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FCD9A0',
  },
  alertaCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  alertaCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  alertaMensaje: {
    fontSize: 14,
    color: '#78350F',
    lineHeight: 20,
    marginBottom: 8,
  },
  sugerenciaWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  sugerenciaPrincipal: {
    flex: 1,
    marginLeft: 6,
    fontSize: 12.5,
    color: '#78350F',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  botonProfesional: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F44336',
    borderRadius: 25,
    paddingVertical: 14,
    marginTop: 4,
    marginBottom: 16,
  },
  botonProfesionalTexto: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  recomendacionesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  recomendacionesTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 14,
  },
  recomendacionItem: { marginBottom: 12 },
  recomendacionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recomendacionAccion: {
    fontSize: 14,
    fontWeight: '600',
    color: '#997918',
    marginLeft: 8,
  },
  recomendacionDetalle: {
    fontSize: 13,
    color: COLORS.gray[600],
    lineHeight: 18,
    marginLeft: 26,
  },
  accionesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  accionesTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primaryDark,
    marginBottom: 10,
  },
  accionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  accionSeparador: {
    height: 1,
    backgroundColor: COLORS.gray[100],
    marginVertical: 4,
  },
  accionIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  accionTexto: { flex: 1 },
  accionTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.title_black,
    marginBottom: 2,
  },
  accionSubtitulo: {
    fontSize: 12,
    color: COLORS.gray[600],
    lineHeight: 16,
  },
  botonCerrar: {
    alignItems: 'center',
    marginTop: 10,
    paddingVertical: 2,
  },
});