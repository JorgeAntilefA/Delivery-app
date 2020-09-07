import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  AsyncStorage,
  SafeAreaView,
} from "react-native";
import Constants from "./../../utils/Constants";
import Icon from "react-native-vector-icons/FontAwesome";
import { Input } from "react-native-elements";
import { useIsFocused } from "@react-navigation/native";
import { FAB } from "react-native-paper";
import Loading from "../Loading";

export default function IncidentsListForm(props) {
  const isFocused = useIsFocused();
  const [userTitle, setUserTitle] = useState();
  const [carrierTitle, setCarrierTitle] = useState();
  const { url } = Constants;
  const { navigation, route } = props;
  const [data, setData] = useState();
  const [arrayholder, setArrayholder] = useState([]);
  const [isVisibleLoading, setIsvisibleLoading] = useState(false);

  useEffect(() => {
    if (isFocused) {
      const getRememberedOrders = async () => {
        setIsvisibleLoading(true);
        try {
          const credentialsUser = await AsyncStorage.getItem(
            "@localStorage:dataOrder"
          );

          if (credentialsUser !== null) {
            const listData = JSON.parse(credentialsUser).filter(
              (pedido) =>
                pedido.solicitud != "1" && pedido.gestion_usuario != "1"
            );

            setData(listData);
            setArrayholder(listData);
            setIsvisibleLoading(false);
          }
        } catch (error) {
          console.log(error);
        }
      };

      const getRememberedTitle = async () => {
        try {
          const carrierTitle = await AsyncStorage.getItem(
            "@localStorage:title"
          );
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
    }
  }, [isFocused]);

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

  function searchData(text) {
    const newData = arrayholder.filter((item) => {
      return item.pedido.indexOf(text) > -1;
    });

    setData(newData);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: "row" }}>
          <View
            style={{ width: "100%", height: 50, backgroundColor: "#272626" }}
          >
            <Input
              inputContainerStyle={styles.SectionStyle}
              placeholder="Busqueda"
              onChangeText={(text) => searchData(text)}
              keyboardType="numeric"
              //inputContainerStyle={{ width: "40%", backgroundColor: "red" }}
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
        </View>
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
          data={data}
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
        {<Loading isVisible={isVisibleLoading} text="Cargando" />}
      </View>
    </SafeAreaView>
  );

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
      visto_proveedor,
    } = props.item;
    const { navigation, user, carrierUser } = props;

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("responseIncidents", {
            pedido: pedido,
            manifiesto: manifiesto,
            direccion: direccion,
            comuna: comuna,
            nombre_cliente: nombre_cliente,
            carrier: carrier,
            fecha: fecha,
            user: user,
            carrierUser: carrierUser,
            tipo_solicitud: tipo_solicitud,
            observacion_sac: observacion_sac,
            visto_proveedor: visto_proveedor,
            id_solicitudes_carrier_sac_estado: id_solicitudes_carrier_sac_estado,
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
            {id_solicitudes_carrier_sac_estado == 3 ? (
              <Icon
                name="check-circle"
                // type="material-community"
                color="#377C1E"
                size={60}
              />
            ) : (
              <Icon
                name="history"
                // type="material-community"
                color="#BF1313"
                size={60}
              />
            )}
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
  containerInput: {
    //backgroundColor: "#272626",
    flexDirection: "row",
    backgroundColor: "red",
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    // width: "90%",
  },
  inputForm: {
    height: 30,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  SectionStyle: {
    backgroundColor: "#fff",
    borderWidth: 0.5,
    borderColor: "#000",
    marginTop: 5,
    height: 35,
    width: "90%",
    borderRadius: 5,
  },
  IconRefresh: {
    backgroundColor: "green",
    //  width: "30%",
  },
  buttonContainer: {
    backgroundColor: "#f7c744",
    marginTop: 5,
    borderRadius: 15,
  },
  buttonText: {
    textAlign: "center",
    color: "rgb(32,53,70)",
    fontWeight: "bold",
    fontSize: 18,
  },
});
