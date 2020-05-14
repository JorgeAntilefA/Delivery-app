import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  StatusBar,
  Image,
  SafeAreaView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  AsyncStorage,
  TouchableOpacity,
} from "react-native";
import { Input, Icon } from "@ui-kitten/components";
import axios from "axios";
import Loading from "../Loading";
import * as Permissions from "expo-permissions";
import Constants from "./../../utils/Constants";
import * as Location from "expo-location";

export default function LoginForm(props) {
  const { toastRef, navigation } = props;
  //const { toastRef } = props;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [isVisibleLoading, setIsvisibleLoading] = useState(false);
  const { url } = Constants;
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // const [secureTextEntry, setSecureTextEntry] = useState(true);
  const [value, setValue] = React.useState("");
  useEffect(() => {
    const getRememberedUser = async () => {
      try {
        const credentialsUser = await AsyncStorage.getItem(
          "@localStorage:credentials"
        );
        if (credentialsUser !== null) {
          console.log(credentialsUser);
          setUsername(JSON.parse(credentialsUser).username);
          setPassword(JSON.parse(credentialsUser).password);
          // return username;
        }
      } catch (error) {
        toastRef.current.show("Error al cargar usuario, vuelva a ingresar");
      }
    };

    getRememberedUser();

    (async () => {
      const cameraPermission = await Permissions.askAsync(Permissions.CAMERA);
      const cameraRollPermission = await Permissions.askAsync(
        Permissions.CAMERA_ROLL
      );

      if (
        cameraPermission.status === "granted" &&
        cameraRollPermission.status === "granted"
      ) {
        setErrorMsg("Error al otorgar el permiso");
      }

      let { status } = await Location.requestPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    })();
  }, []);

  let text = "Waiting..";
  if (errorMsg) {
    text = errorMsg;
  } else if (location) {
    text = JSON.stringify(location);
  }

  const toggleSecureEntry = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  const onIconPress = () => {
    setSecureTextEntry(!secureTextEntry);
  };

  //const renderIconUser = (style) => <Icon {...style} name={"person"} />;

  const renderInputIcon = (props) => (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
      <Icon {...props} name={!secureTextEntry ? "eye" : "eye-off"} />
    </TouchableWithoutFeedback>
  );

  const renderIconUser = (props) => (
    <TouchableWithoutFeedback onPress={toggleSecureEntry}>
      <Icon {...props} name="person" />
    </TouchableWithoutFeedback>
  );

  // const renderIconPassword = (style) => (
  //   <Icon {...props} name={secureTextEntry ? "eye-off" : "eye"} />
  // );

  rememberUser = async () => {
    try {
      let credentials = { username: username, password: password };
      await AsyncStorage.setItem(
        "@localStorage:credentials",
        JSON.stringify(credentials)
      );
    } catch (error) {
      console.log(error);
      toastRef.current.show("Error al guardar credenciales.");
    }
  };

  const login = async () => {
    setIsvisibleLoading(true);

    const params = new URLSearchParams();
    params.append("opcion", "funcion_login");
    params.append("usuario", username);
    params.append("password", password);

    if (!username || !password) {
      toastRef.current.show("Hay campos vacios");
    } else {
      await axios
        .post(url, params)
        .then((response) => {
          if (Platform.OS === "ios") {
            if (response.data.id == "null") {
              toastRef.current.show("Credenciales inválidas");
            } else {
              rememberUser();
              navigation.navigate("manifests", {
                carrier: response.data.carrier,
                nombre: response.data.nom,
              });
            }
          } else {
            if (JSON.parse(response.data.trim()).id == "null") {
              toastRef.current.show("Credenciales inválidas");
            } else {
              rememberUser();
              navigation.navigate("manifests", {
                carrier: JSON.parse(response.data.trim()).carrier,
                user: JSON.parse(response.data.trim()).nom,
              });
            }
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
    setIsvisibleLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='"light-content"' />
      <TouchableWithoutFeedback
        style={styles.container}
        onPress={Keyboard.dismiss}
      >
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../../../assets/dft_logo.gif")}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>Radiotracking</Text>
          </View>
          <View>
            <Input
              style={styles.inputForm}
              placeholder="Usuario"
              placeholderColor="#c4c3cb"
              accessoryRight={renderIconUser}
              value={username}
              onChange={(e) => setUsername(e.nativeEvent.text)}
            />
            <Input
              style={styles.inputForm}
              placeholder="Contraseña"
              placeholderColor="#c4c3cb"
              style={styles.inputForm}
              secureTextEntry={secureTextEntry}
              value={password}
              //  icon={renderIconPassword}
              accessoryRight={renderInputIcon}
              //onIconPress={onIconPress}
              onChange={(e) => setPassword(e.nativeEvent.text)}
            />
            <TouchableOpacity style={styles.buttonContainer} onPress={login}>
              <Text style={styles.buttonText}>INGRESAR</Text>
            </TouchableOpacity>
          </View>

          {<Loading isVisible={isVisibleLoading} text="Cargando" />}
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

// export default withNavigation(LoginForm);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgb(32,53,70)",
    flexDirection: "column",
  },
  logoContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 126,
  },
  title: {
    color: "#f7c744",
    fontSize: 18,
    textAlign: "center",
    marginTop: 5,
    marginBottom: 10,
    opacity: 0.9,
  },
  inputForm: {
    height: 40,
    marginBottom: 20,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  buttonContainer: {
    backgroundColor: "#f7c744",
    paddingVertical: 15,
    marginBottom: 18,
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
});
