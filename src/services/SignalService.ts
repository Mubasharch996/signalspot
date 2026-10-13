import {NativeModules,PermissionsAndroid,Platform} from 'react-native';
/** Android: real dBm/operator/roaming via TelephonyManager (see android-native/). iOS: Apple exposes none -> nulls. */
export interface Radio{dbm:number|null;operator:string|null;roaming:boolean|null}
export async function getRadio():Promise<Radio>{
  const none={dbm:null,operator:null,roaming:null};
  if(Platform.OS!=='android'||!NativeModules.SignalModule)return none;
  try{
    const ok=await PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION]);
    if(ok['android.permission.READ_PHONE_STATE']!=='granted')return none;
    return await NativeModules.SignalModule.getSignal();
  }catch{return none}
}
