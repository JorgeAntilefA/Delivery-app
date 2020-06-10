import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Picker,
  TouchableOpacity,
  Image,
} from "react-native";
import { ListItem, Button, Icon } from "react-native-elements";
import axios from "axios";
import Constants from "./../../utils/Constants";
import Loading from "../Loading";
import Toast from "react-native-easy-toast";
import {
  useIsFocused,
  CommonActions,
  NavigationActions,
  StackActions,
} from "@react-navigation/native";
import { Input } from "@ui-kitten/components";
import { ScrollView } from "react-native-gesture-handler";
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

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
    fecha,
    visto_proveedor,
  } = route.params;
  console.log(visto_proveedor);
  const [isVisibleLoading, setIsvisibleLoading] = useState(false);
  const [isVisibleLoadingCamara, setIsvisibleLoadingCamara] = useState(false);

  const [selectedValueState, setSelectedState] = useState("cero");
  const [selectedValueS, setSelectedValueS] = useState([]);
  const [man, setMan] = useState();
  const { url } = Constants;

  const [visto, setVisto] = useState(visto_proveedor);
  const toastRef = useRef();

  const { signature } = route.params;
  const { name } = route.params;
  const { rut } = route.params;
  const [imageUrlBol, setImageUrlBol] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [errorMsg, setErrorMsg] = useState(null);
  //const isFocused = useIsFocused();
  useEffect(() => {
    const getPendingOrders = async () => {
      setIsvisibleLoading(true);
      const params = new URLSearchParams();
      params.append("opcion", "getActivaEstados");
      params.append("carrier", carrierUser);

      await axios
        .post(url, params)
        .then((response) => {
          setSelectedValueS(JSON.parse(response.data.trim()));

          setIsvisibleLoading(false);
        })
        .catch((error) => {
          console.log(error);
        });
    };
    getPendingOrders();
  }, []);

  const listInfo = [
    {
      text: tipo_solicitud,
      iconName: "alert-octagon-outline",
      iconType: "material-community",
      action: null,
    },
    {
      text: manifiesto + " - " + fecha,
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

  const getImageFromCamera = async () => {
    setIsvisibleLoadingCamara(true);
    const cameraPermission = await Permissions.askAsync(Permissions.CAMERA);
    const cameraRollPermission = await Permissions.askAsync(
      Permissions.CAMERA_ROLL
    );
    // console.log(cameraPermission);
    if (
      cameraPermission.status === "granted" &&
      cameraRollPermission.status === "granted"
    ) {
      let captureImage = await ImagePicker.launchCameraAsync({
        allowEditing: true,
        aspect: [4, 3],
        quality: 0.1,
      });
      if (!captureImage.cancelled) {
        //let x = "require(" + captureImage.url + ")";
        setImageUrlBol(true);
        setImageUrl(captureImage.uri);
        setIsvisibleLoadingCamara(false);
      } else {
        setIsvisibleLoadingCamara(false);
      }
    }
  };

  return (
    <ScrollView>
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
        <OptionsIncidents />
        <Customer />
        <View style={styles.imageContainer}>
          <Camera />
          <Signature />
        </View>
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => SaveOrder()}
          activeOpacity={0.5}
        >
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
        <Toast
          style={styles.toast}
          ref={toastRef}
          position="center"
          opacity={0.5}
        />
        {<Loading isVisible={isVisibleLoading} text="Guardando.." />}
      </View>
    </ScrollView>
  );

  function OptionsIncidents() {
    // if (tipo_solicitud == "FALTANTE MANIFIESTO") {
    return (
      <View>
        <PickerState />
        <Text style={styles.text}>Manifiesto</Text>
        <View style={styles.containerFaltantes}>
          <Input
            style={styles.inputFormMan}
            keyboardType="numeric"
            placeholderColor="#c4c3cb"
            onChange={(e) => setMan(e.nativeEvent.text)}
          />
          {visto == "1" ? (
            <Button
              containerStyle={styles.buttonContainerView}
              icon={<Icon name="check-circle" size={25} color="white" />}
            />
          ) : (
            <Button
              containerStyle={styles.buttonContainerView}
              title=" Visto"
              icon={<Icon name="help" size={25} color="white" />}
              onPress={() => SaveCheck()}
              buttonStyle={{ backgroundColor: "#B40404" }}
            />
          )}
        </View>
      </View>
    );
    //}
  }

  function PickerState() {
    return (
      <View style={styles.picker}>
        <Picker
          selectedValue={selectedValueState}
          onValueChange={(itemValue, itemIndex) => setSelectedState(itemValue)}
        >
          <Picker.Item label="Seleccione Estado..." value="cero" />
          {selectedValueS.map((item, key) => (
            <Picker.Item label={item.estado} value={item.estado} key={key} />
          ))}
        </Picker>
      </View>
    );
  }

  async function SaveCheck() {
    setIsvisibleLoading(true);

    const params = new FormData();
    params.append("opcion", "checkProveedor");
    params.append("visto_proveedor", true);
    params.append("visto_usuario", user);
    params.append("manifiesto", manifiesto);
    params.append("pedido", pedido);

    await axios
      .post(url, params)
      .then((response) => {
        // console.log(JSON.parse(response).guardado);

        setVisto(true);
        setIsvisibleLoading(false);
      })
      .catch((error) => {
        //console.log();
        if (isNetworkError(error)) {
          console.log("Error Conexión: " + error);
        }
      });
  }
  function isNetworkError(err) {
    return !!err.isAxiosError && !err.response;
  }

  function getLocation() {
    return new Promise((resolve) => {
      let { status } = Location.requestPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
      }
      let location = Location.getCurrentPositionAsync({});
      resolve(location);
    });
  }

  function getDatetime() {
    let date = new Date().getDate(); //Current Date
    if (date < 10) {
      date = "0" + date;
    }
    let month = new Date().getMonth() + 1; //Current Month
    if (month < 10) {
      month = "0" + month;
    }
    let year = new Date().getFullYear(); //Current Year
    let hours = new Date().getHours(); //Current Hours
    let min = new Date().getMinutes(); //Current Minutes
    let sec = new Date().getSeconds(); //Current Seconds
    if (sec < 10) {
      sec = "0" + sec;
    }

    let datetime =
      year + "-" + month + "-" + date + " " + hours + ":" + min + ":" + sec;

    return datetime;
  }

  function Camera() {
    // setIsvisibleLoading(false);
    if (!imageUrlBol) {
      return (
        <View>
          <TouchableOpacity onPress={getImageFromCamera}>
            <Icon
              type="material-community"
              name="camera"
              color="#7a7a7a"
              containerStyle={styles.containerIcon}
              onPress={getImageFromCamera}
            />
            {
              <Loading
                isVisible={isVisibleLoadingCamara}
                text="Cargando Foto"
              />
            }
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <View>
          <TouchableOpacity onPress={getImageFromCamera}>
            <Image
              source={{
                uri: imageUrl,
              }}
              style={styles.image}
            />
          </TouchableOpacity>
          {<Loading isVisible={isVisibleLoadingCamara} text="Cargando Foto" />}
        </View>
      );
    }
  }

  function Signature() {
    if (!signature) {
      return (
        <TouchableOpacity onPress={() => navigation.navigate("signatureI")}>
          <View>
            <Icon
              type="material-community"
              name="fountain-pen"
              color="#7a7a7a"
              containerStyle={styles.containerIcon}
              onPress={() => navigation.navigate("signatureI")}
            />
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <View>
          <TouchableOpacity onPress={() => navigation.navigate("signatureI")}>
            <Image
              source={{
                uri: signature,
              }}
              style={styles.image}
            />
          </TouchableOpacity>
        </View>
      );
    }
  }

  function Customer() {
    if (rut) {
      return (
        <View style={styles.customer}>
          <Text>
            {"Recibido: "}
            {name}
            {" - "}
            {rut}
          </Text>
        </View>
      );
    } else {
      return (
        <View>
          <Text></Text>
        </View>
      );
    }
  }

  async function SaveOrder() {
    // if (selectedValueState == "cero") {
    //   toastRef.current.show("Debes seleccionar estado");
    // } else {
    //   setIsvisibleLoading(true);
    //   const resultGeo = await getLocation();
    //   let fecha_gestion = getDatetime();
    //   let date = new Date();
    //   let hour = date.getHours() + ":00";

    //   let localUri;
    //   let filename;
    //   let match;
    //   let type;

    //   const params = new FormData();
    //   params.append("opcion", "guardaPedido");
    //   params.append("pedido", pedido);
    //   params.append("manifiesto", man == "" ? manifiesto : man);
    //   params.append("fecha_manifiesto", fecha);
    //   params.append("hora_gestion", hour);
    //   params.append("fecha_gestion", fecha_gestion);
    //   params.append("estado_entrega", selectedValueState);
    //   params.append("encargado", user);
    //   params.append("carrier", carrierUser);
    //   params.append("latitud", resultGeo.coords.latitude);
    //   params.append("longitud", resultGeo.coords.longitude);
    //   params.append("recibe_nombre", name ? name : "");
    //   params.append("recibe_rut", rut ? rut : "");
    //   if (signature) {
    //     params.append("imgFirma", signature);
    //   }

    //   if (!imageUrlBol) {
    //     localUri = "";
    //     filename = "";
    //     match = "";
    //     type = "";
    //   } else {
    //     localUri = imageUrl;
    //     filename = localUri.split("/").pop();
    //     match = /\.(\w+)$/.exec(filename);
    //     type = match ? `image/${match[1]}` : `image`;

    //     params.append("imgPedido", { uri: localUri, name: filename, type });
    //   }

    //   axios
    //     .post(url, params, {
    //       headers: {
    //         "content-type": "multipart/form-data",
    //       },
    //     })
    //     .then((response) => {
    // navigation.navigate("pendings", {
    //   screen: "pendientes",
    //   params: {
    //     manifests: manifiesto,
    //   },
    // });
    // setIsvisibleLoading(false);
    navigation.goBack();
    navigation.navigate("pendings");
    // const resetAction = StackActions.reset({
    //   index: 0,
    //   actions: [NavigationActions.navigate({ routeName: "pendings" })],
    // });
    // navigation.dispatch(resetAction);

    // navigation.dispatch(
    //   CommonActions.reset({
    //     index: 0,
    //     routes: [
    //       { name: "manifests", params: { carrier: "KWT" } },
    //       {
    //         name: "pendings",
    //         screen: "pendientes",
    //         params: {
    //           manifesto: "64076",
    //         },
    //       },
    //     ],
    //   })
    // );

    // })
    // .catch((error) => {
    //   console.log(error);
    //   if (isNetworkError(error)) {
    //     console.log("Error Conexión: " + error);
    //   }
    // });
    // }
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
    marginTop: 20,
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
  inputForm: {
    height: 35,
    marginBottom: 10,
    color: "rgb(32,53,70)",
    paddingHorizontal: 10,
    // backgroundColor: "rgba(255,255,255,0.2)",
  },
  inputFormMan: {
    // height: 25,
    width: "50%",
    color: "rgb(32,53,70)",
    paddingHorizontal: 10,
    // backgroundColor: "rgba(255,255,255,0.2)",
  },
  text: {
    marginLeft: 10,
  },
  buttonContainerView: {
    paddingVertical: 15,
    marginTop: -15,
    marginLeft: 20,
    borderRadius: 15,
    width: "40%",
  },
  containerFaltantes: {
    flex: 1,
    flexDirection: "row",
  },
  image: {
    margin: 15,
    width: 60,
    height: 60,
  },
});
