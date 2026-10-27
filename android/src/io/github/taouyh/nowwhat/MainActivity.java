package io.github.taouyh.nowwhat;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.webkit.*;
import android.view.*;
import android.widget.*;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.json.JSONObject;

public final class MainActivity extends Activity {
    private static final String ORIGIN = "https://app.nowwhat.local";
    private static final int OPEN_BACKUP = 10, SAVE_BACKUP = 11;
    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private String exportContent, exportRequest;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(247,245,240));
        web = new WebView(this);
        root.addView(web, new FrameLayout.LayoutParams(-1,-1));
        setContentView(root);
        root.setOnApplyWindowInsetsListener((view,insets)->{
            if(Build.VERSION.SDK_INT>=30){
                android.graphics.Insets bars=insets.getInsets(WindowInsets.Type.systemBars()|WindowInsets.Type.displayCutout()|WindowInsets.Type.ime());
                view.setPadding(bars.left,bars.top,bars.right,bars.bottom);
            }else view.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());
            return insets;
        });
        WebSettings settings = web.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        web.addJavascriptInterface(new BackupBridge(), "NowWhatAndroid");
        web.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
                Uri uri=request.getUrl();return !("https".equals(uri.getScheme())&&"app.nowwhat.local".equals(uri.getHost())&&"/index.html".equals(uri.getPath()));
            }
            @Override public WebResourceResponse shouldInterceptRequest(WebView view,WebResourceRequest request){
                Uri uri=request.getUrl();String name=uri.getPath();
                if(!"https".equals(uri.getScheme())||!"app.nowwhat.local".equals(uri.getHost())||!("/index.html".equals(name)||"/app.js".equals(name)||"/i18n.js".equals(name)||"/style.css".equals(name)||"/native-android.js".equals(name)))return errorResponse();
                try{
                    String mime=name.endsWith(".js")?"application/javascript":name.endsWith(".css")?"text/css":"text/html";
                    Map<String,String> headers=new HashMap<>();
                    headers.put("Content-Security-Policy","default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'none'; img-src 'self' data:; object-src 'none'; frame-src 'none'; base-uri 'none'");
                    return new WebResourceResponse(mime,"UTF-8",200,"OK",headers,getAssets().open(name.substring(1)));
                }catch(IOException error){return errorResponse();}
            }
        });
        web.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){
                if(fileCallback!=null)fileCallback.onReceiveValue(null);fileCallback=callback;
                Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT);intent.addCategory(Intent.CATEGORY_OPENABLE);intent.setType("*/*");intent.putExtra(Intent.EXTRA_MIME_TYPES,new String[]{"application/json","text/plain"});
                try{startActivityForResult(intent,OPEN_BACKUP);}catch(Exception e){fileCallback.onReceiveValue(null);fileCallback=null;}
                return true;
            }
        });
        web.loadUrl(ORIGIN+"/index.html");
    }
    private WebResourceResponse errorResponse(){return new WebResourceResponse("text/plain","UTF-8",404,"Not Found",Collections.emptyMap(),new ByteArrayInputStream(new byte[0]));}
    public final class BackupBridge {
        @JavascriptInterface public void setTheme(String theme){
            runOnUiThread(()->{
                boolean dark="dark".equals(theme);int color=dark?Color.rgb(30,32,28):Color.rgb(247,245,240);
                ((View)web.getParent()).setBackgroundColor(color);getWindow().setStatusBarColor(color);getWindow().setNavigationBarColor(color);
                int flags=getWindow().getDecorView().getSystemUiVisibility();
                flags=dark?flags&~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR:flags|View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                if(Build.VERSION.SDK_INT>=26)flags=dark?flags&~View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR:flags|View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR;
                getWindow().getDecorView().setSystemUiVisibility(flags);
            });
        }
        @JavascriptInterface public void exportText(String request,String content,String name){
            runOnUiThread(()->{
                if(web.getUrl()==null||!web.getUrl().startsWith(ORIGIN+"/index.html")||exportRequest!=null||content==null||content.length()>32*1024*1024||!name.matches("what-to-do-(backup\\.json|original\\.txt|timer-original\\.txt)")){reply(request,false,true);return;}
                exportContent=content;exportRequest=request;
                Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);intent.addCategory(Intent.CATEGORY_OPENABLE);intent.setType(name.endsWith(".json")?"application/json":"text/plain");intent.putExtra(Intent.EXTRA_TITLE,name);
                try{startActivityForResult(intent,SAVE_BACKUP);}catch(Exception e){reply(request,false,true);exportContent=null;exportRequest=null;}
            });
        }
    }
    private void reply(String id,boolean saved,boolean failed){
        web.evaluateJavascript("window.dispatchEvent(new CustomEvent('native-backup-result',{detail:{id:"+JSONObject.quote(id)+",saved:"+saved+",failed:"+failed+"}}))",null);
    }
    @Override protected void onActivityResult(int request,int result,Intent data){
        super.onActivityResult(request,result,data);
        if(request==OPEN_BACKUP&&fileCallback!=null){fileCallback.onReceiveValue(result==RESULT_OK&&data!=null&&data.getData()!=null?new Uri[]{data.getData()}:null);fileCallback=null;}
        if(request==SAVE_BACKUP&&exportRequest!=null){
            boolean saved=false,failed=false;
            if(result==RESULT_OK&&data!=null&&data.getData()!=null){
                try(OutputStream stream=getContentResolver().openOutputStream(data.getData(),"wt")){if(stream==null)throw new IOException();stream.write(exportContent.getBytes(StandardCharsets.UTF_8));saved=true;}
                catch(Exception e){failed=true;Toast.makeText(this,R.string.save_failed,Toast.LENGTH_LONG).show();}
            }
            reply(exportRequest,saved,failed);exportContent=null;exportRequest=null;
        }
    }
    @Override public void onBackPressed(){
        web.evaluateJavascript("(function(){if(typeof page!=='function')return 'background';if(!$('confirmLayer').classList.contains('hide')||!$('modal').classList.contains('hide')||$('timePicker').open||$('conditionsPicker').open||!$('librarySearch').classList.contains('hide')){document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));}else if(location.hash!=='#home'){page('home');}else{return 'background';}return 'handled';})()",value->{if("\"background\"".equals(value))moveTaskToBack(true);});
    }
    @Override protected void onPause(){
        android.os.PowerManager power=(android.os.PowerManager)getSystemService(POWER_SERVICE);
        String lifecycle=power!=null&&!power.isInteractive()?"sleep":"background";
        web.evaluateJavascript("typeof nativeTimerLifecycle==='function' && nativeTimerLifecycle('"+lifecycle+"')",null);
        super.onPause();web.onPause();
    }
    @Override protected void onStop(){if(web!=null)web.evaluateJavascript("typeof nativeTimerLifecycle==='function' && nativeTimerLifecycle('checkpoint')",null);super.onStop();}
    @Override protected void onResume(){super.onResume();if(web!=null){web.onResume();web.evaluateJavascript("typeof nativeTimerLifecycle==='function' ? nativeTimerLifecycle('resume') : document.dispatchEvent(new Event('visibilitychange'))",null);}}
    @Override protected void onDestroy(){if(fileCallback!=null)fileCallback.onReceiveValue(null);web.removeJavascriptInterface("NowWhatAndroid");web.destroy();super.onDestroy();}
}
