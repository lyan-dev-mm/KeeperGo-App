import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import MapView, {
  Marker,
  PROVIDER_GOOGLE,
} from 'react-native-maps';

const LocationMap = forwardRef(
  (
    {
      initialRegion,
      markerCoordinate,
      onMapPress,
    },
    ref
  ) => {
    const mapRef = useRef(null);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region, duration = 1000) => {
        if (mapRef.current) {
          mapRef.current.animateToRegion(region, duration);
        }
      },
    }));

    return (
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onPress={onMapPress}
      >
        {markerCoordinate && (
          <Marker
            coordinate={markerCoordinate}
            title="Tu ubicación elegida"
            pinColor="red"
          />
        )}
      </MapView>
    );
  }
);

LocationMap.displayName = 'LocationMap';

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
});

export default LocationMap;