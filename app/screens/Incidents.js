import React from "react";
import IncidentsForm from "../components/Incidents/IncidentsForm";

export default function Incidents(props) {
  const { navigation, route } = props;
  return <IncidentsForm navigation={navigation} route={route} />;
}
