import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

// screen isi tab
import PickingSkuByPallet from "./PickingSkuByPallet";
import { useRoute } from "@react-navigation/native";
import PickingSkuScreen from "./PickingSkuScreen";

const Tab = createMaterialTopTabNavigator();


const PickingSkuTab = () => {
  const route = useRoute();
  const itemBefore = route.params as any;

  return (
    <Tab.Navigator>
      <Tab.Screen
        name="BySku"
        component={PickingSkuScreen}
        initialParams={{ itemBefore }}
      />

      <Tab.Screen
        name="ByPallet"
        component={PickingSkuByPallet}
        initialParams={{ itemBefore }}
      />
    </Tab.Navigator>
  );
};

export default PickingSkuTab;
