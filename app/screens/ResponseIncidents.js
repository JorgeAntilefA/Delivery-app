import React from "react";
import ResponseIncidentsForm from "../components/Incidents/ResponseIncidentsForm";

export default function ResponseIncidents(props) {
  const { navigation, route } = props;
  return <ResponseIncidentsForm navigation={navigation} route={route} />;
}
