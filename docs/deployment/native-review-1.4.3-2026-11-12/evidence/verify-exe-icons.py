import ctypes as C, pathlib, struct, json, hashlib, os
root=pathlib.Path.cwd();base=pathlib.Path(os.environ.get('NOWWHAT_CANDIDATE_DIR','D:/code/now-what-to-do/dist/native-review-1.4.3-2026-11-12'))/'windows'
ico=(root/'packaging/icon.ico').read_bytes();entries=[]
for i in range(struct.unpack_from('<H',ico,4)[0]):
    w,h,_,_,_,_,size,offset=struct.unpack_from('<BBBBHHII',ico,6+i*16);entries.append((w or 256,h or 256,ico[offset:offset+size]))
k=C.WinDLL('kernel32',use_last_error=True)
k.LoadLibraryExW.argtypes=[C.c_wchar_p,C.c_void_p,C.c_uint];k.LoadLibraryExW.restype=C.c_void_p
k.FindResourceW.argtypes=[C.c_void_p,C.c_void_p,C.c_void_p];k.FindResourceW.restype=C.c_void_p
k.LoadResource.argtypes=[C.c_void_p,C.c_void_p];k.LoadResource.restype=C.c_void_p
k.SizeofResource.argtypes=[C.c_void_p,C.c_void_p];k.SizeofResource.restype=C.c_uint
k.LockResource.argtypes=[C.c_void_p];k.LockResource.restype=C.c_void_p
callback=C.WINFUNCTYPE(C.c_int,C.c_void_p,C.c_void_p,C.c_void_p,C.c_void_p)
k.EnumResourceNamesW.argtypes=[C.c_void_p,C.c_void_p,callback,C.c_void_p];k.EnumResourceNamesW.restype=C.c_int
k.FreeLibrary.argtypes=[C.c_void_p]
result=[]
for exe in [base/'webview2-unpacked/Now What.exe',base/'Now-What-1.4.3-Windows-x64-Setup.exe']:
    handle=k.LoadLibraryExW(str(exe),None,2|32);assert handle
    blobs=[]
    @callback
    def collect(module,kind,name,param):
        res=k.FindResourceW(module,name,kind);data=k.LoadResource(module,res);blobs.append(C.string_at(k.LockResource(data),k.SizeofResource(module,res)));return 1
    assert k.EnumResourceNamesW(handle,3,collect,None)
    matched=[w for w,h,data in entries if data in blobs]
    # NSIS may transcode selected ICO entries to DIB; report rather than misclaim.
    result.append({'file':str(exe),'iconResources':len(blobs),'exactPngSizes':matched,'expectedPngSizes':[x[0] for x in entries]})
    if exe.name=='Now What.exe':assert len(matched)==len(entries)
    k.FreeLibrary(handle)
(root/os.environ.get('NOWWHAT_TEST_OUTPUT','test-artifacts/native-143')/'exe-icons.json').write_text(json.dumps(result,indent=2))
print(json.dumps(result,indent=2))
