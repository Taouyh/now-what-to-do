Unicode true
!include "MUI2.nsh"
!include "LogicLib.nsh"
Name "Now What"
OutFile "${OUTPUT}"
InstallDir "$LOCALAPPDATA\Programs\NowWhat-WebView2"
InstallDirRegKey HKCU "Software\NowWhat-WebView2" "InstallDir"
RequestExecutionLevel user
!define MUI_ICON "${ROOT}\packaging\icon.ico"
!define MUI_UNICON "${ROOT}\packaging\icon.ico"
!define MUI_ABORTWARNING
!define MUI_FINISHPAGE_RUN "$INSTDIR\Now What.exe"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "English"
!insertmacro MUI_LANGUAGE "SimpChinese"
!insertmacro MUI_LANGUAGE "Japanese"
VIProductVersion "${VERSION}.0"
VIAddVersionKey /LANG=1033 "ProductName" "Now What"
VIAddVersionKey /LANG=1033 "FileDescription" "Now What WebView2 installer"
VIAddVersionKey /LANG=1033 "FileVersion" "${VERSION}"
VIAddVersionKey /LANG=1033 "LegalCopyright" "MIT License - Taouyh"
Section "Now What"
  ReadEnvStr $9 "NOWWHAT_INSTALL_TEST"
  SetOutPath "$INSTDIR"
  File "${PAYLOAD}\Now What.exe"
  File "${PAYLOAD}\native-webview2.js"
  File "${PAYLOAD}\LICENSE-WebView2.txt"
  File "${PAYLOAD}\NOTICE-WebView2.txt"
  File "${ROOT}\LICENSE"
  SetOutPath "$INSTDIR\web"
  File "${PAYLOAD}\web\*"
  SetOutPath "$INSTDIR"
  ExecWait '"$INSTDIR\Now What.exe" --check-runtime' $0
  ${If} $0 != 0
    InitPluginsDir
    File /oname=$PLUGINSDIR\WebView2Setup.exe "${BOOTSTRAP}"
    ExecWait '"$PLUGINSDIR\WebView2Setup.exe" /silent /install' $0
    ExecWait '"$INSTDIR\Now What.exe" --check-runtime' $0
    ${If} $0 != 0
      MessageBox MB_OK|MB_ICONSTOP "Microsoft Edge WebView2 Runtime is required. Connect to the internet, install the runtime, and run setup again."
      Abort
    ${EndIf}
  ${EndIf}
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  ${If} $9 != "1"
  WriteRegStr HKCU "Software\NowWhat-WebView2" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\NowWhat-WebView2" "DisplayName" "Now What (WebView2)"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\NowWhat-WebView2" "DisplayVersion" "${VERSION}"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\NowWhat-WebView2" "Publisher" "Taouyh"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\NowWhat-WebView2" "UninstallString" '"$INSTDIR\Uninstall.exe"'
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\NowWhat-WebView2" "DisplayIcon" "$INSTDIR\Now What.exe"
  CreateShortcut "$DESKTOP\Now What.lnk" "$INSTDIR\Now What.exe"
  CreateShortcut "$SMPROGRAMS\Now What.lnk" "$INSTDIR\Now What.exe"
  ${EndIf}
SectionEnd
Section "Uninstall"
  ReadEnvStr $9 "NOWWHAT_INSTALL_TEST"
  ; Delete only owned files. Never recursively remove a user-selected directory or their profile.
  Delete "$INSTDIR\web\index.html"
  Delete "$INSTDIR\web\app.js"
  Delete "$INSTDIR\web\i18n.js"
  Delete "$INSTDIR\web\style.css"
  RMDir "$INSTDIR\web"
  Delete "$INSTDIR\Now What.exe"
  Delete "$INSTDIR\native-webview2.js"
  Delete "$INSTDIR\LICENSE-WebView2.txt"
  Delete "$INSTDIR\NOTICE-WebView2.txt"
  Delete "$INSTDIR\LICENSE"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"
  ${If} $9 != "1"
  Delete "$DESKTOP\Now What.lnk"
  Delete "$SMPROGRAMS\Now What.lnk"
  DeleteRegKey HKCU "Software\NowWhat-WebView2"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\NowWhat-WebView2"
  ${EndIf}
SectionEnd
