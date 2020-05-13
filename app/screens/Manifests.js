import React from "react";
import ManifestsForm from "../components/Manifests/ManifestsForm";

export default function Manifests(props) {
  //console.log(props);
  const { navigation, route } = props;
  return <ManifestsForm navigation={navigation} route={route} />;
}
