import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Dashboard } from '../screens/Dashboard';
import { Submissions } from '../screens/Submissions';
import { SubmissionDetail } from '../screens/SubmissionDetail';
import { colors } from '../theme/index';
import { LayoutDashboard, Code2 } from 'lucide-react-native';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function SubmissionsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="SubmissionsList" component={Submissions} />
      <Stack.Screen name="SubmissionDetail" component={SubmissionDetail} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: (route => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? '';
          if (routeName === 'SubmissionDetail') {
            return { display: 'none' };
          }
          return {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            height: 64,
            paddingBottom: 10,
            paddingTop: 8,
          };
        })(route),
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: { fontWeight: '700', fontSize: 12 },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={Dashboard}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size + 2} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Submissions"
        component={SubmissionsStack}
        options={{
          tabBarLabel: 'Submissions',
          tabBarIcon: ({ color, size }) => (
            <Code2 size={size + 2} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
