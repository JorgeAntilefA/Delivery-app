import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  Picker,
  AsyncStorage,
  Image,
  TouchableOpacity,
  ScrollView,
  Linking,
  Button,
  Platform,
  SafeAreaView,
  Alert,
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
import { Input } from "@ui-kitten/components";
import { useIsFocused } from "@react-navigation/native";
import RNPickerSelect from "react-native-picker-select";
import * as SQLite from "expo-sqlite";

export default function ManageOrder(props) {
  const { navigation, route } = props;
  const {
    direccion,
    comuna,
    pedido,
    nombre_cliente,
    manifiesto,
    user,
    carrierUser,
    fecha,
    latitud,
    longitud,
    tipo_despacho,
    telefono,
  } = route.params;

  const [selectedValueState, setSelectedState] = useState("cero");
  const [selectedValueS, setSelectedValueS] = useState([]);

  const [selectedValueIncidence, setSelectedIncidence] = useState("cero");
  const [selectedValueI, setSelectedValueI] = useState([]);

  const [imageUrlBol, setImageUrlBol] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const { url } = Constants;
  const [isVisibleLoading, setIsvisibleLoading] = useState(false);
  const [isVisibleLoadingCam, setIsvisibleLoadingCam] = useState(false);
  const [observacion, setObservacion] = useState("");

  const [errorMsg, setErrorMsg] = useState(null);

  const { signature } = route.params;
  const { name } = route.params;
  const { rut } = route.params;
  const toastRef = useRef();
  const isFocused = useIsFocused();
  const db = SQLite.openDatabase("db.offlineData");
  function getListIncidence() {
    const params = new URLSearchParams();
    params.append("opcion", "getTiposSolicitudes");
    params.append("carrier", carrierUser);

    return axios.post(url, params);
  }

  function getListState() {
    const params = new URLSearchParams();
    params.append("opcion", "getActivaEstados");
    params.append("carrier", carrierUser);

    return axios.post(url, params);
  }

  useEffect(() => {
    const getManifests = async () => {
      if (Platform.OS === "ios") {
        await axios
          .all([getListIncidence(), getListState()])
          .then(
            axios.spread((...responses) => {
              const responseListIncidence = responses[0];
              const responseListState = responses[1];

              setSelectedValueI(responseListIncidence.data);
              setSelectedValueS(responseListState.data);
              console.log(responses[0]);
            })
          )
          .catch((errors) => {
            console.log(errors);
          });
      } else {
        setIsvisibleLoading(true);
        await tableOffline();
        await axios
          .all([getListIncidence()])
          .then(
            axios.spread((...responses) => {
              const responseListIncidence = responses[0];

              // setSelectedValueS(JSON.parse(responseListState.data.trim()));
              setSelectedValueI(responseListIncidence.data);
            })
          )
          .catch((errors) => {
            console.log(errors);
          });

        const statesAPP = await AsyncStorage.getItem("@localStorage:states");

        setSelectedValueS(JSON.parse(statesAPP));
        setIsvisibleLoading(false);
      }
    };
    getManifests();
  }, []);

  async function tableOffline() {
    db.transaction((tx) => {
      //tx.executeSql("DROP TABLE IF EXISTS offline ");
      tx.executeSql(
        "CREATE TABLE IF NOT EXISTS offline (id INTEGER PRIMARY KEY AUTOINCREMENT, carrier TEXT,comuna text," +
          "direccion text,estado_entrega text,fecha text,gestion_usuario text," +
          "id_solicitudes_carrier_sac_estado text,latitud text,longitud text," +
          "manifiesto text,nombre_cliente text,observacion_sac text,pedido text," +
          "recibe_nombre text, recibe_rut text,ruta_firma text,ruta_foto text," +
          "nombre_foto text,type_foto text, solicitud text,tipo_solicitud text,visto_proveedor text," +
          "tipo_despacho text,fecha_gestion text,observacion text,hora_gestion text)"
      );
    });

    console.log("crea tabla");
  }

  const getImageFromCamera = async () => {
    setIsvisibleLoadingCam(true);
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
        setIsvisibleLoadingCam(false);
      } else {
        setIsvisibleLoadingCam(false);
      }
    }
  };

  const listInfo = [
    {
      text: manifiesto + " - " + fecha,
      iconName: "file-document-outline",
      iconType: "material-community",
      action: null,
      key: 1,
    },
    {
      text: pedido,
      iconName: "gift",
      iconType: "material-community",
      action: null,
      key: 2,
    },
    {
      text: direccion,
      iconName: "map-marker",
      iconType: "material-community",
      action: null,
      key: 3,
    },
    {
      text: nombre_cliente,
      iconName: "account-circle",
      iconType: "material-community",
      action: null,
      key: 4,
    },
    {
      text: telefono,
      iconName: "phone",
      iconType: "material-community",
      action: null,
      key: 5,
    },
  ];

  const OpenURLButton = ({ url, children }) => {
    const handlePress = useCallback(async () => {
      const supported = await Linking.canOpenURL(url);

      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(`No se puede procesar tu direccion en este momento`);
      }
    }, [url]);

    return (
      // <Button title={children} onPress={handlePress} style={{ height: 45 }} />
      <TouchableOpacity
        title={children}
        onPress={handlePress}
        style={styles.btnMapa}
      >
        <Text style={styles.buttonTextMapa}>VER EN MAPA</Text>
      </TouchableOpacity>
    );
  };
  return (
    <SafeAreaView style={styles.container}>
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
          {latitud !== "" ? (
            <Map
              latitud={latitud}
              longitud={longitud}
              direccion={direccion}
              comuna={comuna}
            />
          ) : (
            <View style={{ width: "100%" }}>
              <OpenURLButton
                url={encodeURI(
                  "https://www.google.cl/maps/place/" +
                    direccion +
                    "," +
                    comuna +
                    ", Chile"
                )}
              >
                VER EN MAPA
              </OpenURLButton>
            </View>
          )}
          {listInfo.map(
            (item, index) => (
              // item.text === telefono ? (
              //   <TouchableOpacity>
              <ListItem
                key={index}
                title={item.text}
                leftIcon={{
                  name: item.iconName,
                  type: item.iconType,
                  color: "#00a680",
                  size: 20,
                }}
                // onPress={() => item.action}
                containerStyle={styles.containerListItem}
              />
            )
            //   </TouchableOpacity>
            // ) : (
            //   <ListItem
            //     key={item.text}
            //     title={item.text}
            //     leftIcon={{
            //       name: item.iconName,
            //       type: item.iconType,
            //       color: "#00a680",
            //       size: 20,
            //     }}
            //     containerStyle={styles.containerListItem}
            //   />
            // )
          )}
          <Text style={styles.pedido}>Gestión del Pedido</Text>
          {Platform.OS === "ios" ? <RNPickerState /> : <PickerState />}
          {Platform.OS === "ios" ? (
            <RNPickerIncidences />
          ) : (
            <PickerIncidences />
          )}

          <Input
            style={styles.inputTextArea}
            placeholder="Observacion"
            multiline={true}
            numberOfLines={4}
            placeholderColor="#c4c3cb"
            value={observacion}
            onChange={(e) => setObservacion(e.nativeEvent.text)}
          />
          <Customer />
          <View style={styles.imageContainer}>
            <Camera />
            <Signature />
          </View>
          <View style={styles.imageContainer}>
            <TouchableOpacity
              style={styles.buttonContainer}
              onPress={() => SaveOrder()}
              activeOpacity={0.5}
            >
              <Text style={styles.buttonText}>Guardar</Text>
            </TouchableOpacity>
          </View>
          <Toast
            style={styles.toast}
            ref={toastRef}
            position="center"
            opacity={0.5}
          />
        </View>
        {<Loading isVisible={isVisibleLoading} text="Guardando.." />}
      </ScrollView>
    </SafeAreaView>
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

  function RNPickerState() {
    let state = selectedValueS.map((item) => ({
      label: item.estado,
      value: item.estado,
    }));
    return (
      <View style={styles.picker}>
        <RNPickerSelect
          onValueChange={(value) => setSelectedState(value)}
          //selectedValue={selectedValueIncidence}
          placeholder={{
            label: "Seleccione Estado...",
            value: null,
          }}
          selectedValue={selectedValueState}
          items={state}
        />
      </View>
    );
  }

  function PickerIncidences() {
    return (
      <View style={styles.picker}>
        <Picker
          selectedValue={selectedValueIncidence}
          onValueChange={(itemValue, itemIndex) => select(itemValue)}
        >
          <Picker.Item label="Seleccione Solicitud..." value="cero" />

          {selectedValueI.map((item, key) => (
            <Picker.Item label={item.tipo} value={item.tipo} key={key} />
          ))}
        </Picker>
      </View>
    );
  }

  function RNPickerIncidences() {
    let incidences = selectedValueI.map((item) => ({
      label: item.tipo,
      value: item.tipo,
    }));

    return (
      <View style={styles.picker}>
        <RNPickerSelect
          onValueChange={(value) => select(value)}
          placeholder={{
            label: "Seleccione Solicitud...",
            value: null,
          }}
          selectedValue={selectedValueIncidence}
          items={incidences}
        />
      </View>
    );
  }

  function select(itemValue) {
    navigation.navigate("incidents", {
      solicitud: itemValue,
      order: pedido,
      orderManifiesto: manifiesto,
      nombre_cliente: nombre_cliente,
      direccion: direccion,
      comuna: comuna,
      fecha: fecha,
    });
  }

  function Camera() {
    // isVisibleLoadingCam(true);
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
          </TouchableOpacity>
          {<Loading isVisible={isVisibleLoadingCam} text="Cargando Foto" />}
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
          {<Loading isVisible={isVisibleLoadingCam} text="Cargando Foto" />}
        </View>
      );
    }
  }

  function Signature() {
    if (!signature) {
      return (
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("digitalSignature", { option: "manageOrder" })
          }
        >
          <View>
            <Icon
              type="material-community"
              name="fountain-pen"
              color="#7a7a7a"
              containerStyle={styles.containerIcon}
              onPress={() =>
                navigation.navigate("digitalSignature", {
                  option: "manageOrder",
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
              navigation.navigate("digitalSignature", { option: "manageOrder" })
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

  async function getDatetime() {
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

  async function AlertSignal(obj) {
    Alert.alert(
      "Señal Inestable",
      "Pedido de guardara offline, recuerda actualizar más tarde.",
      [{ text: "OK", onPress: () => insertDataOffline(obj) }],
      { cancelable: false }
    );
  }

  async function RememberOrders(bd) {
    try {
      await AsyncStorage.removeItem("@localStorage:dataOrder");
      await AsyncStorage.setItem("@localStorage:dataOrder", bd);
    } catch (error) {
      console.log(error);
    }
  }

  async function RememberOffline(bd) {
    try {
      const offline = AsyncStorage.getItem("@localStorage:offline");
      console.log(offline);
      offline.push(bd);
      AsyncStorage.setItem("@localStorage:offline", JSON.stringify(offline));
      // RememberOffline(offline);
      navigation.navigate("pendientes");
      // setIsvisibleLoading(false);

      //await AsyncStorage.removeItem("@localStorage:offline");
      //await AsyncStorage.setItem("@localStorage:offline", bd);
    } catch (error) {
      console.log(error);
    }
  }

  async function RemoveItemValue(key) {
    try {
      await AsyncStorage.removeItem(key);
      console.log("RemoveItemValue");
      return true;
    } catch (exception) {
      console.log("RemoveItemValue Error");
      return false;
    }
  }

  function fetchData() {
    db.transaction((tx) => {
      // sending 4 arguments in executeSql
      tx.executeSql(
        "SELECT * FROM offline",
        null, // passing sql query and parameters:null
        // success callback which sends two things Transaction object and ResultSet Object
        (txObj, { rows: { _array } }) => console.log(_array)
        // failure callback which sends two things Transaction object and Error
        //(txObj, error) => console.log('Error ', error)
      ); // end executeSQL
    }); // end transaction
  }

  function insertDataOffline(obj) {
    db.transaction((tx) => {
      tx.executeSql(
        "INSERT INTO offline (carrier, comuna, direccion, estado_entrega, fecha, gestion_usuario, id_solicitudes_carrier_sac_estado, latitud, longitud, manifiesto, nombre_cliente, observacion_sac, pedido, recibe_nombre, recibe_rut, ruta_firma, ruta_foto,nombre_foto,type_foto, solicitud, tipo_despacho, tipo_solicitud, visto_proveedor,observacion,fecha_gestion,hora_gestion ) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          obj.carrier,
          obj.comuna,
          obj.direccion,
          obj.estado_entrega,
          obj.fecha,
          obj.gestion_usuario,
          obj.id_solicitudes_carrier_sac_estado,
          obj.latitud,
          obj.longitud,
          obj.manifiesto,
          obj.nombre_cliente,
          obj.observacion_sac,
          obj.pedido,
          obj.recibe_nombre,
          obj.recibe_rut,
          obj.ruta_firma,
          obj.ruta_foto,
          obj.name_foto,
          obj.type_foto,
          obj.solicitud,
          obj.tipo_despacho,
          obj.tipo_solicitud,
          obj.visto_proveedor,
          obj.observacion,
          obj.fecha_gestion,
          obj.hora_gestion,
        ],
        (txObj, resultSet) => console.log(resultSet),
        (txObj, error) => console.log("Error", error)
      );
    });
    navigation.navigate("pendientes");
  }

  async function SaveOrder() {
    const credentialsUser = await AsyncStorage.getItem(
      "@localStorage:dataOrder"
    );

    fetchData();
    if (selectedValueState == "cero") {
      toastRef.current.show("Debes seleccionar estado");
    } else {
      // setIsvisibleLoading(true);

      let solicitud = 1;
      let tipo = null;
      if (
        selectedValueState == "Direccion Erronea" &&
        tipo_despacho == "dedicado_regiones"
      ) {
        solicitud = pedido;
        tipo = "Direccion Erronea";
      }

      const params = new FormData();
      let signaturels = 0; //variable para localStorage
      if (signature) {
        params.append("imgFirma", signature);
        signaturels = 1;
      }

      const resultGeo = await getLocation();
      let fecha_gestion = await getDatetime();
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
      let listData;
      if (credentialsUser !== null) {
        listData = JSON.parse(credentialsUser).filter(
          (pedidoF) => pedidoF.pedido !== pedido
        );

        var obj = {
          carrier: carrierUser,
          comuna: comuna,
          direccion: direccion,
          estado_entrega: selectedValueState,
          fecha: fecha,
          gestion_usuario: user,
          id_solicitudes_carrier_sac_estado: null,
          latitud: null,
          longitud: null,
          manifiesto: manifiesto,
          nombre_cliente: nombre_cliente,
          observacion_sac: null,
          pedido: pedido,
          recibe_nombre: name ? name : "",
          recibe_rut: rut ? rut : "",
          ruta_firma: signaturels,
          ruta_foto: fotols,
          solicitud: solicitud,
          tipo_solicitud: tipo,
          visto_proveedor: null,
          tipo_despacho: tipo_despacho,
        };

        listData.push(obj);
        RememberOrders(JSON.stringify(listData));
      }

      params.append("opcion", "guardaPedido");
      params.append("pedido", pedido);
      params.append("manifiesto", manifiesto);
      params.append("fecha_manifiesto", fecha);
      params.append("hora_gestion", hour);
      params.append("fecha_gestion", fecha_gestion);
      params.append("estado_entrega", selectedValueState);
      params.append("encargado", user);
      params.append("carrier", carrierUser);
      params.append("latitud", resultGeo.coords.latitude);
      params.append("longitud", resultGeo.coords.longitude);
      params.append("recibe_nombre", name ? name : "");
      params.append("recibe_rut", rut ? rut : "");
      params.append("observacion", observacion);
      params.append("tipo_despacho", tipo_despacho);
      await axios
        .post(url, params, {
          headers: {
            "content-type": "multipart/form-data",
          },
          timeout: 10000,
        })
        .then((response) => {
          if (response.data[0].guardado === "true") {
            // listData.push(obj);
            // RememberOrders(JSON.stringify(listData));
            navigation.navigate("pendientes");
          }

          setIsvisibleLoading(false);
        })
        .catch((error) => {
          console.log("Error timeout");
          setIsvisibleLoading(false);
          if (isNetworkError(error)) {
            console.log("Error Conexión: " + error);

            var objOffline = {
              carrier: carrierUser,
              comuna: comuna,
              direccion: direccion,
              estado_entrega: selectedValueState,
              fecha: fecha,
              hora_gestion: hour,
              gestion_usuario: user,
              id_solicitudes_carrier_sac_estado: null,
              latitud: resultGeo.coords.latitude,
              longitud: resultGeo.coords.longitude,
              manifiesto: manifiesto,
              nombre_cliente: nombre_cliente,
              observacion_sac: null,
              pedido: pedido,
              recibe_nombre: name ? name : "",
              recibe_rut: rut ? rut : "",
              ruta_firma: signature,
              ruta_foto: localUri,
              name_foto: filename,
              type_foto: type,
              solicitud: solicitud,
              tipo_solicitud: tipo,
              visto_proveedor: null,
              tipo_despacho: tipo_despacho,
              fecha_gestion: fecha_gestion,
              observacion: observacion,
            };
            AlertSignal(objOffline);
            setIsvisibleLoading(false);
          }
        });

      //setIsvisibleLoading(false);
      //navigation.goBack();
    }
  }

  function isNetworkError(err) {
    return !!err.isAxiosError && !err.response;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: 650,
  },
  pedido: {
    fontSize: 15,
    textAlign: "center",
    backgroundColor: "#000000",
    color: "#d8d8d8",
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
    fontSize: 60,
    textAlign: "center",
    //width: 200,
    borderWidth: 1,
    borderColor: "#e3e3e3",
  },
  buttonContainer: {
    backgroundColor: "#f7c744",
    paddingVertical: 25,
    marginTop: 15,
    borderRadius: 15,
    marginBottom: 28,
    width: "80%",
  },
  buttonText: {
    textAlign: "center",
    color: "rgb(32,53,70)",
    fontWeight: "bold",
    fontSize: 18,
    marginTop: -15,
  },
  customer: {
    alignItems: "center",
  },
  toast: {
    marginTop: 100,
  },
  inputTextArea: {
    height: 50,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  btnMapa: {
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#4C83F2",
  },
  buttonTextMapa: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});
