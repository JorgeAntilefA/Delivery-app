import React, { useRef } from "react";
import { StyleSheet, View } from "react-native";
import LoginForm from "../components/Login/LoginForm";
import Toast from "react-native-easy-toast";
import { useNavigation } from "@react-navigation/native";

export default function Login(props) {
  const toastRef = useRef();
  //const { navigation } = props;
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <LoginForm toastRef={toastRef} navigation={navigation} />
      <Toast
        style={styles.toast}
        ref={toastRef}
        position="center"
        opacity={0.5}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
  },
  toast: {
    marginTop: 180,
  },
});
