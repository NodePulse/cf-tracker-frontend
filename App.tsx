import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { ThemeProvider, useTheme } from './src/theme/ThemeContext';
import flagsmith from '@flagsmith/react-native';
import { FlagsmithProvider } from '@flagsmith/flagsmith/react';

function ThemedNavigation() {
  const { colors, navTheme, activeTheme } = useTheme();
  const barStyle = activeTheme === 'light' ? 'dark-content' : 'light-content';

  return (
    <>
      <StatusBar
        barStyle={barStyle as any}
        backgroundColor={colors.background}
      />
      <NavigationContainer theme={navTheme as any}>
        <AppNavigator />
      </NavigationContainer>
    </>
  );
}

function App() {
  return (
    <FlagsmithProvider
      options={{
        environmentID: 'J6yaGAH8KEVTTAc9cvuh5g',
      }}
      flagsmith={flagsmith}
    >
      <SafeAreaProvider>
        <ThemeProvider>
          <ThemedNavigation />
        </ThemeProvider>
      </SafeAreaProvider>
    </FlagsmithProvider>
  );
}

export default App;
