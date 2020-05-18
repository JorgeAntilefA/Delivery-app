import React from "react";
import { StyleSheet } from "react-native";
import MapView from "react-native-maps";
import openMaps from "react-native-open-maps";
import MapViewDirections from "react-native-maps-directions";

export default function Map() {
  const origin = { latitude: 37.3318456, longitude: -122.0296002 };
  const destination = { latitude: 37.771707, longitude: -122.4053769 };
  const GOOGLE_MAPS_APIKEY = "AIzaSyA4ZZNjoY-DK2odO_2ZHpp-ju479SYq29s";
  const openAppMap = () => {
    openMaps({
      latitude: -33.4240305,
      longitude: -70.743708,
      zoom: 19,
    });
  };

  return (
    <MapView
      style={styles.mapStyle}
      onPress={openAppMap}
      initialRegion={{
        latitude: -33.4240305,
        longitude: -70.743708,
        latitudeDelta: 0.08,
        longitudeDelta: 0.05,
      }}
    >
      <MapView.Marker
        coordinate={{ latitude: -33.4240305, longitude: -70.743708 }}
        apikey={GOOGLE_MAPS_APIKEY}
      />
    </MapView>
  );
}

const styles = StyleSheet.create({
  mapStyle: {
    width: "100%",
    height: "13%",
  },
});
