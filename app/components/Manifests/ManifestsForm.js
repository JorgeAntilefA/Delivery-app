import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
  AsyncStorage,
  RefreshControl,
} from "react-native";
import axios from "axios";
import Loading from "../Loading";
import Constants from "../../utils/Constants";
import { FAB } from "react-native-paper";
import Toast from "react-native-easy-toast";

export default function ManifestsForm(props) {
  const { navigation, route } = props;
  const [data, setData] = useState();
  const [orders, setOrders] = useState();
  const { carrier, user } = route.params;

  const [isVisibleLoading, setIsvisibleLoading] = useState(false);
  const [selected, setSelected] = useState(new Map());
  const { url } = Constants;
  const toastRef = useRef();
  const [refreshing, setRefreshing] = useState(false);

  function getListState() {
    const params = new URLSearchParams();
    params.append("opcion", "getActivaEstados");
    params.append("carrier", carrier);

    return axios.post(url, params);
  }

  function getListIncidence() {
    const params = new URLSearchParams();
    params.append("opcion", "getTiposSolicitudes");
    params.append("carrier", carrier);

    return axios.post(url, params);
  }

  function getListManifest() {
    const params = new URLSearchParams();
    params.append("opcion", "getManifiestos");
    params.append("carrier", carrier);

    return axios.post(url, params);
  }

  // const load = async () => {
  //   await axios
  //     .all([getListState(), getListIncidence(), getListManifest()])
  //     .then(
  //       axios.spread((...responses) => {
  //         const responseListState = responses[0];
  //         const responseListIncidence = responses[1];
  //         const responseListManifest = responses[2];
  //         //setSelectedValueS(JSON.parse(responseListState.data.trim()));
  //         // rememberStates(responseListState.data.trim());
  //         //rememberIncidents(responseListIncidence.data.trim());

  //         if (Platform.OS === "ios") {
  //           console.log(responseListManifest.data);

  //           setData(responseListManifest.data);
  //           // RememberStates(responseListState.data.trim());
  //           //rememberIncidents(responseListIncidence.data);
  //         } else {
  //           rememberStates(responseListState.data.trim());
  //           rememberIncidents(responseListIncidence.data.trim());
  //           setData(JSON.parse(responseListManifest.data.trim()));
  //         }

  //         setIsvisibleLoading(false);
  //         setRefreshing(false);
  //       })
  //     )
  //     .catch((errors) => {
  //       console.log(errors);
  //     });
  // };

  const load = async () => {
    if (Platform.OS === "ios") {
      const params = new URLSearchParams();
      params.append("opcion", "getManifiestos");
      params.append("carrier", carrier);

      await axios
        .post(url, params)
        .then((response) => {
          //rememberOrders(response.data.trim());
          console.log(response.data);
          setData(response.data);
          setIsvisibleLoading(false);
          setRefreshing(false);
        })
        .catch((error) => {
          console.log(error);
          setIsvisibleLoading(false);
          setRefreshing(false);
        });
    } else {
      await axios
        .all([getListState(), getListIncidence(), getListManifest()])
        .then(
          axios.spread((...responses) => {
            const responseListState = responses[0];
            const responseListIncidence = responses[1];
            const responseListManifest = responses[2];
            //setSelectedValueS(JSON.parse(responseListState.data.trim()));
            // rememberStates(responseListState.data.trim());
            //rememberIncidents(responseListIncidence.data.trim());

            // if (Platform.OS === "ios") {
            //   console.log(responseListManifest.data);

            //   setData(responseListManifest.data);
            //   // RememberStates(responseListState.data.trim());
            //   //rememberIncidents(responseListIncidence.data);
            // } else {
            rememberStates(responseListState.data.trim());
            rememberIncidents(responseListIncidence.data.trim());
            setData(JSON.parse(responseListManifest.data.trim()));
            // }

            setIsvisibleLoading(false);
            setRefreshing(false);
          })
        )
        .catch((errors) => {
          console.log(errors);
        });
    }
  };

  const rememberStates = async (bd) => {
    try {
      await AsyncStorage.setItem("@localStorage:states", bd);
    } catch (error) {
      console.log(error);
    }
  };

  const rememberIncidents = async (bd) => {
    try {
      await AsyncStorage.setItem("@localStorage:incidents", bd);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const getManifests = async () => {
      setIsvisibleLoading(true);
      await load();
    };
    getManifests();
    setRefreshing(false);
    rememberTitle();
  }, [carrier]);

  const rememberTitle = async () => {
    try {
      let title = { carrier: carrier, user: user };
      await AsyncStorage.setItem("@localStorage:title", JSON.stringify(title));
    } catch (error) {
      console.log(error);
      toastRef.current.show("Error al guardar Carrier.");
    }
  };

  function Item({ id, title, selected, onSelect }) {
    return (
      <TouchableOpacity
        onPress={() => onSelect(id)}
        style={[
          styles.item,
          { backgroundColor: selected ? "#82FA58" : "#FFFFFF" },
        ]}
      >
        <Text style={styles.title}>
          {title.n_man} {"     "}
          {title.fecha}
        </Text>
        <Text style={styles.subtitle}>{title.nombre_manifiesto}</Text>
      </TouchableOpacity>
    );
  }

  const onSelect = React.useCallback(
    (n_man) => {
      const newSelected = new Map(selected);
      newSelected.has(n_man)
        ? newSelected.delete(n_man)
        : newSelected.set(n_man, !selected.get(n_man));
      setSelected(newSelected);
    },
    [selected]
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    load();
    setSelected(new Map());
    //setRefreshing(false);
  }, [refreshing]);

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === "ios" ? (
        <StatusBar barStyle="dark-content" />
      ) : (
        <StatusBar barStyle="light-content" />
      )}
      <View
        style={{
          height: 40,
          backgroundColor: "#151515",
        }}
      >
        <Text style={styles.titleScreen}>Seleccione Manifiestos</Text>
      </View>
      <View
        style={{
          height: 20,
          backgroundColor: "#FACC2E",
          alignItems: "center",
        }}
      >
        <Text>
          {user}
          {" - "}
          {carrier}
        </Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Item
            id={item.n_man}
            title={item}
            selected={!!selected.get(item.n_man)}
            onSelect={onSelect}
          />
        )}
        ItemSeparatorComponent={({ item }) => <SeparatorManifest />}
        extraData={selected}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {<Loading isVisible={isVisibleLoading} text="Cargando" />}
      <Toast
        style={styles.toast}
        ref={toastRef}
        position="center"
        opacity={0.5}
      />
      <ManifestButton />
    </SafeAreaView>
  );

  async function ValidateManifests() {
    setIsvisibleLoading(true);
    if (selected.size == 0) {
      toastRef.current.show("Debes seleccionar manifiesto");
    } else if (selected.size >= 5) {
      toastRef.current.show("5 manifiestos máximo");
    } else {
      let manifiestos = [...selected.keys()];
      const params = new URLSearchParams();
      params.append("opcion", "getPedidosV3");
      params.append("manifiestos", manifiestos.toString());

      await axios
        .post(url, params)
        .then((response) => {
          //
          //RemenberOrders(response.data);
          //setOrders(response.data);
          if (Platform.OS === "ios") {
            try {
              AsyncStorage.setItem(
                "@localStorage:dataOrder",
                JSON.stringify(response.data)
              );
            } catch (error) {
              console.log(error);
            }
          } else {
            RemenberOrders(response.data);
          }
          navigation.navigate("pendings", {
            screen: "pendientes",
            params: {
              manifiesto: [...selected.keys()],
              carrier: carrier,
              user: user,
            },
          });

          //setData()
          setIsvisibleLoading(false);
          setRefreshing(false);
        })
        .catch((error) => {
          console.log(error);
        });
      //await RemenberOrders();
      setSelected(new Map());
      setIsvisibleLoading(false);
    }
  }

  //const rememberOrders = async (bd) => {
  async function RemenberOrders(bd) {
    //console.log(bd);
    try {
      await AsyncStorage.setItem("@localStorage:dataOrder", bd);
    } catch (error) {
      console.log(error);
    }
  }

  function ManifestButton() {
    return (
      <FAB
        style={styles.fab}
        icon="check"
        onPress={() => ValidateManifests()}
      />
    );
  }

  function SeparatorManifest() {
    return (
      <View
        style={{
          height: 1,
          backgroundColor: "#CED0CE",
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleScreen: {
    marginTop: 5,
    marginLeft: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  item: {
    backgroundColor: "#D41616",
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    margin: 36,
    right: 0,
    bottom: 0,
  },
  toast: {
    marginTop: 100,
  },
});
