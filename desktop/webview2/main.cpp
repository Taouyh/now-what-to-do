#define UNICODE
#define _UNICODE
#include <windows.h>
#include <shlobj.h>
#include <shlwapi.h>
#include <commdlg.h>
#include <wrl.h>
#include <winrt/base.h>
#include <winrt/Windows.Foundation.Collections.h>
#include <winrt/Windows.Data.Json.h>
#include <filesystem>
#include <fstream>
#include <map>
#include <string>
#include "WebView2.h"
#include "WebView2EnvironmentOptions.h"

using Microsoft::WRL::ComPtr;
using Microsoft::WRL::Callback;
using namespace winrt::Windows::Data::Json;
namespace fs = std::filesystem;
static const std::wstring origin=L"https://nowwhat.local";
static HWND windowHandle;
static ComPtr<ICoreWebView2Environment> environment;
static ComPtr<ICoreWebView2Controller> controller;
static ComPtr<ICoreWebView2> web;
static fs::path applicationRoot,profile;
static bool testing=false;
static std::wstring env(const wchar_t* name) {
    DWORD size=GetEnvironmentVariableW(name,nullptr,0); if(!size)return L"";
    std::wstring result(size,L'\0');GetEnvironmentVariableW(name,result.data(),size);result.resize(size-1);return result;
}
static std::string read(const fs::path& path) {
    std::ifstream file(path,std::ios::binary);if(!file)throw std::runtime_error("Cannot open application asset");
    return std::string(std::istreambuf_iterator<char>(file),{});
}
static bool trusted(const std::wstring& uri) {
    return uri.substr(0,uri.find(L'#'))==origin+L"/index.html";
}
static void fail(HRESULT error) {
    std::wstring message=L"Unable to open Now What ("+std::to_wstring(static_cast<unsigned long>(error))+L"). Install Microsoft Edge WebView2 Runtime and try again.";
    if(testing){std::ofstream log(profile/L"startup-error.txt");log<<winrt::to_string(message);}
    else MessageBoxW(windowHandle,message.c_str(),L"Now What",MB_OK|MB_ICONERROR);
    DestroyWindow(windowHandle);
}
static void memoryTarget(bool inactive) {
    ComPtr<ICoreWebView2_19> memory;
    // A best-effort target; scripts and the active timer continue running.
    if(web && SUCCEEDED(web.As(&memory)))memory->put_MemoryUsageTargetLevel(inactive?COREWEBVIEW2_MEMORY_USAGE_TARGET_LEVEL_LOW:COREWEBVIEW2_MEMORY_USAGE_TARGET_LEVEL_NORMAL);
}
static void reply(const std::wstring& id,bool saved,bool failed) {
    JsonObject result;result.Insert(L"id",JsonValue::CreateStringValue(id));
    result.Insert(L"saved",JsonValue::CreateBooleanValue(saved));result.Insert(L"failed",JsonValue::CreateBooleanValue(failed));
    web->PostWebMessageAsJson(result.Stringify().c_str());
}
static void exportBackup(ICoreWebView2WebMessageReceivedEventArgs* args) {
    LPWSTR address=nullptr;args->get_Source(&address);bool allowed=address&&trusted(address);CoTaskMemFree(address);if(!allowed)return;
    std::wstring id;
    try {
        LPWSTR raw=nullptr;winrt::check_hresult(args->get_WebMessageAsJson(&raw));
        std::wstring message=raw;CoTaskMemFree(raw);
        if(message.size()>34*1024*1024)throw std::runtime_error("Message too large");
        auto request=JsonObject::Parse(message);id=request.GetNamedString(L"id");
        if(id.empty()||id.size()>32)throw std::runtime_error("Invalid request ID");
        if(request.GetNamedString(L"kind")!=L"backup:save")throw std::runtime_error("Invalid message");
        std::wstring name(request.GetNamedString(L"name"));
        if(name!=L"what-to-do-backup.json"&&name!=L"what-to-do-original.txt"&&name!=L"what-to-do-timer-original.txt")throw std::runtime_error("Invalid filename");
        std::string content=winrt::to_string(request.GetNamedString(L"content"));
        if(content.size()>32*1024*1024)throw std::runtime_error("Backup too large");
        fs::path destination;
        if(testing){
            auto directory=env(L"NOWWHAT_E2E_SAVE_DIR");if(directory.empty())throw std::runtime_error("Missing test directory");
            fs::create_directories(directory);destination=fs::path(directory)/name;
        }else{
            wchar_t selected[32768]={};wcscpy_s(selected,name.c_str());
            OPENFILENAMEW dialog={sizeof(dialog)};dialog.hwndOwner=windowHandle;dialog.lpstrFile=selected;dialog.nMaxFile=32768;
            dialog.lpstrFilter=L"Backup files\0*.json;*.txt\0All files\0*.*\0";dialog.Flags=OFN_OVERWRITEPROMPT|OFN_PATHMUSTEXIST|OFN_NOCHANGEDIR;
            if(!GetSaveFileNameW(&dialog)){if(CommDlgExtendedError())throw std::runtime_error("Save dialog failed");reply(id,false,false);return;}
            destination=selected;
        }
        std::ofstream output(destination,std::ios::binary|std::ios::trunc);output.write(content.data(),content.size());output.close();
        if(!output)throw std::runtime_error("Cannot write backup");reply(id,true,false);
    }catch(...){if(!id.empty()&&id.size()<=32)reply(id,false,true);}
}
static HRESULT configure() {
    ComPtr<ICoreWebView2Settings> settings;web->get_Settings(&settings);
    settings->put_AreDevToolsEnabled(testing);settings->put_AreDefaultContextMenusEnabled(FALSE);
    settings->put_IsStatusBarEnabled(FALSE);settings->put_IsZoomControlEnabled(FALSE);
    EventRegistrationToken token;
    web->add_PermissionRequested(Callback<ICoreWebView2PermissionRequestedEventHandler>([](ICoreWebView2*,ICoreWebView2PermissionRequestedEventArgs* e)->HRESULT{e->put_State(COREWEBVIEW2_PERMISSION_STATE_DENY);return S_OK;}).Get(),&token);
    web->add_NewWindowRequested(Callback<ICoreWebView2NewWindowRequestedEventHandler>([](ICoreWebView2*,ICoreWebView2NewWindowRequestedEventArgs* e)->HRESULT{e->put_Handled(TRUE);return S_OK;}).Get(),&token);
    web->add_NavigationStarting(Callback<ICoreWebView2NavigationStartingEventHandler>([](ICoreWebView2*,ICoreWebView2NavigationStartingEventArgs* e)->HRESULT{LPWSTR uri=nullptr;e->get_Uri(&uri);if(!uri||!trusted(uri))e->put_Cancel(TRUE);CoTaskMemFree(uri);return S_OK;}).Get(),&token);
    web->add_FrameNavigationStarting(Callback<ICoreWebView2NavigationStartingEventHandler>([](ICoreWebView2*,ICoreWebView2NavigationStartingEventArgs* e)->HRESULT{e->put_Cancel(TRUE);return S_OK;}).Get(),&token);
    ComPtr<ICoreWebView2_4> downloads;
    if(SUCCEEDED(web.As(&downloads)))downloads->add_DownloadStarting(Callback<ICoreWebView2DownloadStartingEventHandler>([](ICoreWebView2*,ICoreWebView2DownloadStartingEventArgs* e)->HRESULT{e->put_Cancel(TRUE);return S_OK;}).Get(),&token);
    web->AddWebResourceRequestedFilter(L"*",COREWEBVIEW2_WEB_RESOURCE_CONTEXT_ALL);
    web->add_WebResourceRequested(Callback<ICoreWebView2WebResourceRequestedEventHandler>([](ICoreWebView2*,ICoreWebView2WebResourceRequestedEventArgs* args)->HRESULT{
        ComPtr<ICoreWebView2WebResourceRequest> request;args->get_Request(&request);LPWSTR raw=nullptr;request->get_Uri(&raw);
        std::wstring uri=raw?raw:L"";CoTaskMemFree(raw);uri=uri.substr(0,uri.find_first_of(L"?#"));
        const std::map<std::wstring,std::wstring> assets={{L"index.html",L"text/html; charset=utf-8"},{L"app.js",L"text/javascript; charset=utf-8"},{L"i18n.js",L"text/javascript; charset=utf-8"},{L"style.css",L"text/css; charset=utf-8"}};
        ComPtr<ICoreWebView2WebResourceResponse> response;bool found=false;
        for(const auto& asset:assets)if(uri==origin+L"/"+asset.first){
            ComPtr<IStream> stream;HRESULT result=SHCreateStreamOnFileEx((applicationRoot/L"web"/asset.first).c_str(),STGM_READ|STGM_SHARE_DENY_WRITE,FILE_ATTRIBUTE_NORMAL,FALSE,nullptr,&stream);
            if(FAILED(result))return result;
            std::wstring headers=L"Content-Type: "+asset.second+L"\r\nContent-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-src 'none'\r\nX-Content-Type-Options: nosniff\r\n";
            environment->CreateWebResourceResponse(stream.Get(),200,L"OK",headers.c_str(),&response);found=true;break;
        }
        if(!found)environment->CreateWebResourceResponse(nullptr,404,L"Not Found",L"",&response);
        return args->put_Response(response.Get());
    }).Get(),&token);
    web->add_WebMessageReceived(Callback<ICoreWebView2WebMessageReceivedEventHandler>([](ICoreWebView2*,ICoreWebView2WebMessageReceivedEventArgs* args)->HRESULT{exportBackup(args);return S_OK;}).Get(),&token);
    const auto bridge=winrt::to_hstring(read(applicationRoot/L"native-webview2.js"));
    return web->AddScriptToExecuteOnDocumentCreated(bridge.c_str(),Callback<ICoreWebView2AddScriptToExecuteOnDocumentCreatedCompletedHandler>([](HRESULT result,LPCWSTR)->HRESULT{
        if(FAILED(result)){fail(result);return result;}return web->Navigate((origin+L"/index.html").c_str());
    }).Get());
}
static LRESULT CALLBACK procedure(HWND hwnd,UINT message,WPARAM wParam,LPARAM lParam) {
    switch(message){
        case WM_SIZE: if(controller){RECT bounds;GetClientRect(hwnd,&bounds);controller->put_Bounds(bounds);memoryTarget(wParam==SIZE_MINIMIZED);}return 0;
        case WM_ACTIVATE: memoryTarget(LOWORD(wParam)==WA_INACTIVE);return 0;
        case WM_DPICHANGED: {auto bounds=reinterpret_cast<RECT*>(lParam);SetWindowPos(hwnd,nullptr,bounds->left,bounds->top,bounds->right-bounds->left,bounds->bottom-bounds->top,SWP_NOZORDER|SWP_NOACTIVATE);return 0;}
        case WM_GETMINMAXINFO: {auto info=reinterpret_cast<MINMAXINFO*>(lParam);info->ptMinTrackSize={360,480};return 0;}
        case WM_DESTROY: if(controller)controller->Close();web.Reset();controller.Reset();environment.Reset();PostQuitMessage(0);return 0;
    }
    return DefWindowProcW(hwnd,message,wParam,lParam);
}
int WINAPI wWinMain(HINSTANCE instance,HINSTANCE,LPWSTR commandLine,int) {
    if(std::wstring(commandLine)==L"--check-runtime") {LPWSTR version=nullptr;HRESULT result=GetAvailableCoreWebView2BrowserVersionString(nullptr,&version);CoTaskMemFree(version);return SUCCEEDED(result)?0:2;}
    testing=env(L"NOWWHAT_E2E")==L"1";
    wchar_t executable[32768];GetModuleFileNameW(nullptr,executable,32768);applicationRoot=fs::path(executable).parent_path();
    wchar_t local[MAX_PATH];if(FAILED(SHGetFolderPathW(nullptr,CSIDL_LOCAL_APPDATA,nullptr,SHGFP_TYPE_CURRENT,local)))return 1;
    profile=testing&&!env(L"NOWWHAT_E2E_PROFILE").empty()?fs::path(env(L"NOWWHAT_E2E_PROFILE")):fs::path(local)/L"NowWhat"/L"WebView2";
    try{fs::create_directories(profile);}catch(...){return 1;}
    // A profile may have only one application window; separate synthetic profiles can run in parallel.
    std::wstring lockName=L"Local\\NowWhat-WebView2-"+std::to_wstring(std::hash<std::wstring>{}(profile.wstring()));
    HANDLE lock=CreateMutexW(nullptr,TRUE,lockName.c_str());if(!lock)return 1;
    if(GetLastError()==ERROR_ALREADY_EXISTS){HWND previous=FindWindowW(L"NowWhatWebView2",L"Now What");if(previous){ShowWindow(previous,SW_RESTORE);SetForegroundWindow(previous);}CloseHandle(lock);return 0;}
    winrt::init_apartment(winrt::apartment_type::single_threaded);
    auto setDpi=reinterpret_cast<BOOL(WINAPI*)(DPI_AWARENESS_CONTEXT)>(GetProcAddress(GetModuleHandleW(L"user32.dll"),"SetProcessDpiAwarenessContext"));
    if(setDpi)setDpi(DPI_AWARENESS_CONTEXT_PER_MONITOR_AWARE_V2);else SetProcessDPIAware();
    WNDCLASSEXW cls={sizeof(cls)};cls.lpfnWndProc=procedure;cls.hInstance=instance;cls.lpszClassName=L"NowWhatWebView2";
    cls.hCursor=LoadCursorW(nullptr,IDC_ARROW);cls.hIcon=LoadIconW(instance,MAKEINTRESOURCEW(1));cls.hbrBackground=CreateSolidBrush(RGB(247,245,240));RegisterClassExW(&cls);
    windowHandle=CreateWindowExW(testing?WS_EX_TOOLWINDOW:0,cls.lpszClassName,L"Now What",WS_OVERLAPPEDWINDOW,CW_USEDEFAULT,CW_USEDEFAULT,1100,850,nullptr,nullptr,instance,nullptr);
    if(!windowHandle){CloseHandle(lock);return 1;}
    if(testing){SetWindowLongPtrW(windowHandle,GWL_EXSTYLE,GetWindowLongPtrW(windowHandle,GWL_EXSTYLE)|WS_EX_LAYERED);SetLayeredWindowAttributes(windowHandle,0,0,LWA_ALPHA);}
    ShowWindow(windowHandle,SW_SHOW);
    auto options=Microsoft::WRL::Make<CoreWebView2EnvironmentOptions>();
    auto port=env(L"NOWWHAT_E2E_PORT");
    if(testing&&!port.empty()&&port.find_first_not_of(L"0123456789")==std::wstring::npos)options->put_AdditionalBrowserArguments((L"--remote-debugging-port="+port).c_str());
    HRESULT start=CreateCoreWebView2EnvironmentWithOptions(nullptr,profile.c_str(),options.Get(),Callback<ICoreWebView2CreateCoreWebView2EnvironmentCompletedHandler>([](HRESULT result,ICoreWebView2Environment* created)->HRESULT{
        if(FAILED(result)||!created){fail(result);return result;}environment=created;
        return environment->CreateCoreWebView2Controller(windowHandle,Callback<ICoreWebView2CreateCoreWebView2ControllerCompletedHandler>([](HRESULT result,ICoreWebView2Controller* created)->HRESULT{
            if(FAILED(result)||!created){fail(result);return result;}controller=created;controller->get_CoreWebView2(&web);
            RECT bounds;GetClientRect(windowHandle,&bounds);controller->put_Bounds(bounds);
            try{HRESULT configured=configure();if(FAILED(configured))fail(configured);return configured;}catch(...){fail(E_FAIL);return E_FAIL;}
        }).Get());
    }).Get());
    if(FAILED(start))fail(start);
    MSG message;while(GetMessageW(&message,nullptr,0,0)>0){TranslateMessage(&message);DispatchMessageW(&message);}
    DeleteObject(cls.hbrBackground);ReleaseMutex(lock);CloseHandle(lock);return 0;
}
