import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Picker,
  AsyncStorage,
} from "react-native";
import { Input } from "@ui-kitten/components";
import Constants from "./../../utils/Constants";
import axios from "axios";
import { useIsFocused, StackActions } from "@react-navigation/native";
import Toast from "react-native-easy-toast";
import Loading from "../Loading";

export default function IncidentsForm(props) {
  const isFocused = useIsFocused();
  const { navigation, route } = props;
  const { solicitud, order, orderManifiesto } = route.params;

  const [tracking, setTracking] = useState("");
  const [observacion, setObservacion] = useState("");
  const [selectedValueCarrier, setSelectedCarrier] = useState("cero");
  const [selectedValueC, setSelectedValueC] = useState([]);

  //   const [selectedValueIncidence, setSelectedIncidence] = useState(solicitud);
  const [pedido, setPedido] = useState(order);
  const [manifiesto, setManifiesto] = useState(orderManifiesto);

  const [selectedValueI, setSelectedValueI] = useState([]);
  const { url } = Constants;
  const [isVisibleLoading, setIsvisibleLoading] = useState(false);
  const [userTitle, setUserTitle] = useState();
  const [carrierTitle, setCarrierTitle] = useState();
  const [disableBotton, setDisableBotton] = useState();
  const toastRef = useRef();

  console.log(solicitud);

  function getListCarrier() {
    const params = new URLSearchParams();
    params.append("opcion", "getCarrierExterno");

    return axios.post(url, params);
  }

  function getListIncidence() {
    const params = new URLSearchParams();
    params.append("opcion", "getTiposSolicitudes");
    params.append("carrier", carrierTitle);

    return axios.post(url, params);
  }

  useEffect(() => {
    getRememberedTitle();
    const getAxios = async () => {
      await axios
        .all([getListCarrier(), getListIncidence()])
        .then(
          axios.spread((...responses) => {
            const responseListCarrier = responses[0];
            const responseListIncidence = responses[1];
            setSelectedValueC(JSON.parse(responseListCarrier.data.trim()));
          })
        )
        .catch((errors) => {
          console.log(errors);
        });
    };
    getAxios();
  }, [isFocused]);

  const getRememberedTitle = async () => {
    try {
      const carrierTitle = await AsyncStorage.getItem("@localStorage:title");
      if (carrierTitle !== null) {
        setUserTitle(JSON.parse(carrierTitle).user);
        setCarrierTitle(JSON.parse(carrierTitle).carrier);
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <ScrollView>
      <View
        style={{
          height: 40,
          backgroundColor: "#151515",
        }}
      >
        <Text style={styles.titleScreen}>Solicitudes</Text>
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
      <View>
        <Text style={styles.text}>Solicitud</Text>
        <Input
          style={styles.inputForm}
          placeholderColor="#c4c3cb"
          status="danger"
          value={solicitud}
          //   disabled={true}
          editable={false}
          //   onChange={(e) => setSelectedIncidence(e.nativeEvent.text)}
        />
        {/* <PickerIncidences /> */}
        <Text style={styles.text}>Pedido</Text>
        <Input
          style={styles.inputForm}
          placeholder="Pedido"
          keyboardType="numeric"
          placeholderColor="#c4c3cb"
          value={pedido}
          onChange={(e) => setPedido(e.nativeEvent.text)}
        />
        <Text style={styles.text}>Manifiesto</Text>
        <Input
          style={styles.inputForm}
          placeholder="Manifiesto"
          keyboardType="numeric"
          placeholderColor="#c4c3cb"
          value={manifiesto}
          onChange={(e) => setManifiesto(e.nativeEvent.text)}
        />
        <Text style={styles.text}>Transporte</Text>
        <PickerCarrier />
        <Text style={styles.text}>N° Envio</Text>
        <InputTracking />
        <Text style={styles.text}>Observacion</Text>
        <Input
          style={styles.inputTextArea}
          placeholder="Observacion"
          multiline={true}
          numberOfLines={4}
          placeholderColor="#c4c3cb"
          value={observacion}
          onChange={(e) => setObservacion(e.nativeEvent.text)}
        />
        <TouchableOpacity
          style={styles.buttonContainer}
          onPress={() => SaveIncidence()}
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
      </View>
      {/* {<Loading isVisible={isVisibleLoading} text="Guardando.." />} */}
    </ScrollView>
  );

  function InputTracking() {
    if (solicitud == "Devolver OP") {
      return (
        <Input
          style={styles.inputForm}
          placeholder="N° Envio"
          keyboardType="numeric"
          placeholderColor="#c4c3cb"
          value={tracking}
          onChange={(e) => setTracking(e.nativeEvent.text)}
        />
      );
    } else {
      return (
        <Input
          style={styles.inputForm}
          placeholder="N° Envio"
          keyboardType="numeric"
          placeholderColor="#c4c3cb"
          disabled={true}
          value={tracking}
        />
      );
    }
  }
  function PickerCarrier() {
    solicitud == "Devolver OP"
      ? setDisableBotton(true)
      : setDisableBotton(false);
    return (
      <View style={styles.picker}>
        <Picker
          selectedValue={selectedValueCarrier}
          onValueChange={(itemValue, itemIndex) =>
            setSelectedCarrier(itemValue)
          }
          enabled={disableBotton}
        >
          <Picker.Item label="Seleccione Carrier..." value="cero" />

          {selectedValueC.map((item, key) => (
            <Picker.Item label={item.carrier} value={item.carrier} key={key} />
          ))}
        </Picker>
      </View>
    );
  }

  async function SaveIncidence() {
    if (solicitud == "") {
      toastRef.current.show("Debes seleccionar incidencia");
    } else {
      setIsvisibleLoading(true);

      const params = new FormData();
      params.append("opcion", "guardaSolicitud");
      params.append("tipo", solicitud);
      params.append("carrier", carrierTitle);
      params.append("pedido", pedido);
      params.append("manifiesto", manifiesto);
      params.append("carrier_externo", selectedValueCarrier);
      params.append("tracking", tracking);
      params.append("observacion", observacion);

      console.log(params);
      await axios
        .post(url, params)
        .then((response) => {
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
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(32,53,70)",
    flexDirection: "column",
  },
  titleScreen: {
    marginTop: 5,
    marginLeft: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  inputForm: {
    height: 35,
    marginBottom: 10,
    color: "rgb(32,53,70)",
    paddingHorizontal: 10,
    // backgroundColor: "rgba(255,255,255,0.2)",
  },
  inputTextArea: {
    height: 80,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  text: {
    marginLeft: 10,
  },
  buttonContainer: {
    backgroundColor: "#f7c744",

    paddingVertical: 15,
    //marginTop: 5,
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
  picker: {
    // backgroundColor: "#68a0cf",
    height: 40,
    justifyContent: "center",
    textAlign: "center",
    marginLeft: 10,
    width: "80%",
    borderWidth: 1,
    borderColor: "#e3e3e3",
  },
});