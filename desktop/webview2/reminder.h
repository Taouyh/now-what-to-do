#include <winrt/Windows.UI.Notifications.h>
#include <winrt/Windows.Data.Xml.Dom.h>
#include <propkey.h>
#include <propvarutil.h>
#include <chrono>

// Protocol activation keeps this unpackaged app independent of a resident COM server.
static constexpr auto reminderAppId=L"io.github.taouyh.nowwhat";
static bool reminderBackground=false;
static JsonObject reminderPayload{nullptr};
static std::wstring reminderSignature;
static void reminderCancel() {
    using namespace winrt::Windows::UI::Notifications;
    try{auto notifier=ToastNotificationManager::CreateToastNotifier(reminderAppId);
        for(auto item:notifier.GetScheduledToastNotifications())if(item.Id()==L"round")notifier.RemoveFromSchedule(item);
        ToastNotificationManager::History().Remove(L"round",L"timer",reminderAppId);
    }catch(...){}
    reminderSignature.clear();
}
static void reminderRegister() {
    if(testing)return;
    SetCurrentProcessExplicitAppUserModelID(reminderAppId);
    try{
        wchar_t programs[MAX_PATH];winrt::check_hresult(SHGetFolderPathW(nullptr,CSIDL_PROGRAMS,nullptr,SHGFP_TYPE_CURRENT,programs));
        auto path=fs::path(programs)/L"Now What.lnk";
        if(!fs::exists(path))return; // Only the installer owns shortcuts.
        ComPtr<IShellLinkW> link;winrt::check_hresult(CoCreateInstance(CLSID_ShellLink,nullptr,CLSCTX_INPROC_SERVER,IID_PPV_ARGS(&link)));
        ComPtr<IPersistFile> file;winrt::check_hresult(link.As(&file));winrt::check_hresult(file->Load(path.c_str(),STGM_READWRITE));
        ComPtr<IPropertyStore> properties;winrt::check_hresult(link.As(&properties));
        PROPVARIANT value;winrt::check_hresult(InitPropVariantFromString(reminderAppId,&value));
        properties->SetValue(PKEY_AppUserModel_ID,value);PropVariantClear(&value);
        // Stub CLSID + protocol activation: toast is retained in Notification Center.
        GUID clsid;CLSIDFromString(L"{707AD8C4-39C2-461C-B564-AB42B9692F19}",&clsid);
        InitPropVariantFromCLSID(clsid,&value);properties->SetValue(PKEY_AppUserModel_ToastActivatorCLSID,value);PropVariantClear(&value);
        properties->Commit();file->Save(path.c_str(),TRUE);
    }catch(...){}
}
static void reminderUpdate() {
    using namespace winrt::Windows::UI::Notifications;
    using namespace winrt::Windows::Data::Xml::Dom;
    try {
        if(!reminderBackground||!reminderPayload||!reminderPayload.HasKey(L"at")){reminderCancel();return;}
        auto signature=std::wstring(reminderPayload.Stringify());if(signature==reminderSignature)return;
        reminderCancel();reminderSignature=signature;
        double at=reminderPayload.GetNamedNumber(L"at");
        auto due=std::chrono::system_clock::time_point(std::chrono::milliseconds(static_cast<long long>(at)));
        // Do not replay a missed notification when reopening or after clock changes.
        if(due<=std::chrono::system_clock::now())return;
        if(due>std::chrono::system_clock::now()+std::chrono::hours(48))return;
        XmlDocument xml;xml.LoadXml(L"<toast activationType='protocol' launch='nowwhat://timer'><visual><binding template='ToastGeneric'><text/><text/></binding></visual><audio/></toast>");
        auto texts=xml.GetElementsByTagName(L"text");
        texts.Item(0).AppendChild(xml.CreateTextNode(reminderPayload.GetNamedString(L"title")));
        texts.Item(1).AppendChild(xml.CreateTextNode(reminderPayload.GetNamedString(L"body")));
        auto audio=xml.GetElementsByTagName(L"audio").Item(0).as<XmlElement>();
        audio.SetAttribute(L"silent",reminderPayload.GetNamedBoolean(L"sound",true)?L"false":L"true");
        ScheduledToastNotification toast(xml,winrt::clock::from_sys(due));toast.Id(L"round");toast.Tag(L"round");toast.Group(L"timer");
        if(testing){std::ofstream log(profile/L"reminder-schedule.json");log<<winrt::to_string(reminderPayload.Stringify());return;}
        ToastNotificationManager::CreateToastNotifier(reminderAppId).AddToSchedule(toast);
    }catch(...){if(testing){std::ofstream log(profile/L"reminder-error.txt");log<<"Notification scheduling unavailable";}}
}
static void reminderMessage(JsonObject request) {
    if(request.GetNamedString(L"kind")==L"reminder:settings"){
        if(!testing)ShellExecuteW(windowHandle,L"open",L"ms-settings:notifications",nullptr,nullptr,SW_SHOWNORMAL);return;
    }
    auto value=request.GetNamedValue(L"payload");
    reminderPayload=value.ValueType()==JsonValueType::Object?value.GetObject():JsonObject();
    reminderUpdate();
}
