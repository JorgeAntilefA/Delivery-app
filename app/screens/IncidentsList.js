import React from "react";
import IncidentsListForm from "../components/Incidents/IncidentsListForm";

export default function IncidentsList(props) {
  //   const { navigation, route } = props;
  //   return <IncidentsListForm navigation={navigation} route={route} />;
  const { navigation, route } = props;
  return <IncidentsListForm navigation={navigation} route={route} />;
}
