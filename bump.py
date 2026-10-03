# 公開前に実行：バージョンを今日の日付＋連番に上げ、app.js / sw.js / version.json をそろえる
import datetime, json, pathlib, re

root = pathlib.Path(__file__).parent
today = datetime.date.today().strftime('%Y.%m.%d')
cur = json.loads((root / 'version.json').read_text(encoding='utf-8'))['v']
n = int(cur.rsplit('-', 1)[1]) + 1 if cur.startswith(today) else 1
v = f'{today}-{n}'
(root / 'version.json').write_text(json.dumps({'v': v}) + '\n', encoding='utf-8')
for f, pat, rep in [('app.js', r"const APP_VERSION = '[^']*';", f"const APP_VERSION = '{v}';"),
                    ('sw.js', r"const V = 'gymlog-[^']*';", f"const V = 'gymlog-{v}';")]:
    p = root / f
    s, k = re.subn(pat, rep, p.read_text(encoding='utf-8'))
    assert k == 1, f
    p.write_text(s, encoding='utf-8')
print(v)
