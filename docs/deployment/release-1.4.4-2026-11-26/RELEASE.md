# Now What 1.4.4

The Windows x64 installer brings the updated desktop book interface to Windows. Enter 5–180 minutes, select focus conditions, and click the note below a recommendation to edit the next step. Android build 11 packages the current mobile app and uses the same signing certificate as build 10.

The [introduction page](https://taouyh.github.io/now-what-to-do/about/) shows the current web home and journal with English, Simplified Chinese and Japanese screenshots. [Download version 1.4.4](https://github.com/Taouyh/now-what-to-do/releases/tag/v1.4.4).

Before updating, export a backup in Settings. Install over the existing 1.4.x app to keep its data. Windows uses WebView2. Android requires 7.0 or later.

## Verification

- Type checking and all 153 core tests passed.
- Installed the Windows package in an isolated directory and compared every web payload file with the production build. The installed native host opened, exported data, and restored a paused session after restart. Finishing recovery created one completion record.
- Verified the Android package ID, version code 11, ZIP alignment, v2/v3 signatures, web assets and native bridge. The certificate SHA-256 matches build 10. Physical Android device and in-place upgrade tests remain pending.
- On desktop and mobile browser widths, switching among all three languages loaded both matching screenshots and the updated feature copy without horizontal overflow.

The release includes SHA256SUMS.txt. The previous [1.4.3 release](https://github.com/Taouyh/now-what-to-do/releases/tag/v1.4.3) is available for reference. For Android upgrade issues, retain the device data and apply a corrected higher build. The site can be restored with a revert commit.
