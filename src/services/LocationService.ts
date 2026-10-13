import {PermissionsAndroid,Platform} from 'react-native';
import Geo from 'react-native-geolocation-service';
export async function requestLocation():Promise<boolean>{
  if(Platform.OS==='ios')return (await Geo.requestAuthorization('whenInUse'))==='granted';
  return (await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION))==='granted';
}
export const getPosition=()=>new Promise<{lat:number;lng:number}|null>(res=>
  Geo.getCurrentPosition(p=>res({lat:p.coords.latitude,lng:p.coords.longitude}),()=>res(null),{enableHighAccuracy:true,timeout:8000,maximumAge:3000}));
