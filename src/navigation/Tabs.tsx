import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer,DarkTheme} from '@react-navigation/native';
import {Dashboard,FindSpot,MapScreen,History,Settings} from '../screens';
import {C} from '../components';
const Tab=createBottomTabNavigator();
export default()=><NavigationContainer theme={{...DarkTheme,colors:{...DarkTheme.colors,background:C.bg,card:C.card}}}>
 <Tab.Navigator screenOptions={{headerShown:false}}>
  <Tab.Screen name="Dashboard" component={Dashboard}/><Tab.Screen name="Find Spot" component={FindSpot}/>
  <Tab.Screen name="Map" component={MapScreen}/><Tab.Screen name="History" component={History}/><Tab.Screen name="Settings" component={Settings}/>
 </Tab.Navigator></NavigationContainer>;
