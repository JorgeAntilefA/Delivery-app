import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Picker,
  Image,
  TouchableOpacity,
} from "react-native";
import { Icon, ListItem } from "react-native-elements";
import axios from "axios";
import Constants from "./../../utils/Constants";
import Loading from "../Loading";
import Toast from "react-native-easy-toast";
import { useIsFocused, StackActions } from "@react-navigation/native";

export default function ResponseIncidentsForm(props) {
  const { navigation, route } = props;
  const {
    direccion,
    pedido,
    nombre_cliente,
    manifiesto,
    user,
    carrierUser,
    tipo_solicitud,
    observacion_sac,
  } = route.params;

  const [isVisibleLoading, setIsvisibleLoading] = useState(false);
  const toastRef = useRef();
  //const isFocused = useIsFocused();
  useEffect(() => {}, []);

  const listInfo = [
    {
      text: tipo_solicitud,
      iconName: "alert-octagon-outline",
      iconType: "material-community",
      action: null,
    },
    {
      text: manifiesto,
      iconName: "file-document-outline",
      iconType: "material-community",
      action: null,
    },
    {
      text: pedido,
      iconName: "gift",
      iconType: "material-community",
      action: null,
    },
    {
      text: direccion,
      iconName: "map-marker",
      iconType: "material-community",
      action: null,
    },
    {
      text: nombre_cliente,
      iconName: "account-circle",
      iconType: "material-community",
      action: null,
    },
    {
      text: observacion_sac,
      iconName: "message-text-outline",
      iconType: "material-community",
      action: null,
    },
  ];
  return (
    <View>
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
          {carrierUser}
        </Text>
      </View>
      {listInfo.map((item, index) => (
        <ListItem
          key={index}
          title={item.text}
          leftIcon={{
            name: item.iconName,
            type: item.iconType,
            color: "#00a680",
            size: 20,
          }}
          containerStyle={styles.containerListItem}
        />
      ))}
      <View style={styles.imageContainer}></View>
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={() => Llamar()}
        activeOpacity={0.5}
      >
        <Text style={styles.buttonText}>Gestionar</Text>
      </TouchableOpacity>
      <Toast
        style={styles.toast}
        ref={toastRef}
        position="center"
        opacity={0.5}
      />
      {<Loading isVisible={isVisibleLoading} text="Guardando.." />}
    </View>
  );

  function Llamar() {
    navigation.dispatch(StackActions.popToTop());
    navigation.navigate("pendings", {
      screen: "manageOrder",
      params: {
        pedido: pedido,
        manifiesto: manifiesto,
        direccion: direccion,
        nombre_cliente: nombre_cliente,
        user: user,
        carrierUser: carrierUser,
      },
    });
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pedido: {
    //fontWeight: "bold",
    fontSize: 15,
    textAlign: "center",
    backgroundColor: "#000000",
    color: "#d8d8d8",
    // borderRadius: 10,
    borderWidth: 1,
  },
  containerListItem: {
    borderBottomColor: "#d8d8d8",
    borderBottomWidth: 1,
    height: 50,
  },
  imageContainer: {
    flex: 1,
    flexDirection: "row",
    margin: 5,
    justifyContent: "center",
  },
  image: {
    margin: 15,
    width: 60,
    height: 60,
  },
  Container: {
    flex: 1,
    flexDirection: "row",
    margin: 5,
    justifyContent: "center",
  },
  image: {
    margin: 5,
    width: 60,
    height: 60,
  },
  viewImages: {
    flexDirection: "row",
    marginLeft: 20,
    marginRight: 20,
  },
  containerIcon: {
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    height: 70,
    width: 90,
    backgroundColor: "#e3e3e3",
  },
  picker: {
    // backgroundColor: "#68a0cf",
    height: 45,
    justifyContent: "center",
    textAlign: "center",
    //width: 200,
    borderWidth: 1,
    borderColor: "#e3e3e3",
  },
  buttonContainer: {
    backgroundColor: "#f7c744",

    paddingVertical: 15,
    marginTop: 70,
    borderRadius: 15,
    marginLeft: 40,
    width: "80%",
  },
  buttonText: {
    textAlign: "center",
    color: "rgb(32,53,70)",
    fontWeight: "bold",
    fontSize: 18,
  },
  customer: {
    alignItems: "center",
  },
  toast: {
    marginTop: 100,
  },
});
