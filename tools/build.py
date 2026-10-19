import glob, json, os, re, subprocess
from PIL import Image
import rcssmin

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
SITE = 'https://juk-mandioca.vercel.app'
IMG = 'assets/img/'
WIDTHS = (480, 960, 1440)

def webp_variants(path):
    im = Image.open(path)
    im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') else 'RGB')
    base = os.path.splitext(os.path.basename(path))[0]
    out = []
    for w in WIDTHS:
        if w > im.width and out:
            break
        ww = min(w, im.width)
        h = round(im.height * ww / im.width)
        dst = f'{IMG}{base}-{ww}.webp'
        if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(path):
            im.resize((ww, h), Image.LANCZOS).save(dst, 'WEBP', quality=78, method=6)
        out.append((ww, h, dst))
        if ww == im.width:
            break
    if out[-1][0] < im.width and im.width - out[-1][0] >= 48:
        dst = f'{IMG}{base}-{im.width}.webp'
        im.save(dst, 'WEBP', quality=78, method=6)
        out.append((im.width, im.height, dst))
    return out

photos = {}
for p in sorted(glob.glob(IMG + 'lg-*.jpg') + glob.glob(IMG + 'ai-*.jpg')):
    photos[p] = webp_variants(p)

logos = {}
for p in (IMG + 'logo-lgvans.png', IMG + 'logo-lgvans-branco.png'):
    im = Image.open(p).convert('RGBA')
    base = os.path.splitext(os.path.basename(p))[0]
    for w in (300, 600):
        dst = f'{IMG}{base}-{w}.webp'
        im.resize((w, round(im.height * w / im.width)), Image.LANCZOS).save(dst, 'WEBP', quality=86, method=6)
    logos[p] = base

og = IMG + 'og-cover.jpg'
src = Image.open(IMG + 'ai-hero-1.jpg').convert('RGB').resize((1200, 670), Image.LANCZOS).crop((0, 20, 1200, 650))
logo = Image.open(IMG + 'logo-lgvans-branco.png').convert('RGBA')
logo = logo.resize((420, round(logo.height * 420 / logo.width)), Image.LANCZOS)
shade = Image.new('RGBA', src.size, (17, 17, 17, 0))
for x in range(src.width):
    a = int(max(0, 210 - x * 0.35))
    for y in range(0, src.height, 1):
        pass
grad = Image.linear_gradient('L').rotate(90).resize(src.size)
grad = grad.point(lambda v: int(v * 0.85))
dark = Image.new('RGB', src.size, (17, 17, 17))
src = Image.composite(dark, src, grad)
src.paste(logo, (60, 60), logo)
src.save(og, quality=84, optimize=True)

FONTS = [('Barlow', 400, 'barlow-latin-400-normal'), ('Barlow', 500, 'barlow-latin-500-normal'), ('Barlow', 600, 'barlow-latin-600-normal'),
         ('Barlow Condensed', 600, 'barlow-condensed-latin-600-normal'), ('Barlow Condensed', 700, 'barlow-condensed-latin-700-normal'),
         ('Barlow Condensed', 800, 'barlow-condensed-latin-800-normal')]
font_css = ''.join(f"@font-face{{font-family:'{f}';font-style:normal;font-weight:{w};font-display:swap;src:url(../fonts/{n}.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}}" for f, w, n in FONTS)

order = ['tokens.css', 'base.css', 'components.css', 'components/header.css', 'sections.css', 'lgvans.css']
css = font_css + '\n'.join(open('assets/css/' + f).read() for f in order)
css = re.sub(r"url\('https://images\.unsplash\.com[^']*'\)", 'none', css)
def bg_webp(m):
    name = m.group(1)
    v = photos.get(f'{IMG}{name}.jpg')
    if not v:
        return m.group(0)
    small = v[min(1, len(v) - 1)][2].replace(IMG, '../img/')
    big = v[-1][2].replace(IMG, '../img/')
    return f"url('{small}')"
css = re.sub(r"url\('\.\./img/((?:lg|ai)-[\w-]+)\.jpg'\)", bg_webp, css)
open('assets/css/site.min.css', 'w').write(rcssmin.cssmin(css))

subprocess.run(['/tmp/claude-0/node_modules/.bin/esbuild', 'assets/js/main.js', '--bundle', '--minify', '--format=iife',
                '--target=es2018', '--outfile=assets/js/site.min.js', '--log-level=warning'], check=True)

def img_tag(m):
    tag = m.group(0)
    s = re.search(r'src="assets/img/((?:lg|ai)-[a-z0-9-]+?)(?:-\d{3,4})?\.(?:jpg|webp)"', tag)
    if not s:
        return tag
    v = photos.get(f'{IMG}{s.group(1)}.jpg')
    if not v:
        return tag
    hero = 'hs-img' in tag
    know = 'know-frame' in m.string[max(0, m.start() - 60):m.start()]
    sizes = '(max-width: 760px) 100vw, 76vw' if hero else '(max-width: 760px) 92vw, 420px'
    pick = v[-1] if hero else v[min(1, len(v) - 1)]
    srcset = ', '.join(f'{d} {w}w' for w, h, d in v)
    tag = re.sub(r'\s(src|srcset|sizes|width|height)="[^"]*"', '', tag)
    tag = tag.replace('<img', f'<img src="{pick[2]}" srcset="{srcset}" sizes="{sizes}" width="{pick[0]}" height="{pick[1]}"', 1)
    return tag

JSONLD = {
    '@context': 'https://schema.org',
    '@graph': [
        {'@type': 'Organization', '@id': SITE + '/#org', 'name': 'Grupo LGvans do Brasil', 'legalName': 'LG Locação Transporte e Logística Ltda.',
         'taxID': '06.971.892/0001-54', 'url': SITE + '/', 'logo': SITE + '/assets/img/logo-lgvans.png', 'foundingDate': '2004',
         'contactPoint': {'@type': 'ContactPoint', 'telephone': '+55-19-99602-7307', 'contactType': 'sales', 'areaServed': 'BR-SP', 'availableLanguage': 'Portuguese'}},
        {'@type': 'LocalBusiness', '@id': SITE + '/#business', 'name': 'Grupo LGvans do Brasil', 'image': SITE + '/assets/img/og-cover.jpg',
         'url': SITE + '/', 'telephone': '+55-19-99602-7307', 'priceRange': '$$',
         'address': {'@type': 'PostalAddress', 'addressLocality': 'Rio das Pedras', 'addressRegion': 'SP', 'addressCountry': 'BR'},
         'areaServed': [{'@type': 'State', 'name': 'São Paulo'}, {'@type': 'City', 'name': 'Piracicaba'}],
         'openingHoursSpecification': {'@type': 'OpeningHoursSpecification', 'dayOfWeek': ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], 'opens': '07:00', 'closes': '17:00'},
         'parentOrganization': {'@id': SITE + '/#org'},
         'makesOffer': [{'@type': 'Offer', 'itemOffered': {'@type': 'Service', 'name': n}} for n in
                        ['Caminhão dedicado com motorista', 'Fiorino dedicado', 'Van mista dedicada', 'Van carga dedicada', 'Estoque Ativo (armazenagem e entrega)', 'Frete expresso no mesmo dia']]},
        {'@type': 'WebSite', '@id': SITE + '/#site', 'url': SITE + '/', 'name': 'Grupo LGvans do Brasil', 'inLanguage': 'pt-BR', 'publisher': {'@id': SITE + '/#org'}},
    ],
}

FONT_LINKS = re.compile(r'\s*<!-- ─── Fontes.*?</noscript>', re.S)
for page in glob.glob('*.html'):
    h = open(page).read()
    slug = '' if page == 'index.html' else page
    h = FONT_LINKS.sub('', h)
    h = re.sub(r'\s*<link rel="preconnect" href="https://fonts\.g[^>]*>', '', h)
    h = re.sub(r'\s*<link rel="(?:preload|stylesheet)"[^>]*fonts\.googleapis[^>]*>', '', h)
    h = re.sub(r'\s*<!-- ─── Preload: hero.*?-->\s*(<link rel="preload" as="image"[^>]*>)?', '', h, flags=re.S)
    h = re.sub(r'\s*<link rel="preload" as="image"[^>]*>', '', h)
    h = re.sub(r'\s*<link rel="preload" as="font"[^>]*>', '', h)
    h = re.sub(r'\s*<!-- ─── JSON-LD.*?-->', '', h, flags=re.S)
    h = re.sub(r'\s*<script type="application/ld\+json">.*?</script>', '', h, flags=re.S)
    h = re.sub(r'\s*<link rel="canonical"[^>]*>', '', h)
    h = re.sub(r'\s*<meta (?:property="og:(?:url|image)[^"]*"|name="twitter:image")[^>]*>', '', h)
    h = h.replace('href="assets/css/main.css"', 'href="assets/css/site.min.css"')
    h = re.sub(r'<script src="assets/js/(?:main|site\.min)\.js"[^>]*></script>', '<script src="assets/js/site.min.js" defer></script>', h)
    pre = ['<link rel="preload" href="assets/fonts/barlow-condensed-latin-800-normal.woff2" as="font" type="font/woff2" crossorigin />',
           '<link rel="preload" href="assets/fonts/barlow-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin />']
    if page == 'index.html':
        v = photos[IMG + 'ai-hero-1.jpg']
        pre.append(f'<link rel="preload" as="image" href="{v[-1][2]}" imagesrcset="{", ".join(f"{d} {w}w" for w, hh, d in v)}" imagesizes="(max-width: 760px) 100vw, 76vw" fetchpriority="high" />')
    seo = [f'<link rel="canonical" href="{SITE}/{slug}" />', f'<meta property="og:url" content="{SITE}/{slug}" />',
           f'<meta property="og:image" content="{SITE}/assets/img/og-cover.jpg" />', '<meta property="og:image:width" content="1200" />',
           '<meta property="og:image:height" content="630" />', f'<meta name="twitter:image" content="{SITE}/assets/img/og-cover.jpg" />']
    if page == 'briefing.html':
        seo = []
    block = '\n    ' + '\n    '.join(pre + seo)
    if page == 'index.html':
        block += '\n    <script type="application/ld+json">' + json.dumps(JSONLD, ensure_ascii=False) + '</script>'
    h = h.replace('<link rel="stylesheet" href="assets/css/site.min.css" />', '<link rel="stylesheet" href="assets/css/site.min.css" />' + block, 1)
    h = re.sub(r'<link rel="icon"[^>]*>', '<link rel="icon" type="image/png" href="assets/img/favicon.png" />\n    <link rel="apple-touch-icon" href="assets/img/icon-192.png" />', h, count=1)
    h = re.sub(r'\n\s*<link rel="apple-touch-icon"[^>]*>(?=\n\s*<link rel="apple-touch-icon")', '', h)
    h = re.sub(r'<img [^>]*>', img_tag, h)
    for p, base in logos.items():
        h = re.sub(rf'<img src="(?:{re.escape(p)}|{IMG}{base}-\d+\.webp)"([^>]*?)(?: srcset="[^"]*")?( alt=)', rf'<img src="{IMG}{base}-300.webp" srcset="{IMG}{base}-300.webp 300w, {IMG}{base}-600.webp 600w" sizes="150px"\1\2', h)
    h = re.sub(r'(<img src="assets/img/logo-lgvans-branco-300\.webp"[^>]*?)width="600" height="266"', r'\1width="300" height="133"', h)
    first = True
    def hero_attr(m):
        global first
        t = m.group(0)
        t = re.sub(r'\s(?:loading|fetchpriority|decoding)="[^"]*"', '', t)
        t = t.replace('<img', '<img fetchpriority="high"' if first else '<img loading="lazy" decoding="async"', 1)
        first = False
        return t
    first = True
    h = re.sub(r'<img class="hs-img"[^>]*>|<img [^>]*class="hs-img"[^>]*>', hero_attr, h)
    h = re.sub(r'<h1 class="hs-title">(.*?)</h1>', r'<p class="hs-title">\1</p>', h)
    h = h.replace('<p class="hs-title">', '<h1 class="hs-title">', 1).replace('</p>\n              <a href="#servicos"', '</h1>\n              <a href="#servicos"', 1) if page == 'index.html' else h
    open(page, 'w').write(h)

print('ok', len(photos), 'photos')
