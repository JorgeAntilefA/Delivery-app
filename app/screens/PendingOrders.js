import React from "react";
import PendingOrdersForm from "../components/PendingOrders/PendingOrdersForm";

export default function PendingOrders(props) {
  const { navigation, route } = props;
  return <PendingOrdersForm navigation={navigation} route={route} />;
}
