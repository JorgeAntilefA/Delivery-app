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
import * as Permissions from "expo-permissions";
import * as ImagePicker from "expo-image-picker";
import Map from "./Map";
import axios from "axios";
import Constants from "./../../utils/Constants";
import * as Location from "expo-location";
import Loading from "../Loading";
import Toast from "react-native-easy-toast";

export default function ManageOrder(props) {
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
    // refresh,
    // setRefresh,
  } = route.params;

  const [selectedValueState, setSelectedState] = useState("cero");
  const [selectedValueS, setSelectedValueS] = useState([]);

  const [selectedValueIncidence, setSelectedIncidence] = useState("cero");
  const [selectedValueI, setSelectedValueI] = useState([]);

  const [imageUrlBol, setImageUrlBol] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const { url } = Constants;
  const [isVisibleLoading, setIsvisibleLoading] = useState(false);
  const [disableButton, setDisableButton] = useState(false);

  const [errorMsg, setErrorMsg] = useState(null);

  const { signature } = route.params;
  const { name } = route.params;
  const { rut } = route.params;
  const toastRef = useRef();

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

  useEffect(() => {
    const getManifests = async () => {
      await axios
        .all([getListState(), getListIncidence()])
        .then(
          axios.spread((...responses) => {
            const responseListState = responses[0];
            const responseListIncidence = responses[1];
            setSelectedValueS(JSON.parse(responseListState.data.trim()));
            setSelectedValueI(JSON.parse(responseListIncidence.data.trim()));
          })
        )
        .catch((errors) => {
          console.log(errors);
        });
    };
    getManifests();
  }, []);

  const getImageFromCamera = async () => {
    setIsvisibleLoading(true);
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
      //setIsvisibleLoading(false);
      //console.log(captureImage);
      if (!captureImage.cancelled) {
        //let x = "require(" + captureImage.url + ")";
        setImageUrlBol(true);
        setImageUrl(captureImage.uri);
        setIsvisibleLoading(false);
      } else {
        setIsvisibleLoading(false);
      }
    }
  };

  const listInfo = [
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
      <Map />
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
      <Text style={styles.pedido}>Gestión del Pedido</Text>
      <PickerState />
      <PickerIncidences />
      <Customer />
      <View style={styles.imageContainer}>
        <Camera />
        <Signature />
      </View>
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={() => SaveOrder()}
        disabled={disableButton ? true : false}
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
  );

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

  function PickerIncidences() {
    return (
      <View style={styles.picker}>
        <Picker
          selectedValue={selectedValueIncidence}
          onValueChange={(itemValue, itemIndex) =>
            setSelectedIncidence(itemValue)
          }
        >
          <Picker.Item label="Seleccione Solicitud..." value="cero" />

          {selectedValueI.map((item, key) => (
            <Picker.Item label={item.estado} value={item.estado} key={key} />
          ))}
        </Picker>
      </View>
    );
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
            {<Loading isVisible={isVisibleLoading} text="Cargando Foto" />}
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
          {<Loading isVisible={isVisibleLoading} text="Cargando Foto" />}
        </View>
      );
    }
  }

  function Signature() {
    if (!signature) {
      return (
        <View>
          <Icon
            type="material-community"
            name="fountain-pen"
            color="#7a7a7a"
            containerStyle={styles.containerIcon}
            onPress={() => navigation.navigate("digitalSignature")}
          />
        </View>
      );
    } else {
      return (
        <View>
          <TouchableOpacity
            onPress={() => navigation.navigate("digitalSignature")}
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

  function base64ImageToBlob(str) {
    // extract content type and base64 payload from original string
    var pos = str.indexOf(";base64,");
    var type = str.substring(5, pos);
    var b64 = str.substr(pos + 8);

    // decode base64
    var imageContent = atob(b64);

    // create an ArrayBuffer and a view (as unsigned 8-bit)
    var buffer = new ArrayBuffer(imageContent.length);
    var view = new Uint8Array(buffer);

    // fill the view, using the decoded base64
    for (var n = 0; n < imageContent.length; n++) {
      view[n] = imageContent.charCodeAt(n);
    }

    // convert ArrayBuffer to Blob
    var blob = new Blob([buffer], { type: type });

    return blob;
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

      let localUriSig;
      let filenameSig;
      let matchSig;
      let typeSig;
      console.log(signature);
      const params = new FormData();
      params.append("opcion", "guardaPedido");
      params.append("pedido", pedido);
      params.append("manifiesto", manifiesto);
      params.append("fecha_manifiesto", fecha);
      params.append("hora_gestion", hour);
      params.append("fecha_gestion", fecha_gestion);
      params.append("estado_entrega", selectedValueState);
      params.append("encargado", user);
      params.append("carrier", carrier);
      params.append("latitud", resultGeo.coords.latitude);
      params.append("longitud", resultGeo.coords.longitude);
      params.append("recibe_nombre", name ? name : "");
      params.append("recibe_rut", rut ? name : "");
      params.append("imgFirma", signature);
      console.log(imageUrl);
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

      // if (!signature) {
      //   localUriSig = "";
      //   filenameSig = "";
      //   matchSig = "";
      //   typeSig = "";
      // } else {
      //   localUriSig = signature;
      //   filenameSig = localUriSig.split("/").pop();
      //   matchSig = /\.(\w+)$/.exec(filenameSig);
      //   typeSig = matchSig ? `image/${matchSig[1]}` : `image`;

      //   params.append("imgFirma", {
      //     uri: localUriSig,
      //     name: filenameSig,
      //     typeSig,
      //   });
      // }

      // const result = base64ImageToBlob(signature);
      // console.log(result);
      // localUriSig = signature;
      // filenameSig = localUriSig.split("/").pop();

      //   matchSig = /\.(\w+)$/.exec(filenameSig);
      //   typeSig = matchSig ? `image/${matchSig[1]}` : `image`;

      //   params.append("imgFirma", {
      //     uri: localUriSig,
      //     name: filenameSig,
      //     typeSig,
      //   });
      // }

      axios
        .post(url, params, {
          headers: {
            "content-type": "multipart/form-data",
          },
        })
        .then((response) => {
          // console.log(response);
          //setRefresh(pedido);
          navigation.navigate("pendientes");
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
