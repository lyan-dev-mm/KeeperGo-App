
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
  const pan = useRef<Animated.Value>(new Animated.Value(0)).current;
  const containerWidth = useRef<number>(0);
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

  useEffect(() => {
    if (!isDragging && value !== sliderValue) {
      setSliderValue(value);
      const position = getPositionFromValue(value);
      const newX = position * containerWidth.current;
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
        if (containerWidth.current === 0) return;

        const newX = Math.max(0, Math.min(containerWidth.current, gestureState.dx + thumbPosition.current));
        const position = newX / containerWidth.current;
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
              width: pan.interpolate({
                inputRange: [0, containerWidth.current || 1],
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
          containerWidth.current = event.nativeEvent.layout.width;
          const initialValue = value;
          const initialPosition = getPositionFromValue(initialValue);
          const initialX = initialPosition * containerWidth.current;
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
                      translateX: pan.interpolate({
                        inputRange: [0, containerWidth.current || 1],
                        outputRange: [0, containerWidth.current || 1],
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