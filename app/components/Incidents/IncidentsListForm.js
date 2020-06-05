import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  AsyncStorage,
} from "react-native";
import Constants from "./../../utils/Constants";
import { SearchBar, Icon } from "react-native-elements";
import { useIsFocused } from "@react-navigation/native";
import { FAB } from "react-native-paper";
import { countries } from "countries-list";

const useDebounce = (query) => {
  const [debounceValue, setDebounceValue] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceValue(query);
    }, 200);

    return () => {
      clearTimeout(timer);
    };
  }, [query, 200]);

  return debounceValue;
};

export default function IncidentsListForm(props) {
  const [query, setQuery] = useState("");
  const debounceQuery = useDebounce(query);
  const [filteredCountryList, setFilteredCountryList] = useState();

  const [userTitle, setUserTitle] = useState();
  const [carrierTitle, setCarrierTitle] = useState();
  const { url } = Constants;
  const { navigation, route } = props;

  useEffect(() => {
    const getRememberedOrders = async () => {
      try {
        const credentialsUser = await AsyncStorage.getItem(
          "@localStorage:dataOrder"
        );
        //setFilteredCountryList(JSON.parse(credentialsUser));
        // console.log(credentialsUser);
        if (credentialsUser !== null) {
          const lowerCaseQuery = debounceQuery.toLowerCase();

          const newCountries = JSON.parse(credentialsUser)
            .filter(
              (country) =>
                country.solicitud != "1" &&
                country.pedido.includes(lowerCaseQuery)
            )
            .map((country) => ({
              ...country,
              rank: country.pedido.indexOf(lowerCaseQuery),
            }))
            .sort((a, b) => a.rank - b.rank);

          setFilteredCountryList(newCountries);
        }
      } catch (error) {
        console.log(error);
      }
    };

    const getRememberedTitle = async () => {
      try {
        const carrierTitle = await AsyncStorage.getItem("@localStorage:title");
        if (carrierTitle !== null) {
          setUserTitle(JSON.parse(carrierTitle).user);
          setCarrierTitle(JSON.parse(carrierTitle).carrier);
        }
      } catch (error) {
        console.log(error);
      }
    };

    getRememberedOrders();
    getRememberedTitle();
  }, [debounceQuery]);

  function ManifestButton() {
    return (
      <FAB
        style={styles.fab}
        label="S"
        onPress={() =>
          navigation.navigate("incidents", {
            solicitud: "Sobrante",
          })
        }
      />
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <SearchBar
        containerStyle={{ marginTop: 0 }}
        placeholder="Buscar pedido"
        onChangeText={setQuery}
        value={query}
      />

      <View
        style={{
          height: 20,
          backgroundColor: "#FACC2E",
          alignItems: "center",
        }}
      >
        <Text>
          {userTitle}
          {" - "}
          {carrierTitle}
        </Text>
      </View>
      <FlatList
        keyExtractor={(item, index) => `${index}`}
        data={filteredCountryList}
        renderItem={({ item }) => (
          <Order
            item={item}
            navigation={navigation}
            user={userTitle}
            carrierUser={carrierTitle}
          />
        )}
        ItemSeparatorComponent={({ item }) => <SeparatorManifest />}
      />
      <ManifestButton />
    </View>
  );
}
function SeparatorManifest() {
  return (
    <View
      style={{
        height: 1,
        // width: "100%",
        backgroundColor: "#CED0CE",
      }}
    />
  );
}
function Order(props) {
  const {
    pedido,
    direccion,
    comuna,
    manifiesto,
    nombre_cliente,
    carrier,
    fecha,
    tipo_solicitud,
    id_solicitudes_carrier_sac_estado,
    observacion_sac,
  } = props.item;
  const { navigation, user, carrierUser } = props;

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("responseIncidents", {
          pedido: pedido,
          manifiesto: manifiesto,
          direccion: direccion,
          nombre_cliente: nombre_cliente,
          carrier: carrier,
          fecha: fecha,
          user: user,
          carrierUser: carrierUser,
          tipo_solicitud: tipo_solicitud,
          observacion_sac: observacion_sac,
        })
      }
    >
      <View style={styles.item}>
        <View style={styles.inline}>
          <Text style={styles.pedido}>{pedido} </Text>
          <Text style={styles.manifiesto}>{manifiesto} </Text>
        </View>
        <View style={styles.inline}>
          <View style={styles.containerInfo}>
            <Text style={styles.solicitud}>{tipo_solicitud}</Text>
            <Text style={styles.nombre_cliente}>{nombre_cliente} </Text>
          </View>
          {id_solicitudes_carrier_sac_estado === "3" ? (
            <Icon
              name="check-circle"
              color="#00a2dd"
              size={50}

              //backgroundColor="red"
            />
          ) : (
            <Icon
              name="update"
              color="#CE0000"
              size={50}

              //backgroundColor="red"
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inline: {
    flex: 1,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  pedido: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    backgroundColor: "#68a0cf",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },
  manifiesto: {
    fontWeight: "bold",
    fontSize: 18,
    width: "20%",
    textAlign: "center",
    backgroundColor: "#00FF40",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },
  containerInfo: {
    width: "75%",
    marginLeft: 10,
  },
  solicitud: {
    fontWeight: "bold",
    fontSize: 18,
    //width: "77%",
    width: "75%",
    textAlign: "center",
    backgroundColor: "#E10F0F",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },
  direccion: {
    fontSize: 18,
    fontWeight: "bold",
  },
  nombre_cliente: {
    fontWeight: "bold",
    fontSize: 18,
    //width: "77%",
    width: "75%",
    textAlign: "center",
    backgroundColor: "#D77230",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },
  item: {
    padding: 10,
  },
  title: {
    fontSize: 32,
  },
  fab: {
    position: "absolute",
    margin: 36,
    right: 0,
    bottom: 0,
    fontWeight: "bold",
  },
});
