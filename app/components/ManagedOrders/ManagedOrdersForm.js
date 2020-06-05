import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  AsyncStorage,
} from "react-native";
import Constants from "./../../utils/Constants";
import { SearchBar } from "react-native-elements";
import { useIsFocused } from "@react-navigation/native";

const useDebounce = (query) => {
  const [debounceValue, setDebounceValue] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounceValue(query);
    }, 100);

    return () => {
      clearTimeout(timer);
    };
  }, [query, 100]);

  return debounceValue;
};

export default function ManagedOrdersForm(props) {
  const [query, setQuery] = useState("");
  const debounceQuery = useDebounce(query);
  const [filteredCountryList, setFilteredCountryList] = useState();
  const [isVisibleLoading, setIsvisibleLoading] = useState(false);
  const [data, setData] = useState();
  const { url } = Constants;
  const { navigation, route } = props;
  const isFocused = useIsFocused();
  const [userTitle, setUserTitle] = useState();
  const [carrierTitle, setCarrierTitle] = useState();

  useEffect(() => {
    const getRememberedOrders = async () => {
      try {
        const credentialsUser = await AsyncStorage.getItem(
          "@localStorage:dataOrder"
        );

        //console.log(JSON.parse(credentialsUser));

        // const prueba = JSON.parse(credentialsUser);
        //console.log(prueba);
        // const index = prueba.findIndex(
        //   (x) => x.pedido === "179597679295987182094005"
        // );

        // console.log(index);
        // if (index !== undefined) prueba.splice(index, 1);

        // console.log(prueba);

        // var a =
        //   '{"carrier": "KWT_prueba",' +
        //   '"comuna": "prueba",' +
        //   '"direccion": "LAS DELICIAS 355 Piso 3 salud",' +
        //   '"estado_entrega": "Sin Estado",' +
        //   '"fecha": "2020-06-03",' +
        //   '"id_solicitudes_carrier_sac_estado": null,' +
        //   '"manifiesto": "63674",' +
        //   '"nombre_cliente": "CATALINA BENAVENTE REYES",' +
        //   '"nombre_manifiesto": "KWT RUTA NACIMIENTO",' +
        //   '"observacion_sac": null,' +
        //   '"pedido": "179597679295987182094005",' +
        //   '"solicitud": "1",' +
        //   '"tipo_solicitud": null }';
        // var obj = JSON.parse(a);
        // prueba.push(obj);

        // console.log(prueba);

        if (credentialsUser !== null) {
          const lowerCaseQuery = debounceQuery.toLowerCase();

          const newCountries = JSON.parse(credentialsUser)
            .filter(
              (country) =>
                country.pedido.includes(lowerCaseQuery) &&
                country.estado_entrega !== "Sin Estado"
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
  }, [isFocused]);

  return (
    <View>
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
    estado_entrega,
    recibe_nombre,
    recibe_rut,
  } = props.item;
  const { navigation, user, carrierUser } = props;

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("modifyManagedOrder", {
          pedido: pedido,
          manifiesto: manifiesto,
          direccion: direccion,
          nombre_cliente: nombre_cliente,
          carrier: carrier,
          fecha: fecha,
          user: user,
          carrierUser: carrierUser,
          estado_entrega: estado_entrega,
          recibe_nombre: recibe_nombre,
          recibe_rut: recibe_rut,
        })
      }
    >
      <View style={styles.item}>
        <View style={styles.inline}>
          <Text style={styles.pedido}>{pedido} </Text>
          <Text style={styles.manifiesto}>{manifiesto} </Text>
        </View>
        <View style={styles.inline}>
          <Image
            source={require("../../../assets/google.png")}
            style={styles.logo}
            resizeMode="contain"
            //backgroundColor="red"
          />
          <View style={styles.containerInfo}>
            <Text style={styles.comuna}>{comuna} </Text>
            <Text style={styles.direccion}>{direccion}</Text>
            <Text style={styles.nombre_cliente}>{nombre_cliente}</Text>
          </View>
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
    width: "80%",
    marginLeft: 10,
  },
  comuna: {
    fontWeight: "bold",
    fontSize: 18,
    //width: "77%",
    width: "73%",
    textAlign: "center",
    backgroundColor: "#DF7401",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },
  direccion: {
    fontSize: 18,
    fontWeight: "bold",
  },
  nombre_cliente: {
    fontSize: 17,
  },
  item: {
    padding: 10,
  },
  title: {
    fontSize: 32,
  },
  logo: {
    width: 50,
    height: 56,
    // width: 40,
    // height: 46
  },
  inputForm: {
    height: 35,
    marginBottom: 10,
    color: "rgb(32,53,70)",
    paddingHorizontal: 10,
    // backgroundColor: "rgba(255,255,255,0.2)",
  },
});
