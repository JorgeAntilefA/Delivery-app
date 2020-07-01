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
  AsyncStorage,
} from "react-native";
import { Icon, ListItem, CheckBox } from "react-native-elements";
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
    comuna,
    carrier,
    manifiesto,
    user,
    carrierUser,
    fecha,
    estado_entrega,
    recibe_nombre,
    recibe_rut,
    ruta_foto,
    ruta_firma,
    tipo_despacho,
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
  const [observacion, setObservacion] = useState("");

  const { signature } = route.params;
  const { name } = route.params;
  const { rut } = route.params;
  const isFocused = useIsFocused();

  const [checkedFoto, setCheckedFoto] = useState(
    ruta_foto == "1" ? true : false
  );
  const [checkedFirma, setCheckedFirma] = useState(
    ruta_firma == "1" ? true : false
  );
  const [checkedRut, setCheckedRut] = useState(
    recibe_rut !== "" ? true : false
  );

  function getListState() {
    const params = new URLSearchParams();
    params.append("opcion", "getActivaEstados");
    params.append("carrier", carrier);

    return axios.post(url, params);
  }

  useEffect(() => {
    const getManifests = async () => {
      await axios
        .all([getListState()])
        .then(
          axios.spread((...responses) => {
            const responseListState = responses[0];
            setSelectedValueS(JSON.parse(responseListState.data.trim()));
            //console.log(JSON.parse(responseListState.data.trim()));
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
    } else if (recibe_rut !== "") {
      return (
        <View style={styles.customer}>
          <Text>
            {"Recibido: "}
            {recibe_nombre}
            {" - "}
            {recibe_rut}
          </Text>
        </View>
      );
    } else {
      return (
        <View>
          <Text> </Text>
        </View>
      );
    }
  }

  function EditOrder() {
    return (
      <View>
        <View
          style={{
            flexDirection: "row",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <CheckBox center title="Foto" checked={checkedFoto} />
          <CheckBox center title="Firma" checked={checkedFirma} />
          <CheckBox center title="Cliente" checked={checkedRut} />
        </View>
        <View>
          <Customer />
          <View style={styles.imageContainer}>
            <Camera />
            <Signature />
          </View>
        </View>
      </View>
    );
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
        <Input
          style={styles.inputTextArea}
          placeholder="Observacion"
          multiline={true}
          numberOfLines={4}
          placeholderColor="#c4c3cb"
          value={observacion}
          onChange={(e) => setObservacion(e.nativeEvent.text)}
        />
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
    if (hours < 10) {
      hours = "0" + hours;
    }
    let min = new Date().getMinutes(); //Current Minutes
    if (min < 10) {
      min = "0" + min;
    }
    let sec = new Date().getSeconds(); //Current Seconds
    if (sec < 10) {
      sec = "0" + sec;
    }

    let datetime =
      year + "-" + month + "-" + date + " " + hours + ":" + min + ":" + sec;

    return datetime;
  }

  async function RememberOrders(bd) {
    try {
      await AsyncStorage.removeItem("@localStorage:dataOrder");
      await AsyncStorage.setItem("@localStorage:dataOrder", bd);
    } catch (error) {
      console.log(error);
    }
  }

  async function SaveOrder() {
    const credentialsUser = await AsyncStorage.getItem(
      "@localStorage:dataOrder"
    );

    if (selectedValueState == "cero") {
      toastRef.current.show("Debes seleccionar estado");
    } else {
      setIsvisibleLoading(true);
      const params = new FormData();

      let signaturels = 0; //variable para localStorage
      if (signature) {
        params.append("imgFirma", signature);
        signaturels = 1;
      }

      const resultGeo = await getLocation();
      let fecha_gestion = getDatetime();
      let date = new Date();
      let hour = date.getHours() + ":00";
      let localUri;
      let filename;
      let match;
      let type;

      let fotols = 0;
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
        fotols = 1;
      }

      if (credentialsUser !== null) {
        const listData = JSON.parse(credentialsUser).filter(
          (pedidoF) => pedidoF.pedido !== pedido
        );

        let solicitud = 1;
        let tipo_solicitud = "";

        if (
          selectedValueState == "Domicilio Sin Moradores" &&
          tipo_despacho == "dedicado_regiones" &&
          (selectedValueStateFinal == "Domicilio Sin Moradores" ||
            selectedValueStateFinal == null)
        ) {
          solicitud = pedido;
          tipo_solicitud = "Domicilio Sin Moradores";
        }

        var obj = {
          carrier: carrierUser,
          comuna: comuna,
          direccion: direccion,
          estado_entrega: selectedValueStateFinal
            ? selectedValueStateFinal
            : selectedValueState,
          fecha: fecha,
          gestion_usuario: user,
          id_solicitudes_carrier_sac_estado: null,
          manifiesto: manifiesto,
          nombre_cliente: nombre_cliente,
          observacion_sac: null,
          pedido: pedido,
          recibe_nombre: name ? name : "",
          recibe_rut: rut ? rut : "",
          ruta_firma: signaturels,
          ruta_foto: fotols,
          solicitud: solicitud,
          tipo_solicitud: tipo_solicitud,
          tipo_despacho: tipo_despacho,
          visto_proveedor: null,
        };
        await listData.push(obj);
        console.log(obj);
        await RememberOrders(JSON.stringify(listData));
      }

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
      params.append("recibe_nombre", name ? name : "");
      params.append("recibe_rut", rut ? rut : "");
      params.append("observacion", observacion);
      params.append("tipo_despacho", tipo_despacho);

      axios
        .post(url, params, {
          headers: {
            "content-type": "multipart/form-data",
          },
        })
        .then((response) => {
          //navigation.goBack();
          navigation.navigate("managedOrders");
          // navigation.goBack();
          // navigation.navigate("manageOrder", {
          //   screen: "pendientes",
          // });
          setIsvisibleLoading(false);
        })
        .catch((error) => {
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
  inputTextArea: {
    height: 50,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
