
import React, { useState, useRef, useEffect, JSX } from 'react';
import {
  View,
  Text,
  StyleSheet,
  PanResponder,
  Animated,
  TouchableOpacity,
  Dimensions,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { COLORS, ENERGY_COLORS } from '../../../../constants/colors';

const { width: screenWidth } = Dimensions.get('window');

export interface IntensitySliderProps {
  value?: number;
  onValueChange?: (value: number) => void;
  min?: number;
  max?: number;
}

export default function IntensitySlider({
  value = 5,
  onValueChange,
  min = 1,
  max = 10,
}: IntensitySliderProps): JSX.Element {
  const [sliderValue, setSliderValue] = useState<number>(value);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // FIX: el ancho del track ahora también vive en estado.
  // Antes solo se guardaba en un ref (containerWidth.current) y los rangos
  // del interpolate de Animated se calculaban durante el render usando ese
  // ref. Si el componente no volvía a renderizarse después de medir el
  // layout (onLayout), el interpolate quedaba "congelado" con el ancho
  // inicial (0), y el thumb se veía pegado a la posición 0 aunque el
  // número mostrado sí fuera el correcto. Con el ancho en estado, medir el
  // layout SIEMPRE dispara un re-render y el interpolate se recalcula.

  const [containerWidth, setCotainerWidth] = useState<number>(0);
  // Copia "viva" del ancho para que el PanResponder (creado una sola vez
  // con useRef) siempre lea el valor más reciente sin closures obsoletos.
  const containerWidthRef = useRef<number>(0);
  const pan = useRef<Animated.Value>(new Animated.Value(0)).current;
  const thumbPosition = useRef<number>(0);

  const getEnergyColor = (val: number): string => {
    if (val <= 4) return ENERGY_COLORS.low;
    if (val <= 7) return ENERGY_COLORS.medium;
    return ENERGY_COLORS.high;
  };

  const getPositionFromValue = (val: number): number => {
    return (val - min) / (max - min);
  };

  const getValueFromPosition = (position: number): number => {
    if (isNaN(position) || !isFinite(position) || position < 0 || position > 1) {
      return min;
    }
    return Math.round(position * (max - min) + min);
  };

  // Sincroniza la posición del thumb cuando cambia `value` desde fuera
  // (p. ej. al editar un registro existente) o en cuanto ya conocemos el
  // ancho real del contenedor. Antes esto se saltaba si value === sliderValue
  // (el caso típico del primer render), que era justo la otra mitad del bug.

  useEffect(() => {
    if (!isDragging && containerWidth > 0) {
      setSliderValue(value);
      const position = getPositionFromValue(value);
      const newX = position * containerWidth;
      pan.setValue(newX);
      thumbPosition.current = newX;
    }
  }, [value]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        setIsDragging(true);
      },
      onPanResponderMove: (_evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
        const width = containerWidthRef.current;
        if (width === 0) return;

        const newX = Math.max(0, Math.min(width, gestureState.dx + thumbPosition.current));
        const position = newX / width;
        const newValue = getValueFromPosition(position);

        setSliderValue(newValue);
        pan.setValue(newX);

        if (onValueChange) {
          onValueChange(newValue);
        }
      },
      onPanResponderRelease: () => {
        thumbPosition.current = (pan as any)._value;
        setIsDragging(false);
      },
    })
  ).current;

  const renderMarks = (): JSX.Element[] => {
    const marks: JSX.Element[] = [];
    for (let i = min; i <= max; i++) {
      const position = getPositionFromValue(i);
      const isActive = i <= sliderValue;
      marks.push(
        <View
          key={i}
          style={[
            styles.mark,
            { left: `${position * 100}%` },
            isActive && styles.markActive,
          ]}
        />
      );
    }
    return marks;
  };

  const renderColorBar = (): JSX.Element => {
    const segments = [
      { color: ENERGY_COLORS.low, position: 0.33 },
      { color: ENERGY_COLORS.medium, position: 0.66 },
      { color: ENERGY_COLORS.high, position: 1 },
    ];

    return (
      <View style={styles.colorBarContainer}>
        {segments.map((segment, index) => {
          const prevPosition = index > 0 ? segments[index - 1].position : 0;
          const width = (segment.position - prevPosition) * 100;
          return (
            <View
              key={index}
              style={[
                styles.colorSegment,
                {
                  backgroundColor: segment.color,
                  width: `${width}%`,
                  borderTopLeftRadius: index === 0 ? 4 : 0,
                  borderBottomLeftRadius: index === 0 ? 4 : 0,
                  borderTopRightRadius: index === segments.length - 1 ? 4 : 0,
                  borderBottomRightRadius: index === segments.length - 1 ? 4 : 0,
                },
              ]}
            />
          );
        })}
        <Animated.View
          style={[
            styles.progressOverlay,
            {
              // FIX: usamos el estado `containerWidth` (reactivo) en vez del
              // ref, así este interpolate se recalcula cuando cambia el layout.
              width: pan.interpolate({
                inputRange: [0, containerWidth || 1],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            },
          ]}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View
        style={styles.sliderContainer}
        onLayout={(event) => {
          const w = event.nativeEvent.layout.width;
          containerWidthRef.current = w;
          setCotainerWidth(w);

          const initialValue = value;
          const initialPosition = getPositionFromValue(initialValue);
          const initialX = initialPosition * w;
          pan.setValue(initialX);
          thumbPosition.current = initialX;
          setSliderValue(initialValue);
        }}
      >
        <View style={styles.sliderTrack}>
          {renderColorBar()}
          {renderMarks()}
        </View>

        <TouchableOpacity
          style={styles.touchArea}
          activeOpacity={1}
        >
          <View {...panResponder.panHandlers} style={styles.thumbContainer}>
            <Animated.View
              style={[
                styles.thumb,
                {
                  transform: [
                    {
                      // Fix: mismo motivo, usamos 'containerWidth' de estado
                      translateX: pan.interpolate({
                        inputRange: [0, containerWidth || 1],
                        outputRange: [0, containerWidth || 1],
                        extrapolate: 'clamp',
                      }),
                    },
                  ],
                },
                isDragging && styles.thumbActive,
              ]}
            >
              <Text style={[styles.thumbValue, { color: getEnergyColor(sliderValue) }]}>
                {sliderValue}
              </Text>
            </Animated.View>
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.labelsContainer}>
        <Text style={styles.label}>{min}</Text>
        <Text style={[styles.label, styles.labelCenter]}>
          {Math.round((min + max) / 2)}
        </Text>
        <Text style={styles.label}>{max}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  labelsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray[400],
  },
  labelCenter: {
    color: COLORS.gray[500],
  },
  sliderContainer: {
    position: 'relative',
    height: 40,
    justifyContent: 'center',
    marginBottom: 12,
  },
  sliderTrack: {
    height: 8,
    borderRadius: 4,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: COLORS.gray[200],
  },
  colorBarContainer: {
    flexDirection: 'row',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderRadius: 4,
    overflow: 'hidden',
  },
  colorSegment: {
    height: '100%',
  },
  progressOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 4,
  },
  mark: {
    position: 'absolute',
    width: 2,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.5)',
    top: -2,
    transform: [{ translateX: -1 }],
  },
  markActive: {
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
  touchArea: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  thumbContainer: {
    height: 42,
    justifyContent: 'center',
  },
  thumb: {
    width: 42,
    height: 42,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: COLORS.secondaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    marginLeft: -22,
  },
  thumbActive: {
    borderWidth: 3,
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  thumbValue: {
    fontSize: 15,
    fontWeight: '700',
  },
});