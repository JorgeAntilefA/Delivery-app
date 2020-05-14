import React from "react";
import ManageOrderForm from "../components/ManageOrder/ManageOrderForm";

export default function ManagedOrders(props) {
  const { navigation, route } = props;
  return <ManageOrderForm navigation={navigation} route={route} />;
}
