import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  Picker,
  Image,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Icon, ListItem } from "react-native-elements";
import axios from "axios";
import Constants from "./../../utils/Constants";
import * as Location from "expo-location";
import Loading from "../Loading";
import { Input } from "@ui-kitten/components";
import * as ImagePicker from "expo-image-picker";
import * as Permissions from "expo-permissions";
import { useIsFocused } from "@react-navigation/native";

export default function ModifyManagedOrder(props) {
  const { navigation, route } = props;

  const {
    direccion,
    pedido,
    nombre_cliente,
    carrier,
    manifiesto,
    user,
    carrierUser,
    fecha,
    estado_entrega,
    recibe_nombre,
    recibe_rut,
  } = route.params;

  const [selectedValueState, setSelectedState] = useState(estado_entrega);
  const [selectedValueStateFinal, setSelectedStateFinal] = useState();
  const [selectedValueS, setSelectedValueS] = useState([]);
  const [imageUrlBol, setImageUrlBol] = useState(false);
  const [imageUrl, setImageUrl] = useState();

  const { url } = Constants;
  const [isVisibleLoading, setIsvisibleLoading] = useState(false);
  const [isVisibleLoadingCamera, setIsvisibleLoadingCamera] = useState(false);

  const [errorMsg, setErrorMsg] = useState(null);

  const [nameCli, setNameCli] = useState();
  const [rutCli, setRutCli] = useState();

  const { signature } = route.params;
  const { name } = route.params;
  const { rut } = route.params;
  const isFocused = useIsFocused();

  function getListState() {
    const params = new URLSearchParams();
    params.append("opcion", "getActivaEstados");
    params.append("carrier", carrier);

    return axios.post(url, params);
  }

  // if (!isFocused) {
  //   navigation.goBack();
  //   console.log("out");

  //   // signature = null;
  //   // name = null;
  // }

  useEffect(() => {
    const getManifests = async () => {
      await axios
        .all([getListState()])
        .then(
          axios.spread((...responses) => {
            //console.log(responses[0]);
            const responseListState = responses[0];
            setSelectedValueS(JSON.parse(responseListState.data.trim()));
          })
        )
        .catch((errors) => {
          console.log(errors);
        });
    };
    getManifests();
  }, []);

  const getImageFromCamera = async () => {
    setIsvisibleLoadingCamera(true);
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
        setIsvisibleLoadingCamera(false);
      } else {
        setIsvisibleLoadingCamera(false);
      }
    }
  };

  function Signature() {
    if (!signature) {
      return (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("digitalSignatureM", {
              direccion: direccion,
              pedido: pedido,
              nombre_cliente: nombre_cliente,
              carrier: carrier,
              manifiesto: manifiesto,
              user: user,
              carrierUser: carrierUser,
              fecha: fecha,
              estado_entrega: estado_entrega,
              recibe_nombre: recibe_nombre,
              recibe_rut: recibe_rut,
            })
          }
        >
          <View>
            <Icon
              type="material-community"
              name="fountain-pen"
              color="#7a7a7a"
              containerStyle={styles.containerIcon}
              onPress={() =>
                navigation.navigate("digitalSignatureM", {
                  direccion: direccion,
                  pedido: pedido,
                  nombre_cliente: nombre_cliente,
                  carrier: carrier,
                  manifiesto: manifiesto,
                  user: user,
                  carrierUser: carrierUser,
                  fecha: fecha,
                  estado_entrega: selectedValueStateFinal,
                  recibe_nombre: recibe_nombre,
                  recibe_rut: recibe_rut,
                })
              }
            />
          </View>
        </TouchableOpacity>
      );
    } else {
      return (
        <View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("digitalSignatureM", {
                direccion: direccion,
                pedido: pedido,
                nombre_cliente: nombre_cliente,
                carrier: carrier,
                manifiesto: manifiesto,
                user: user,
                carrierUser: carrierUser,
                fecha: fecha,
                estado_entrega: estado_entrega,
                recibe_nombre: recibe_nombre,
                recibe_rut: recibe_rut,
              })
            }
          >
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

  function EditOrder() {
    if (selectedValueState == "Entregado") {
      return (
        <View>
          <Input
            style={styles.inputForm}
            placeholder={!rutCli ? "11111111-1" : rutCli}
            placeholderColor="#c4c3cb"
            value={rutCli}
            onChange={(e) => setRutCli(e.nativeEvent.text)}
          />
          <Input
            style={styles.inputForm}
            placeholder={!nameCli ? "Cliente" : nameCli}
            placeholderColor="#c4c3cb"
            value={nameCli}
            onChange={(e) => setName(e.nativeEvent.text)}
          />
        </View>
      );
    } else {
      return (
        <View>
          <Customer />
          <View style={styles.imageContainer}>
            <Camera />
            <Signature />
          </View>
        </View>
      );
    }
  }

  const listInfo = [
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
  ];

  return (
    <ScrollView>
      <View style={styles.container}>
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
            }}
            containerStyle={styles.containerListItem}
          />
        ))}
        <Text style={styles.pedido}>Modificar Estado del Pedido</Text>
        <PickerState />
        <EditOrder />
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => SaveOrder()}
        >
          <Text style={styles.buttonText}>Guardar</Text>
        </TouchableOpacity>
        {<Loading isVisible={isVisibleLoading} text="Guardando.." />}
      </View>
    </ScrollView>
  );

  function Camera() {
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
                isVisible={isVisibleLoadingCamera}
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
          {<Loading isVisible={isVisibleLoadingCamera} text="Cargando Foto" />}
        </View>
      );
    }
  }

  function PickerState() {
    return (
      <View style={styles.picker}>
        <Picker
          selectedValue={
            selectedValueStateFinal
              ? selectedValueStateFinal
              : selectedValueState
          }
          onValueChange={(itemValue, itemIndex) =>
            setSelectedStateFinal(itemValue)
          }
        >
          <Picker.Item label="Seleccione Estado..." value="cero" />
          {selectedValueS.map((item, key) => (
            <Picker.Item label={item.estado} value={item.estado} key={key} />
          ))}
        </Picker>
      </View>
    );
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

  async function SaveOrder() {
    if (selectedValueState == "cero") {
      toastRef.current.show("Debes selecciona estado");
    } else {
      setIsvisibleLoading(true);
      const resultGeo = await getLocation();
      let fecha_gestion = getDatetime();

      let date = new Date();
      let hour = date.getHours() + ":00";

      let localUri;
      let filename;
      let match;
      let type;
      console.log(selectedValueStateFinal);
      const params = new FormData();
      params.append("opcion", "guardaPedido");
      params.append("pedido", pedido);
      params.append("manifiesto", manifiesto);
      params.append("fecha_manifiesto", fecha);
      params.append("hora_gestion", hour);
      params.append("fecha_gestion", fecha_gestion);
      params.append(
        "estado_entrega",
        selectedValueStateFinal ? selectedValueStateFinal : selectedValueState
      );
      params.append("encargado", user);
      params.append("carrier", carrierUser);
      params.append("latitud", resultGeo.coords.latitude);
      params.append("longitud", resultGeo.coords.longitude);
      params.append("recibe_nombre", name);
      params.append("recibe_rut", rut);
      params.append("imgFirma", signature);

      if (!imageUrlBol) {
        localUri = "";
        filename = "";
        match = "";
        type = "";
      } else {
        localUri = imageUrl;
        filename = localUri.split("/").pop();
        match = /\.(\w+)$/.exec(filename);
        type = match ? `image/${match[1]}` : `image`;

        params.append("imgPedido", { uri: localUri, name: filename, type });
      }

      axios
        .post(url, params, {
          headers: {
            "content-type": "multipart/form-data",
          },
        })
        .then((response) => {
          //navigation.goBack();
          navigation.navigate("managedOrders");
          setIsvisibleLoading(false);
        })
        .catch((error) => {
          //console.log();
          if (isNetworkError(error)) {
            console.log("Error Conexión: " + error);
          }
        });
    }
  }

  function isNetworkError(err) {
    return !!err.isAxiosError && !err.response;
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
    marginTop: 90,
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
  inputForm: {
    height: 35,
    marginBottom: 10,
    color: "rgb(32,53,70)",
    paddingHorizontal: 10,
    // backgroundColor: "rgba(255,255,255,0.2)",
  },
  imageContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
  },
});
