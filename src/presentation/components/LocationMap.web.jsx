import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from 'react';
import { View, StyleSheet } from 'react-native';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const LocationMap = forwardRef(
  (
    {
      initialRegion,
      markerCoordinate,
      onMapPress,
    },
    ref
  ) => {
    const mapContainerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    useEffect(() => {
      if (!mapContainerRef.current || mapRef.current) {
        return;
      }

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
      });

      mapRef.current = map;

      const initialZoom = 13;

      map.setView(
        [initialRegion.latitude, initialRegion.longitude],
        initialZoom
      );

      L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution:
            '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }
      ).addTo(map);

      map.on('click', (event) => {
        if (onMapPress) {
          onMapPress({
            latitude: event.latlng.lat,
            longitude: event.latlng.lng,
          });
        }
      });

      setTimeout(() => {
        map.invalidateSize();
      }, 100);

      return () => {
        map.remove();
        mapRef.current = null;
      };
    }, []);

    useEffect(() => {
      if (!mapRef.current) {
        return;
      }

      if (markerCoordinate) {
        const latLng = [
          markerCoordinate.latitude,
          markerCoordinate.longitude,
        ];

        if (!markerRef.current) {
          markerRef.current = L.marker(latLng).addTo(
            mapRef.current
          );

          markerRef.current.bindPopup(
            'Tu ubicación elegida'
          );
        } else {
          markerRef.current.setLatLng(latLng);
        }

        mapRef.current.setView(latLng, 16);
      } else if (markerRef.current) {
        mapRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
    }, [markerCoordinate]);

    useImperativeHandle(ref, () => ({
      animateToRegion: (region) => {
        if (!mapRef.current) {
          return;
        }

        mapRef.current.setView(
          [region.latitude, region.longitude],
          16,
          {
            animate: true,
          }
        );
      },
    }));

    return (
      <View style={styles.container}>
        <div
          ref={mapContainerRef}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </View>
    );
  }
);

LocationMap.displayName = 'LocationMap';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
});

export default LocationMap;