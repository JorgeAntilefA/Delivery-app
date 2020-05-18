import React, { useEffect, useState, useRef } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Text,
  View,
  Platform,
  StatusBar,
  AsyncStorage,
  RefreshControl,
} from "react-native";
import axios from "axios";
import Loading from "../Loading";
import Constants from "../../utils/Constants";
import { FAB } from "react-native-paper";
import Toast from "react-native-easy-toast";

export default function ManifestsForm(props) {
  const { navigation, route } = props;
  const [data, setData] = useState();
  const { carrier, user } = route.params;
  const [isVisibleLoading, setIsvisibleLoading] = useState(false);
  const [selected, setSelected] = useState(new Map());
  const { url } = Constants;
  const toastRef = useRef();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const getManifests = async () => {
      setIsvisibleLoading(true);
      load();
    };
    getManifests();
    setRefreshing(false);
    rememberTitle();
  }, []);

  const load = async () => {
    const params = new URLSearchParams();
    params.append("opcion", "getManifiestos");
    params.append("carrier", carrier);

    await axios
      .post(url, params)
      .then((response) => {
        // console.log(response);

        Platform.OS === "ios"
          ? setData(response.data)
          : setData(JSON.parse(response.data.trim()));
        setIsvisibleLoading(false);
        setRefreshing(false);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const rememberTitle = async () => {
    try {
      let title = { carrier: carrier, user: user };
      await AsyncStorage.setItem("@localStorage:title", JSON.stringify(title));
    } catch (error) {
      console.log(error);
      toastRef.current.show("Error al guardar Carrier.");
    }
  };

  function Item({ id, title, selected, onSelect }) {
    return (
      <TouchableOpacity
        onPress={() => onSelect(id)}
        style={[
          styles.item,
          { backgroundColor: selected ? "#82FA58" : "#FFFFFF" },
        ]}
      >
        <Text style={styles.title}>{title.n_man}</Text>
        <Text style={styles.subtitle}>{title.nombre_manifiesto}</Text>
      </TouchableOpacity>
    );
  }

  const onSelect = React.useCallback(
    (n_man) => {
      const newSelected = new Map(selected);
      newSelected.has(n_man)
        ? newSelected.delete(n_man)
        : newSelected.set(n_man, !selected.get(n_man));
      setSelected(newSelected);
    },
    [selected]
  );

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    load();
    console.log("actualizado");
    setRefreshing(false);
  }, [refreshing]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='"light-content"' />
      <View
        style={{
          height: 40,
          backgroundColor: "#151515",
        }}
      >
        <Text style={styles.titleScreen}>Seleccione Manifiestos</Text>
      </View>
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
          {carrier}
        </Text>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <Item
            id={item.n_man}
            title={item}
            selected={!!selected.get(item.n_man)}
            onSelect={onSelect}
          />
        )}
        ItemSeparatorComponent={({ item }) => <SeparatorManifest />}
        extraData={selected}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {<Loading isVisible={isVisibleLoading} text="Cargando" />}
      <Toast
        style={styles.toast}
        ref={toastRef}
        position="center"
        opacity={0.5}
      />
      <ManifestButton />
    </SafeAreaView>
  );

  function ValidateManifests() {
    if (selected.size == 0) {
      toastRef.current.show("Debes seleccionar manifiesto");
    } else if (selected.size >= 5) {
      toastRef.current.show("5 manifiestos máximo");
    } else {
      var fecha_gestion = new Date();
      navigation.navigate("pendings", {
        screen: "pendientes",
        params: {
          manifests: [...selected.keys()],
          carrier: carrier,
          user: user,
          fecha_gestion: fecha_gestion.getTime(),
        },
      });
      setSelected(new Map());
    }
  }
  function ManifestButton() {
    return (
      <FAB
        style={styles.fab}
        icon="check"
        onPress={() => ValidateManifests()}
      />
    );
  }

  function SeparatorManifest() {
    return (
      <View
        style={{
          height: 1,
          backgroundColor: "#CED0CE",
        }}
      />
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  titleScreen: {
    marginTop: 5,
    marginLeft: 20,
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  item: {
    backgroundColor: "#D41616",
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  fab: {
    position: "absolute",
    margin: 36,
    right: 0,
    bottom: 0,
  },
  toast: {
    marginTop: 100,
  },
});
