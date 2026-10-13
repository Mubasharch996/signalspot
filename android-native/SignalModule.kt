package com.signalspot
import android.content.Context
import android.os.Build
import android.telephony.TelephonyManager
import com.facebook.react.bridge.*
class SignalModule(ctx: ReactApplicationContext): ReactContextBaseJavaModule(ctx){
  override fun getName()="SignalModule"
  @ReactMethod fun getSignal(p: Promise){
    try{
      val tm=reactApplicationContext.getSystemService(Context.TELEPHONY_SERVICE) as TelephonyManager
      val m=Arguments.createMap()
      var dbm:Int?=null
      if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.P) dbm=tm.signalStrength?.cellSignalStrengths?.firstOrNull()?.dbm
      if(dbm!=null && dbm!=Int.MAX_VALUE) m.putInt("dbm",dbm) else m.putNull("dbm")
      m.putString("operator",tm.networkOperatorName?.takeIf{it.isNotEmpty()})
      m.putBoolean("roaming",tm.isNetworkRoaming)
      p.resolve(m)
    }catch(e:Exception){p.reject("ERR",e)}
  }
}
// Register in a ReactPackage (SignalPackage.kt) returning listOf(SignalModule(ctx)), and add it in MainApplication.getPackages().
