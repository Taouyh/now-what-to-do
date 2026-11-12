"""Read-only exact-candidate verification; run from isolated repository root."""
import pathlib, zipfile, hashlib, json, subprocess, os, xml.etree.ElementTree as ET
root=pathlib.Path.cwd()
out=root/os.environ.get('NOWWHAT_TEST_OUTPUT','test-artifacts/native-143')
base=pathlib.Path(os.environ.get('NOWWHAT_CANDIDATE_DIR','D:/code/now-what-to-do/dist/native-review-1.4.3-2026-11-12'))
apk=base/'android/Now-What-1.4.3-Android.apk'
sdk=pathlib.Path('D:/code/now-what-to-do/.cache/android-sdk/build-tools/35.0.0')
sha=lambda b:hashlib.sha256(b).hexdigest()
norm=lambda b:b.replace(b'\r\n',b'\n')
web={p.relative_to(root/'dist/web').as_posix():p.read_bytes() for p in (root/'dist/web').rglob('*') if p.is_file()}
results={}
def compare(label,actual,bridge):
    expected=dict(web)
    expected['index.html']=expected['index.html'].replace(b'<!-- native-bridge -->',bridge)
    if 'native-android.js' in actual:expected['native-android.js']=(root/'android/native-android.js').read_bytes()
    assert set(actual)==set(expected),(label,'paths',set(actual)^set(expected))
    byte_equal=[];normalized=[]
    for name,value in expected.items():
        if actual[name]==value:byte_equal.append(name)
        elif name=='manifest.json':
            a=json.loads(actual[name]);b=json.loads(value)
            assert [x['path'] for x in a]==[x['path'] for x in b]
            for x in a:
                # Native packaging intentionally injects its bridge after manifest generation.
                if x['path']!='index.html':assert x['bytes']==len(actual[x['path']])
            normalized.append(name+': same paths, text-size differences')
        else:
            assert norm(actual[name])==norm(value),(label,name,sha(actual[name]),sha(value))
            normalized.append(name+': CRLF/LF only')
    results[label]={'files':len(actual),'byteIdentical':len(byte_equal),'normalized':normalized,'appJsSHA256':sha(actual['app.js'])}
with zipfile.ZipFile(apk) as z:
    names=z.namelist()
    assert len(names)==len(set(names))
    assert all('\\' not in n and not n.startswith('/') and '..' not in n.split('/') for n in names)
    compare('apkAssets',{n[7:]:z.read(n) for n in names if n.startswith('assets/') and not n.endswith('/')},b'<script src="native-android.js"></script>')
    results['apkZip']={'entries':len(names),'pathsSafe':True}
    icons=[]
    for p in (root/'android/res').rglob('*.xml'):
        if 'app_icon' not in p.name and p.name!='ic_stat_nowwhat.xml':continue
        entry='res/'+p.relative_to(root/'android/res').as_posix()
        assert entry in names
        tree=subprocess.check_output([str(sdk/'aapt2.exe'),'dump','xmltree',str(apk),'--file',entry],text=True,encoding='utf-8')
        (out/(p.parent.name+'-'+p.name+'.txt')).write_text(tree,encoding='utf-8')
        for el in ET.parse(p).iter():
            path=el.attrib.get('{http://schemas.android.com/apk/res/android}pathData')
            if path:assert path in tree,(entry,'path geometry')
        icons.append(entry)
    results['androidIcons']={'compiledXmls':icons,'allSourcePathGeometryMatched':True}
payload=base/'windows/webview2-unpacked/web'
compare('windowsWeb',{p.relative_to(payload).as_posix():p.read_bytes() for p in payload.rglob('*') if p.is_file()},b'<!-- native-bridge -->')
results['artifacts']={str(p):{'bytes':p.stat().st_size,'sha256':sha(p.read_bytes())} for p in [apk,base/'windows/Now-What-1.4.3-Windows-x64-Setup.exe']}
(out/'package-comparison.json').write_text(json.dumps(results,indent=2),encoding='utf-8')
print(json.dumps(results,indent=2))
