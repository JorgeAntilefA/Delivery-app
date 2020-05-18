import React from "react";
import ManagedOrdersForm from "../components/ManagedOrders/ManagedOrdersForm";

export default function ManagedOrders(props) {
  const { navigation, route } = props;
  return <ManagedOrdersForm navigation={navigation} route={route} />;
}
