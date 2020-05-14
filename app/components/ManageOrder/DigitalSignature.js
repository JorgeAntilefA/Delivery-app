import React, { useState } from "react";
import { StyleSheet, Text, View, Image } from "react-native";
import Signature from "react-native-signature-canvas";
import { Input } from "@ui-kitten/components";

export default function SignatureScreen(props) {
  console.log(props);
  const { navigation } = props;
  const [signature, setSignature] = useState(null);
  const [name, setName] = useState("");
  const [rut, setRut] = useState("");

  const handleSignature = (signature) => {
    setSignature(signature);
    console.log(signature);
    navigation.navigate("manageOrder", {
      signature: signature,
      name: name,
      rut: rut,
    });
  };

  const handleEmpty = () => {
    console.log("Empty");
  };

  const style = `.m-signature-pad--footer
    .button {
      background-color: red;
      color: #FFF;
    }`;
  return (
    <View style={{ flex: 1 }}>
      <Input
        style={styles.inputName}
        placeholder="Nombre"
        placeholderColor="#c4c3cb"
        onChange={(e) => setName(e.nativeEvent.text)}
      />
      <Input
        style={styles.inputRut}
        placeholder="Rut"
        placeholderColor="#c4c3cb"
        onChange={(e) => setRut(e.nativeEvent.text)}
      />
      {/* <View style={styles.preview}> */}
      {/* {signature ? ( */}
      {/* <Image
          resizeMode={"contain"}
          style={{ width: 335, height: 114 }}
          source={{ uri: signature }}
        /> */}
      {/* ) : null} */}
      {/* </View> */}
      <Signature
        onOK={handleSignature}
        onEmpty={handleEmpty}
        descriptionText=""
        clearText="Limpiar"
        confirmText="Guardar"
        webStyle={style}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    width: 335,
    marginLeft: 15,
    height: 94,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 5,
    borderWidth: 1,
  },
  previewText: {
    color: "#FFF",
    fontSize: 14,
    height: 40,
    lineHeight: 40,
    paddingLeft: 10,
    paddingRight: 10,
    backgroundColor: "#69B2FF",
    width: 120,
    textAlign: "center",
    marginTop: 10,
  },
  inputName: {
    marginTop: 10,
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  inputRut: {
    height: 40,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
});
