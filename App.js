import React from "react";
//import { mapping, light as lightTheme } from "@eva-design/eva";
import * as eva from "@eva-design/eva";
import { ApplicationProvider, IconRegistry } from "@ui-kitten/components";
import Navigation from "./app/navigation/Navigation";
import { EvaIconsPack } from "@ui-kitten/eva-icons";

export default function App() {
  return (
    <React.Fragment>
      <IconRegistry icons={EvaIconsPack} />
      <ApplicationProvider {...eva} theme={eva.light}>
        {/* <Login/> */}
        <Navigation />
      </ApplicationProvider>
    </React.Fragment>
  );
}
