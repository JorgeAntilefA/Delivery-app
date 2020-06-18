import React from "react";
import { StyleSheet } from "react-native";
import MapView from "react-native-maps";
import openMaps from "react-native-open-maps";

export default function Map(props) {
  // console.log(props);
  const { latitud, longitud, direccion, comuna } = props;
  // const origin = { latitude: 37.3318456, longitude: -122.0296002 };
  //const destination = { latitude: 37.771707, longitude: -122.4053769 };
  //console.log(latitud);
  const GOOGLE_MAPS_APIKEY = "AIzaSyA4ZZNjoY-DK2odO_2ZHpp-ju479SYq29s";
  const openAppMap = () => {
    openMaps({
      latitude: parseFloat(latitud),
      longitude: parseFloat(longitud),
      zoom: 19,
      end: direccion + ", " + comuna,
    });
  };

  return (
    <MapView
      style={styles.mapStyle}
      onPress={openAppMap}
      initialRegion={{
        latitude: parseFloat(latitud),
        longitude: parseFloat(longitud),
        latitudeDelta: 0.08,
        longitudeDelta: 0.05,
      }}
    >
      <MapView.Marker
        coordinate={{
          latitude: parseFloat(latitud),
          longitude: parseFloat(longitud),
        }}
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
