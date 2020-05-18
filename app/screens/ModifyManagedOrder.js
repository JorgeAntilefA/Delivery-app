import React from "react";
import ModifyManageOrderForm from "../components/ManagedOrders/ModifyManageOrderForm";

export default function PendingOrders(props) {
  const { navigation, route } = props;
  return <ModifyManageOrderForm navigation={navigation} route={route} />;
}
