import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  AsyncStorage,
  TouchableWithoutFeedback,
  RefreshControl,
  StatusBar,
  SafeAreaView,
  Platform,
} from "react-native";
import Constants from "./../../utils/Constants";
import Icon from "react-native-vector-icons/FontAwesome";
import { Input } from "react-native-elements";
import axios from "axios";
import Loading from "../Loading";
import { useIsFocused } from "@react-navigation/native";
import { ActivityIndicator, FAB } from "react-native-paper";
import * as SQLite from "expo-sqlite";

export default function PendingOrdersForm(props) {
  const { navigation, route } = props;

  const [data, setData] = useState();
  const [dataTotal, setDataTotal] = useState(0);
  const [reached, setReached] = useState(0);
  const [isVisibleLoading, setIsvisibleLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const isFocused = useIsFocused();
  const { url } = Constants;
  const { manifiesto, carrier, user } = route.params;

  const userP = user;
  const carrierUser = carrier;
  const [refresh, setRefresh] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [text, setText] = useState();
  const [arrayholder, setArrayholder] = useState([]);
  const [dataOffline, setDataOffline] = useState(0);
  const db = SQLite.openDatabase("db.offlineData");
  const maxFila = 40;
  // let manifiestoRefresh = manifiesto;

  useEffect(() => {
    if (isFocused) {
      setIsvisibleLoading(true);

      const getPendingOrders = async () => {
        setText("");
        const credentialsUser = await AsyncStorage.getItem(
          "@localStorage:dataOrder"
        );
        //await countDataOffline(manifiesto.toString());
        //console.log("dataoffline:" + dataOffline);
        //console.log("offline:" + offline);
        const manifiestoRefresh = await AsyncStorage.getItem(
          "@localStorage:manifest"
        );
        db.transaction((tx) => {
          // sending 4 arguments in executeSql
          tx.executeSql(
            "SELECT * FROM offline where manifiesto in ('" +
              manifiestoRefresh +
              "')",
            null, // passing sql query and parameters:null
            // success callback which sends two things Transaction object and ResultSet Object
            (txObj, { rows: { _array } }) => {
              console.log(_array.length);
              setDataOffline(_array.length);
            }
            // failure callback which sends two things Transaction object and Error
            //(txObj, error) => console.log('Error ', error)
          ); // end executeSQL
        }); // end transaction

        if (credentialsUser !== null) {
          const listData = JSON.parse(credentialsUser).filter(
            (pedido) =>
              pedido.estado_entrega === "Sin Estado" && pedido.solicitud == "1"
          );
          setData(listData.slice(0, maxFila));

          setDataTotal(listData.length);
          setArrayholder(listData);
          setIsvisibleLoading(false);
        }
      };

      getPendingOrders();
    } else {
      setData([]);
    }
  }, [isFocused]);

  function handleLoadMore() {
    let start = data.length;
    if (data.length < dataTotal) {
      setIsLoading(true);
      setData([...data, ...arrayholder.slice(start, start + maxFila)]);
    } else {
      setIsLoading(false);
    }
  }

  function searchData(text) {
    if (text.length > 0) {
      setReached(1);
      const newData = arrayholder.filter((item) => {
        return item.pedido.indexOf(text) > -1;
      });
      setData(newData);
    } else {
      setReached(0);
    }
  }
  const rememberOrders = async (bd) => {
    try {
      await AsyncStorage.removeItem("@localStorage:dataOrder");
      await AsyncStorage.setItem("@localStorage:dataOrder", bd);
    } catch (error) {
      console.log(error);
    }
  };

  async function countDataOffline(manifiestos) {
    db.transaction((tx) => {
      // sending 4 arguments in executeSql
      tx.executeSql(
        "SELECT * FROM offline where manifiesto in ('" + manifiestos + "')",
        null, // passing sql query and parameters:null
        // success callback which sends two things Transaction object and ResultSet Object
        (txObj, { rows: { _array } }) => {
          console.log(_array.length);
          setDataOffline(_array.length);
        }
        // failure callback which sends two things Transaction object and Error
        //(txObj, error) => console.log('Error ', error)
      ); // end executeSQL
    }); // end transaction
  }

  async function fetchData() {
    setRefreshing(true);
    const manifiestoRefresh = await AsyncStorage.getItem(
      "@localStorage:manifest"
    );

    db.transaction((tx) => {
      // sending 4 arguments in executeSql
      tx.executeSql(
        "SELECT * FROM offline where manifiesto in (" + manifiestoRefresh + ")",
        null, // passing sql query and parameters:null
        // success callback which sends two things Transaction object and ResultSet Object
        (txObj, { rows: { _array, length } }) => {
          console.log(length);
          //console.log(_array);
          if (length > 0) {
            for (let x = 0; x < _array.length; x++) {
              //let x = 0;
              insert = insert + 1;
              const params = new FormData();
              //let firma;
              params.append("opcion", "guardaPedido");
              params.append("pedido", _array[x].pedido);
              params.append("manifiesto", _array[x].manifiesto);
              params.append("fecha_manifiesto", _array[x].fecha);
              params.append("hora_gestion", _array[x].hora_gestion);
              params.append("fecha_gestion", _array[x].fecha_gestion);
              params.append("estado_entrega", _array[x].estado_entrega);
              params.append("encargado", _array[x].gestion_usuario);
              params.append("carrier", _array[x].carrier);
              params.append("latitud", _array[x].latitud);
              params.append("longitud", _array[x].longitud);
              params.append("recibe_nombre", _array[x].recibe_nombre);
              params.append("recibe_rut", _array[x].recibe_rut);
              params.append("observacion", _array[x].observacion);
              params.append("tipo_despacho", _array[x].tipo_despacho);
              if (_array[x].ruta_firma !== null) {
                params.append("imgFirma", _array[x].ruta_firma);
              }
              if (_array[x].ruta_foto !== "") {
                let type = _array[x].type_foto;
                params.append("imgPedido", {
                  uri: _array[x].ruta_foto,
                  name: _array[x].nombre_foto,
                  type,
                });
              }
              axios
                .post(url, params, {
                  headers: {
                    "content-type": "multipart/form-data",
                  },
                  timeout: 10000,
                })
                .then((response) => {
                  if (response.data[0].guardado === "true") {
                    console.log("guardado offline");
                    deleteOffline(_array[x].id);
                    setDataOffline(0);
                  }

                  setIsvisibleLoading(false);
                })
                .catch((error) => {
                  console.log("Error timeout");
                  setIsvisibleLoading(false);
                  // if (isNetworkError(error)) {
                  console.log("Error Conexión: " + error);
                  setIsvisibleLoading(false);
                  //  }
                });
            }
            setRefreshing(false);
          } else {
            console.log("No hay datos offlines ");
            setRefreshing(false);
          }
          //    }
        }
      ); // end executeSQL
    }); // end transaction

    // db.transaction((tx) => {
    //   // sending 4 arguments in executeSql
    //   tx.executeSql(
    //     "SELECT * FROM offline where manifiesto in ('" +
    //       manifiestoRefresh +
    //       "')",
    //     null, // passing sql query and parameters:null
    //     // success callback which sends two things Transaction object and ResultSet Object
    //     (txObj, { rows: { _array } }) => {
    //       console.log(_array.length);
    //       setDataOffline(_array.length);
    //     }
    //     // failure callback which sends two things Transaction object and Error
    //     //(txObj, error) => console.log('Error ', error)
    //   ); // end executeSQL
    // }); // end transaction
  }

  function deleteOffline(id) {
    db.transaction((tx) => {
      tx.executeSql(
        "DELETE FROM offline WHERE id = ? ",
        [id],
        (txObj, resultSet) => {
          if (resultSet.rowsAffected > 0) {
            console.log("borrado:" + id);
          }
        }
      );
    });
  }

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    //setIsvisibleLoading(true);
    // let offline = await fetchData();
    // console.log("actualizando..");
    const manifiestoRefresh = await AsyncStorage.getItem(
      "@localStorage:manifest"
    );

    const params = new URLSearchParams();
    params.append("opcion", "getPedidosV3");
    params.append("manifiestos", manifiestoRefresh);

    await axios
      .post(url, params)
      .then((response) => {
        if (Platform.OS === "ios") {
          console.log(response.data);
          try {
            AsyncStorage.removeItem("@localStorage:dataOrder");
            AsyncStorage.setItem(
              "@localStorage:dataOrder",
              JSON.stringify(response.data)
            );
          } catch (error) {
            console.log(error);
          }
          const listData = response.data.filter(
            (pedido) =>
              pedido.estado_entrega === "Sin Estado" && pedido.solicitud == "1"
          );
          setData(JSON.parse(listData));
          setArrayholder(listData);
        } else {
          rememberOrders(JSON.stringify(response.data));
          const listData = response.data.filter(
            (pedido) =>
              pedido.estado_entrega === "Sin Estado" && pedido.solicitud == "1"
          );
          console.log(listData.length);
          setData(listData.slice(0, maxFila));
          setDataTotal(listData.length);
          setArrayholder(listData);
        }

        setRefreshing(false);
      })
      .catch((error) => {
        console.log(error);
        setRefreshing(false);
      });
  }, [refreshing]);

  const renderIcon = (props) => (
    <TouchableWithoutFeedback>
      <Icon {...props} name="search" />
    </TouchableWithoutFeedback>
  );

  return (
    <SafeAreaView style={styles.container}>
      {<Loading isVisible={isVisibleLoading} text="Cargando" />}
      {Platform.OS === "ios" ? (
        <StatusBar barStyle="dark-content" />
      ) : (
        <StatusBar barStyle="light-content" />
      )}
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row" }}>
          <View
            style={{ width: "80%", height: 50, backgroundColor: "#272626" }}
          >
            <Input
              inputContainerStyle={styles.SectionStyle}
              placeholder="Busqueda"
              onChangeText={(text) => searchData(text)}
              keyboardType="numeric"
              leftIcon={
                <Icon
                  name="search"
                  size={24}
                  color="black"
                  style={{ marginLeft: 5 }}
                />
              }
            />
          </View>
          <View
            style={{
              width: "20%",
              height: 50,
              backgroundColor: "#272626",
            }}
          >
            <TouchableOpacity onPress={() => onRefresh()} activeOpacity={0.5}>
              <Icon
                name="refresh"
                size={30}
                color="white"
                style={{ marginLeft: 5, marginTop: 5 }}
              />
            </TouchableOpacity>
          </View>
        </View>
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
            {" - "}
            {dataTotal}
          </Text>
        </View>

        {reached === 0 ? (
          <FlatList
            keyExtractor={(item, index) => `${index}`}
            data={data}
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
            onEndReachedThreshold={5}
            onEndReached={() => handleLoadMore()}
            ListFooterComponent={<FooterList />}
          />
        ) : (
          <FlatList
            keyExtractor={(item, index) => `${index}`}
            data={data}
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
        )}
      </View>
      <ManifestButton />
    </SafeAreaView>
  );

  function ManifestButton() {
    return (
      <FAB
        style={styles.fab}
        label={dataOffline.toString()}
        onPress={() => fetchData()}
      />
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

  function FooterList(props) {
    if (isLoading) {
      return (
        <View style={styles.loaderOrders}>
          <ActivityIndicator size="large" />
        </View>
      );
    } else {
      return (
        <View style={styles.notFoundOrders}>
          <Text> Lista completa </Text>
        </View>
      );
    }
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
      latitud,
      longitud,
      tipo_despacho,
      telefono,
    } = props.item;
    const { navigation, user, carrierUser } = props;

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("manageOrder", {
            pedido: pedido,
            manifiesto: manifiesto,
            direccion: direccion,
            comuna: comuna,
            nombre_cliente: nombre_cliente,
            carrier: carrier,
            fecha: fecha,
            user: user,
            carrierUser: carrierUser,
            latitud: latitud,
            longitud: longitud,
            tipo_despacho: tipo_despacho,
            telefono: telefono,
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
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loaderOrders: {
    marginTop: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  notFoundOrders: {
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
  },
  SectionStyle: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#000",
    height: 40,
    borderRadius: 5,
    margin: 5,
  },
  ImageStyle: {
    padding: 10,
    margin: 5,
    height: 25,
    width: 25,
    resizeMode: "stretch",
    alignItems: "center",
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
  fab: {
    position: "absolute",
    margin: 36,
    right: 0,
    bottom: 0,
    backgroundColor: "red",
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
  containerInput: {
    backgroundColor: "#272626",
  },
  inputForm: {
    height: 30,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
