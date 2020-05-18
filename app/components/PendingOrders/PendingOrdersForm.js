import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  AsyncStorage,
  RefreshControl,
} from "react-native";
import { SearchBar } from "react-native-elements";
import axios from "axios";
import Constants from "./../../utils/Constants";
import Loading from "../Loading";
import { useIsFocused } from "@react-navigation/native";

//await time
// const useDebounce = (value: any, delay: number) => {
//   const [debounceValue, setDebounceValue] = useState(value);

//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setDebounceValue(value);
//     }, delay);

//     return () => {
//       clearTimeout(timer);
//     };
//   }, [value, delay]);

//   return debounceValue;
// };

// Get the values of the countries and sort is alphabetically

export default function PendingOrdersForm(props) {
  const { navigation, route } = props;
  const [query, setQuery] = useState("");
  //const debounceQuery = useDebounce(query, 10);
  const [filteredCountryList, setFilteredCountryList] = useState();

  const [isVisibleLoading, setIsvisibleLoading] = useState(false);
  const isFocused = useIsFocused();
  const [data, setData] = useState();
  const { url } = Constants;
  const { manifests, carrier, user } = route.params;

  let manifiestos = manifests;
  const userP = user;
  const carrierUser = carrier;
  const [refresh, setRefresh] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    console.log("useEffect");
    const getPendingOrders = async () => {
      setIsvisibleLoading(true);
      load();
    };

    getPendingOrders();
  }, [manifiestos, isFocused]);

  const load = async () => {
    console.log("load");
    //();
    const params = new URLSearchParams();
    params.append("opcion", "getPedidosV3");
    params.append("manifiestos", manifiestos.toString());

    await axios
      .post(url, params)
      .then((response) => {
        setData(response.data.trim());
        rememberOrders(response.data.trim());
        //const lowerCaseQuery = debounceQuery.toLowerCase();

        const newCountries = JSON.parse(response.data.trim()).filter(
          (country) =>
            //country.pedido.includes(lowerCaseQuery) &&
            country.estado_entrega === "Sin Estado"
        );
        // .map((country) => ({
        // ...country,
        //rank: country.pedido.indexOf(lowerCaseQuery),
        //}))
        //.sort((a, b) => a.rank - b.rank);

        setFilteredCountryList(newCountries);
        setIsvisibleLoading(false);
        setRefreshing(false);
      })
      .catch((error) => {
        console.log(error);
      });
    const credentialsUser = await AsyncStorage.getItem(
      "@localStorage:dataOrder"
    );

    console.log(credentialsUser);
  };

  const rememberOrders = async (bd) => {
    try {
      await AsyncStorage.setItem("@localStorage:dataOrder", bd);
    } catch (error) {
      // console.log(error);
    }
  };

  const removeOrders = async () => {
    try {
      await AsyncStorage.removeItem("@localStorage:dataOrder");
    } catch (error) {
      console.log(error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    load();
    console.log("actualizado");
    //setRefreshing(false);
  }, [refreshing]);
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
          {userP}
          {" - "}
          {carrierUser}
        </Text>
      </View>
      <FlatList
        keyExtractor={(item, index) => `${index}`}
        data={filteredCountryList}
        renderItem={({ item }) => (
          <Order
            item={item}
            navigation={navigation}
            user={userP}
            carrierUser={carrierUser}
            refresh={refresh}
            setRefresh={setRefresh}
          />
        )}
        ItemSeparatorComponent={({ item }) => <SeparatorManifest />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
      {<Loading isVisible={isVisibleLoading} text="Cargando" />}
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
  } = props.item;
  const { navigation, user, carrierUser, refresh, setRefresh } = props;

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("manageOrder", {
          pedido: pedido,
          manifiesto: manifiesto,
          direccion: direccion,
          nombre_cliente: nombre_cliente,
          carrier: carrier,
          fecha: fecha,
          user: user,
          //   refresh: refresh,
          //   setRefresh: setRefresh,
          carrierUser: carrierUser,
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
});
