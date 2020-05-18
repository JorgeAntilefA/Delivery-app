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
import axios from "axios";
import Constants from "./../../utils/Constants";
import * as Location from "expo-location";

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
  } = route.params;

  const [selectedValueState, setSelectedState] = useState(estado_entrega);
  const [selectedValueS, setSelectedValueS] = useState([]);

  const [selectedValueIncidence, setSelectedIncidence] = useState("cero");
  const [selectedValueI, setSelectedValueI] = useState([]);

  const [imageUrl, setImageUrl] = useState();
  const { url } = Constants;

  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);

  const signature = navigation.getParam("signature");
  const name = navigation.getParam("name");
  const rut = navigation.getParam("rut");

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
      <PickerIncidences />

      <Customer />
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
    (async () => {
      let { status } = await Location.requestPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();

    if (errorMsg) {
      setLatitude("0.0");
      setLongitude("0.0");
    } else if (location) {
      setLatitude(JSON.stringify(location.coords.latitude));
      setLongitude(JSON.stringify(location.coords.longitude));
    }
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

  function SaveOrder() {
    getLocation();
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
    params.append("latitud", latitude);
    params.append("longitud", longitude);
    params.append("photo", { uri: localUri, name: filename, type });

    console.log(
      pedido +
        " " +
        manifiesto +
        " " +
        fecha +
        " " +
        hour +
        " " +
        fecha_gestion +
        " " +
        selectedValueState +
        " " +
        user +
        " " +
        carrier +
        " " +
        latitude +
        " " +
        longitude
    );

    axios
      .post(url, params, {
        headers: {
          "content-type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log(response);
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
