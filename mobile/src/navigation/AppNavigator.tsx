import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import FavoritesScreen from '../screens/FavoritesScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: 'format-quote-close',
  Favorites: 'heart',
  Search: 'magnify',
} as const;

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
        tabBarButtonTestID: `tab-${route.name.toLowerCase()}`,
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons
            name={TAB_ICONS[route.name as keyof typeof TAB_ICONS]}
            color={color}
            size={size}
          />
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Quote of the Day', tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Your Favorites', tabBarLabel: 'Favorites' }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{ title: 'Search Quotes', tabBarLabel: 'Search' }}
      />
    </Tab.Navigator>
  );
}
