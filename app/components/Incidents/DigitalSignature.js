import React, { useState, useRef } from "react";
import { StyleSheet, Text, View, Platform } from "react-native";
import Signature from "react-native-signature-canvas";
import { Input } from "@ui-kitten/components";
import Toast from "react-native-easy-toast";

export default function SignatureScreen(props) {
  const { navigation, route } = props;
  // const {
  //   direccion,
  //   pedido,
  //   nombre_cliente,
  //   carrier,
  //   manifiesto,
  //   user,
  //   carrierUser,
  //   fecha,
  //   estado_entrega,
  //   recibe_nombre,
  //   recibe_rut,
  // } = route.params;
  const [signature, setSignature] = useState(null);
  const [name, setName] = useState("");
  const [rut, setRut] = useState("");
  const toastRef = useRef();
  var Fn = {
    // Valida el rut con su cadena completa "XXXXXXXX-X"
    validaRut: function (rutCompleto) {
      if (!/^[0-9]+[-|‐]{1}[0-9kK]{1}$/.test(rutCompleto)) return false;
      var tmp = rutCompleto.split("-");
      var digv = tmp[1];
      var rut = tmp[0];
      if (digv == "K") digv = "k";
      return Fn.dv(rut) == digv;
    },
    dv: function (T) {
      var M = 0,
        S = 1;
      for (; T; T = Math.floor(T / 10))
        S = (S + (T % 10) * (9 - (M++ % 6))) % 11;
      return S ? S - 1 : "k";
    },
  };
  const handleSignature = (signature) => {
    setSignature(signature);
    let rutF = rut;
    var valor = rutF.replace(".", "");
    // Despejar Guión
    valor = valor.replace("-", "");

    // Aislar Cuerpo y Dígito Verificador
    var cuerpo = valor.slice(0, -1);
    var dv = valor.slice(-1).toUpperCase();

    // Formatear RUN
    rutF = cuerpo + "-" + dv;
    if (Fn.validaRut(rutF)) {
      navigation.navigate("responseIncidents", {
        signature: signature,
        name: name,
        rut: rutF,
      });
    } else {
      toastRef.current.show("Rut ingresado es inválido");
    }
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
      {Platform.OS === "ios" ? (
        <View style={{ height: 20 }}></View>
      ) : (
        <View></View>
      )}
      <Input
        style={styles.inputName}
        placeholder="Nombre"
        placeholderColor="#c4c3cb"
        onChange={(e) => setName(e.nativeEvent.text)}
      />
      <Input
        style={styles.inputRut}
        placeholder="11111111-1"
        placeholderColor="#c4c3cb"
        value={rut}
        onChange={(e) => setRut(e.nativeEvent.text)} //{(e) => checkRut(e.nativeEvent.text)}
      />
      <Signature
        onOK={handleSignature}
        onEmpty={handleEmpty}
        descriptionText=""
        clearText="Limpiar"
        confirmText="Guardar"
        webStyle={style}
      />
      <Toast
        style={styles.toast}
        ref={toastRef}
        position="center"
        opacity={0.5}
      />
    </View>
  );

  function checkRut(rut) {
    // Despejar Puntos
    var valor = rut.replace(".", "");
    // Despejar Guión
    valor = valor.replace("-", "");

    // Aislar Cuerpo y Dígito Verificador
    var cuerpo = valor.slice(0, -1);
    var dv = valor.slice(-1).toUpperCase();

    // Formatear RUN
    rut = cuerpo + "-" + dv;

    // Si no cumple con el mínimo ej. (n.nnn.nnn)
    // if (cuerpo.length < 7) {
    //   rut.setCustomValidity("RUT Incompleto");
    //   return false;
    // }

    // Calcular Dígito Verificador
    var suma = 0;
    var multiplo = 2;

    // Para cada dígito del Cuerpo
    for (var i = 1; i <= cuerpo.length; i++) {
      // Obtener su Producto con el Múltiplo Correspondiente
      var index = multiplo * valor.charAt(cuerpo.length - i);

      // Sumar al Contador General
      suma = suma + index;

      // Consolidar Múltiplo dentro del rango [2,7]
      if (multiplo < 7) {
        multiplo = multiplo + 1;
      } else {
        multiplo = 2;
      }
    }

    // Calcular Dígito Verificador en base al Módulo 11
    var dvEsperado = 11 - (suma % 11);

    // Casos Especiales (0 y K)
    dv = dv == "K" ? 10 : dv;
    dv = dv == 0 ? 11 : dv;

    // Validar que el Cuerpo coincide con su Dígito Verificador
    // if (dvEsperado != dv) {
    //   rut.setCustomValidity("RUT Inválido");
    //   return false;
    // }
    setRut(rut);
    // Si todo sale bien, eliminar errores (decretar que es válido)
    //  rut.setCustomValidity("");
  }
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
  toast: {
    marginTop: 100,
  },
});
