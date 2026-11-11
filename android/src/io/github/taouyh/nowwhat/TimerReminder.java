package io.github.taouyh.nowwhat;

import android.app.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.os.Build;
import android.media.AudioAttributes;
import android.provider.Settings;
import org.json.JSONObject;

/** A single persisted, one-shot alarm. Never starts/extends a timer or writes web data. */
public final class TimerReminder extends BroadcastReceiver {
    private static final String STORE="timer-reminder";
    private static final int ID=41;
    private static android.content.SharedPreferences store(Context c){return c.getSharedPreferences(STORE,0);}
    private static PendingIntent alarmIntent(Context c){return PendingIntent.getBroadcast(c,ID,new Intent(c,TimerReminder.class),PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);}
    static void sync(Context c,String json){
        AlarmManager alarms=(AlarmManager)c.getSystemService(Context.ALARM_SERVICE);
        NotificationManager notifications=(NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE);
        try{
            if(json==null||"null".equals(json)){
                alarms.cancel(alarmIntent(c));store(c).edit().remove("payload").apply();notifications.cancel(ID);return;
            }
            JSONObject next=new JSONObject(json);String key=next.getString("key");long at=next.getLong("at");
            if(key.length()>160||at<=0||at>System.currentTimeMillis()+172800000L)return;
            JSONObject previous=new JSONObject(store(c).getString("payload","{}"));
            if(at<=System.currentTimeMillis()&&!key.equals(previous.optString("key"))){
                alarms.cancel(alarmIntent(c));notifications.cancel(ID);
                store(c).edit().remove("payload").putString("delivered",key).apply();return;
            }
            store(c).edit().putString("payload",json).apply();
            if(key.equals(store(c).getString("delivered","")))return;
            if(key.equals(previous.optString("key"))&&at==previous.optLong("at"))return;
            alarms.cancel(alarmIntent(c));notifications.cancel(ID);
            // Exact when permission is available; Android may defer the documented fallback.
            if(Build.VERSION.SDK_INT<31||alarms.canScheduleExactAlarms())alarms.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,Math.max(at,System.currentTimeMillis()+100),alarmIntent(c));
            else alarms.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP,Math.max(at,System.currentTimeMillis()+100),alarmIntent(c));
        }catch(Exception ignored){/* A denied notification must never stop the timer. */}
    }
    static String status(Context c){
        NotificationManager manager=(NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE);
        if(!manager.areNotificationsEnabled())return "notifications-off";
        if(Build.VERSION.SDK_INT>=31&&!((AlarmManager)c.getSystemService(Context.ALARM_SERVICE)).canScheduleExactAlarms())return "approximate";
        return "ready";
    }
    static void refresh(Context c){String raw=store(c).getString("payload",null);store(c).edit().remove("payload").commit();sync(c,raw);}
    @Override public void onReceive(Context c,Intent intent){
        if("android.intent.action.BOOT_COMPLETED".equals(intent.getAction())){
            String raw=store(c).getString("payload",null);store(c).edit().remove("payload").commit();sync(c,raw);return;
        }
        try{
            JSONObject p=new JSONObject(store(c).getString("payload","{}"));
            String key=p.getString("key");long at=p.getLong("at");
            if(at>System.currentTimeMillis()+500||key.equals(store(c).getString("delivered","")))return;
            if(MainActivity.resumed)return; // Foreground Web Audio owns the one-time sound.
            store(c).edit().putString("delivered",key).commit();
            boolean timely=System.currentTimeMillis()-at<60000;
            boolean sound=p.optBoolean("sound",true)&&timely,vibration=p.optBoolean("vibration",false)&&timely;
            NotificationManager manager=(NotificationManager)c.getSystemService(Context.NOTIFICATION_SERVICE);
            if(!manager.areNotificationsEnabled())return;
            String channel="round-"+(sound?"sound":"silent")+(vibration?"-vibrate":"-still");
            if(Build.VERSION.SDK_INT>=26){
                NotificationChannel config=new NotificationChannel(channel,"Timer reminders · "+channel.substring(6),NotificationManager.IMPORTANCE_DEFAULT);
                config.setSound(sound?Settings.System.DEFAULT_NOTIFICATION_URI:null,new AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_NOTIFICATION).build());
                config.enableVibration(vibration);if(vibration)config.setVibrationPattern(new long[]{0,200});
                manager.createNotificationChannel(config);
            }
            Intent open=new Intent(c,MainActivity.class).setAction("io.github.taouyh.nowwhat.TIMER").addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP|Intent.FLAG_ACTIVITY_SINGLE_TOP);
            PendingIntent content=PendingIntent.getActivity(c,ID,open,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);
            Notification.Builder builder=Build.VERSION.SDK_INT>=26?new Notification.Builder(c,channel):new Notification.Builder(c);
            builder.setSmallIcon(android.R.drawable.ic_lock_idle_alarm).setContentTitle(p.getString("title")).setContentText(p.getString("body"))
                .setContentIntent(content).setAutoCancel(true).setOnlyAlertOnce(true).setVisibility(Notification.VISIBILITY_PRIVATE).setCategory(Notification.CATEGORY_REMINDER);
            if(Build.VERSION.SDK_INT<26){builder.setSound(sound?Settings.System.DEFAULT_NOTIFICATION_URI:null);if(vibration)builder.setVibrate(new long[]{0,200});}
            manager.notify(ID,builder.build());
        }catch(Exception ignored){}
    }
}
