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

export default function PendingOrdersForm(props) {
  const { navigation, route } = props;

  const [data, setData] = useState();
  const [isVisibleLoading, setIsvisibleLoading] = useState(false);
  const isFocused = useIsFocused();
  const { url } = Constants;
  const { manifiesto, carrier, user } = route.params;
  //  const { carrier, user } = route.params;

  // let manifiestos = manifesto;
  const userP = user;
  const carrierUser = carrier;
  const [refresh, setRefresh] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [text, setText] = useState();
  const [arrayholder, setArrayholder] = useState([]);

  useEffect(() => {
    if (isFocused) {
      const getPendingOrders = async () => {
        setIsvisibleLoading(true);
        setText("");
        const credentialsUser = await AsyncStorage.getItem(
          "@localStorage:dataOrder"
        );
        console.log(credentialsUser);
        if (credentialsUser !== null) {
          const listData = JSON.parse(credentialsUser).filter(
            (pedido) =>
              //country.pedido.includes(lowerCaseQuery) &&
              pedido.estado_entrega === "Sin Estado" && pedido.solicitud == "1"
          );

          setData(listData);
          setArrayholder(listData);
        }
        setIsvisibleLoading(false);
      };

      getPendingOrders();
    }
  }, [isFocused]);

  async function cargaData() {
    const credentialsUser = await AsyncStorage.getItem(
      "@localStorage:dataOrder"
    );

    if (credentialsUser !== null) {
      const listData = JSON.parse(credentialsUser).filter(
        (pedido) =>
          //country.pedido.includes(lowerCaseQuery) &&
          pedido.estado_entrega === "Sin Estado" && pedido.solicitud == "1"
      );
      console.log(listData);
      setData(listData);
      setArrayholder(listData);
    }
  }

  function searchData(text) {
    const newData = arrayholder.filter((item) => {
      return item.pedido.indexOf(text) > -1;
    });

    setData(newData);
  }
  const rememberOrders = async (bd) => {
    try {
      await AsyncStorage.removeItem("@localStorage:dataOrder");
      await AsyncStorage.setItem("@localStorage:dataOrder", bd);
    } catch (error) {
      console.log(error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    //console.log("actualizado");
    const params = new URLSearchParams();
    params.append("opcion", "getPedidosV3");
    params.append("manifiestos", manifiesto.toString());

    await axios
      .post(url, params)
      .then((response) => {
        //rememberOrders(response.data.trim());

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
          setData(listData);
          setArrayholder(listData);
        } else {
          rememberOrders(response.data.trim());
          const listData = JSON.parse(response.data.trim()).filter(
            (pedido) =>
              pedido.estado_entrega === "Sin Estado" && pedido.solicitud == "1"
          );
          setData(listData);
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
                size={34}
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
          </Text>
        </View>
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
        {<Loading isVisible={isVisibleLoading} text="Cargando" />}
      </View>
    </SafeAreaView>
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
    latitud,
    longitud,
    tipo_despacho,
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
