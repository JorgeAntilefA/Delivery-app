import React, { useState, useEffect } from "react";
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

  // console.log(route);

  const [selectedValueState, setSelectedState] = useState("cero");
  const [selectedValueS, setSelectedValueS] = useState([]);

  const [selectedValueIncidence, setSelectedIncidence] = useState("cero");
  const [selectedValueI, setSelectedValueI] = useState([]);

  const [imageUrlBol, setImageUrlBol] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const { url } = Constants;
  const [isVisibleLoading, setIsvisibleLoading] = useState(false);

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [latitude, setLatitude] = useState();
  const [longitude, setLongitude] = useState();

  const { signature } = route.params;
  const { name } = route.params;
  const { rut } = route.params;

  // const signature = "";
  // const name = "";
  // const rut = "";

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
    console.log("a");
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
      >
        <Text style={styles.buttonText}>Guardar</Text>
      </TouchableOpacity>
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
    if (!imageUrlBol) {
      console.log("a");
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
            onPress={() => navigation.navigate("DigitalSignature")}
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

  async function SaveOrder() {
    const resultGeo = await getLocation();
    console.log(resultGeo);
    let fecha_gestion = getDatetime();
    let date = new Date();
    let hour = date.getHours() + ":00";
    //const params = new URLSearchParams();

    let localUri = imageUrl;
    let filename = localUri.split("/").pop();
    let match = /\.(\w+)$/.exec(filename);
    let type = match ? `image/${match[1]}` : `image`;

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
    params.append("photo", { uri: localUri, name: filename, type });

    console.log(
      JSON.stringify(resultGeo.coords.latitude) +
        " " +
        JSON.stringify(resultGeo.coords.longitude)
    );

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
      })
      .catch((error) => {
        console.log(error);
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
    height: 45,
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
});
