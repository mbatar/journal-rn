import * as React from 'react';
import {DarkTheme, NavigationContainer} from '@react-navigation/native';
import StackNavigation from './navigation/StackNavigation';
import AppContextProvider from './context';
import {NativeBaseProvider,extendTheme} from 'native-base';
const config = {
  Heading: {
    Text: (props) => {
      return {
        color: themeTools.mode("red.300", "blue.300")(props),
      };
    },
  },
  useSystemColorMode: false,
  initialColorMode: "dark",
};
export default function App() {
  const customTheme = extendTheme(config);

  return (
    <AppContextProvider>
      <NativeBaseProvider theme={customTheme}>
        <NavigationContainer theme={DarkTheme}>
          <StackNavigation />
        </NavigationContainer>
      </NativeBaseProvider>
    </AppContextProvider>
  );
}
