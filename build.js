// Builds the site into /dist for Netlify.
// - Copies the static site (index.html, images, CNAME)
// - Turns every Markdown file in /posts into /writing/<slug>/index.html
// - Builds /writing/ (article list) and /feed.xml (RSS)
// - Refreshes the latest articles inside the Writing section of index.html
//
// Files in /posts whose names start with "_" are ignored, and so is any post with "draft: true".

const fs = require('fs');
const path = require('path');
const { marked } = require('marked');

const SITE = {
  url: 'https://estherlindanigiwan.com',
  title: 'Esther Linda Nigiwan: Writing',
  author: 'Esther Linda Nigiwan',
  role: 'COO, Vult SL',
  description:
    'Practitioner notes on African fintech: market entry, partnerships, regulation, distribution and building teams that scale.',
  newsletter: 'https://www.linkedin.com/newsletters/africa-fintech-insider-7473355297621745665',
  bio:
    'I help fintechs scale sustainably across Africa by combining commercial strategy, regulatory insight, partnership development, and strong leadership. Through my experience leading market expansion and building high-performing teams, I share practical lessons for founders, executives, and the next generation of fintech leaders.',
};

const ROOT = __dirname;
const OUT = path.join(ROOT, 'dist');
const POSTS_DIR = path.join(ROOT, 'posts');
const STATIC = ['index.html', 'CNAME', 'writing.css', 'favicon.ico'];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// ---------- helpers ----------
const esc = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cdata = (s = '') => '<![CDATA[' + String(s).replace(/]]>/g, ']]]]><![CDATA[>') + ']]>';
const monthYear = (d) => `${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
const longDate = (d) => `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;

function parseFrontMatter(raw, file) {
  const m = raw.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/);
  if (!m) throw new Error(`${file}: missing the --- front matter block at the top`);
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i === -1 || !line.trim()) continue;
    data[line.slice(0, i).trim().toLowerCase()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return { data, body: m[2].trim() };
}

function loadPosts() {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const posts = [];
  for (const file of fs.readdirSync(POSTS_DIR)) {
    if (!file.endsWith('.md') || file.startsWith('_')) continue;
    const { data, body } = parseFrontMatter(fs.readFileSync(path.join(POSTS_DIR, file), 'utf8'), file);
    if (String(data.draft).toLowerCase() === 'true') continue;
    if (!data.title) throw new Error(`${file}: "title" is required`);
    const date = new Date((data.date || '') + 'T09:00:00Z');
    if (isNaN(date)) throw new Error(`${file}: "date" must look like 2026-11-10`);
    const slug = (data.slug || file.replace(/\.md$/, '').replace(/^\d{4}-\d{2}(-\d{2})?-/, ''))
      .toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-+|-+$/g, '');
    const html = body ? marked.parse(body) : '';
    const words = body.split(/\s+/).filter(Boolean).length;
    posts.push({
      ...data,
      slug,
      date,
      html,
      tags: (data.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
      minutes: Math.max(1, Math.round(words / 230)),
      external: data.external || '',
      url: data.external || `${SITE.url}/writing/${slug}/`,
      localUrl: data.external || `/writing/${slug}/`,
    });
  }
  return posts.sort((a, b) => b.date - a.date);
}

// ---------- page shell ----------
function shell({ title, description, canonical, ogType = 'website', body }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}"/>
<link rel="canonical" href="${esc(canonical)}"/>
<meta property="og:type" content="${ogType}"/>
<meta property="og:title" content="${esc(title)}"/>
<meta property="og:description" content="${esc(description)}"/>
<meta property="og:url" content="${esc(canonical)}"/>
<meta property="og:image" content="${SITE.url}/hero.jpeg"/>
<meta name="twitter:card" content="summary_large_image"/>
<meta name="author" content="${esc(SITE.author)}"/>
<link rel="alternate" type="application/rss+xml" title="${esc(SITE.title)}" href="/feed.xml"/>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>
<link rel="stylesheet" href="/writing.css"/>
</head>
<body>
<nav><div class="nav-inner">
<a href="/" class="nav-logo">Esther Linda Nigiwan <span>· ${esc(SITE.role)}</span></a>
<div class="nav-links"><a href="/#services">Services</a><a href="/#work">Track Record</a><a href="/writing/">Writing</a><a href="/#contact">Contact</a></div>
<a href="/#contact" class="nav-cta">Book an Intro Call</a>
</div></nav>
<main>
${body}
</main>
<footer>
<div class="fi">
<div class="fl">Esther Linda Nigiwan · ${esc(SITE.role)}</div>
<div class="flinks"><a href="https://www.linkedin.com/in/estherlindanigiwan/" target="_blank" rel="noopener">LinkedIn</a><a href="https://medium.com/@estherlindanigiwan" target="_blank" rel="noopener">Medium</a><a href="/writing/">Writing</a><a href="/feed.xml">RSS</a></div>
</div>
<div class="fcopy">© ${new Date().getUTCFullYear()} Esther Linda Nigiwan · African Fintech Executive &amp; Operator</div>
</footer>
</body>
</html>
`;
}

const subscribeCard = () => `<a class="sub-card" href="${SITE.newsletter}" target="_blank" rel="noopener">
<div class="sub-in">in</div>
<div><div class="sub-t">Africa Fintech Insider</div><div class="sub-s">Subscribe on LinkedIn for new articles on African fintech, market expansion and digital finance.</div></div>
<div class="sub-arrow">→</div>
</a>`;

function listRow(p, i) {
  const ext = p.external ? ' target="_blank" rel="noopener"' : '';
  const meta = [...p.tags, monthYear(p.date)].join(' · ') + (p.external ? ' · on Medium' : ` · ${p.minutes} min read`);
  return `<a href="${esc(p.localUrl)}" class="letter-row"${ext}>
<div class="ln">${String(i + 1).padStart(2, '0')}</div>
<div><div class="lt">${esc(p.title)}</div><div class="ls">${esc(meta)}</div>${p.summary ? `<div class="lsum">${esc(p.summary)}</div>` : ''}</div>
<div class="larrow">→</div>
</a>`;
}

// ---------- pages ----------
function postPage(p) {
  const also = [
    p.linkedin && `<a href="${esc(p.linkedin)}" target="_blank" rel="noopener">LinkedIn</a>`,
    p.medium && `<a href="${esc(p.medium)}" target="_blank" rel="noopener">Medium</a>`,
  ].filter(Boolean);
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article', headline: p.title,
    datePublished: p.date.toISOString(), author: { '@type': 'Person', name: SITE.author, url: SITE.url },
    mainEntityOfPage: p.url, image: `${SITE.url}/hero.jpeg`, description: p.summary || '',
  };
  const body = `<article class="post">
<a href="/writing/" class="back">← All writing</a>
<div class="post-meta">${esc(p.tags.join(' · '))}</div>
<h1>${esc(p.title)}</h1>
${p.summary ? `<p class="post-dek">${esc(p.summary)}</p>` : ''}
<div class="byline"><img src="/hero.jpeg" alt="Esther Linda Nigiwan"/><div><div class="by-name">Esther Linda Nigiwan</div><div class="by-sub">${esc(longDate(p.date))} · ${p.minutes} min read</div></div></div>
<div class="prose">
${p.html}
</div>
${also.length ? `<p class="also">Also published on ${also.join(' and ')}.</p>` : ''}
<div class="author-box">
<img src="/hero.jpeg" alt="Esther Linda Nigiwan"/>
<div><div class="ab-name">Esther Linda Nigiwan · ${esc(SITE.role)}</div><p><em>${esc(SITE.bio)}</em></p><a href="/" class="ab-link">estherlindanigiwan.com →</a></div>
</div>
${subscribeCard()}
</article>
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`;
  return shell({
    title: `${p.title} | Esther Linda Nigiwan`,
    description: p.summary || SITE.description,
    canonical: p.url,
    ogType: 'article',
    body,
  });
}

function indexPage(posts) {
  const body = `<section class="writing-head">
<p class="section-label">Writing</p>
<h1 class="sh">Thoughts on fintech, Africa, and building with purpose.</h1>
<p class="writing-intro">${esc(SITE.description)} Every article is published here first, then shared on LinkedIn and Medium.</p>
${subscribeCard()}
<p class="rss-note">Prefer a feed reader? <a href="/feed.xml">Follow the RSS feed</a>.</p>
</section>
<section class="writing-list">
${posts.length ? posts.map(listRow).join('\n') : '<p class="writing-intro">New articles are on the way.</p>'}
</section>`;
  return shell({ title: SITE.title, description: SITE.description, canonical: `${SITE.url}/writing/`, body });
}

function feed(posts) {
  const items = posts.slice(0, 30).map((p) => `  <item>
    <title>${esc(p.title)}</title>
    <link>${esc(p.url)}</link>
    <guid isPermaLink="true">${esc(p.url)}</guid>
    <pubDate>${p.date.toUTCString()}</pubDate>
    <dc:creator>${esc(SITE.author)}</dc:creator>
${p.tags.map((t) => `    <category>${esc(t)}</category>`).join('\n')}
    <description>${esc(p.summary || '')}</description>
${p.html ? `    <content:encoded>${cdata(p.html + `<p><em>${SITE.bio}</em></p><p>Originally published at <a href="${p.url}">estherlindanigiwan.com</a>.</p>`)}</content:encoded>` : ''}
  </item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>${esc(SITE.title)}</title>
  <link>${SITE.url}/writing/</link>
  <atom:link href="${SITE.url}/feed.xml" rel="self" type="application/rss+xml"/>
  <description>${esc(SITE.description)}</description>
  <language>en</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
</channel>
</rss>
`;
}

// ---------- build ----------
function build() {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });

  for (const f of fs.readdirSync(ROOT)) {
    if (STATIC.includes(f) || /\.(jpe?g|png|webp|gif|svg|pdf)$/i.test(f)) {
      fs.copyFileSync(path.join(ROOT, f), path.join(OUT, f));
    }
  }

  const posts = loadPosts();

  // Latest 3 on the homepage
  const homePath = path.join(OUT, 'index.html');
  const home = fs.readFileSync(homePath, 'utf8');
  const re = /(<!-- WRITING:START[^>]*-->)[\s\S]*?(<!-- WRITING:END -->)/;
  if (!re.test(home)) throw new Error('index.html: WRITING:START / WRITING:END markers not found');
  fs.writeFileSync(homePath, home.replace(re, `$1\n<div>\n${posts.slice(0, 3).map(listRow).join('\n')}\n</div>\n$2`));

  fs.mkdirSync(path.join(OUT, 'writing'), { recursive: true });
  fs.writeFileSync(path.join(OUT, 'writing', 'index.html'), indexPage(posts));
  for (const p of posts.filter((p) => !p.external)) {
    const dir = path.join(OUT, 'writing', p.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), postPage(p));
  }
  fs.writeFileSync(path.join(OUT, 'feed.xml'), feed(posts));

  console.log(`Built ${posts.length} post(s): ${posts.map((p) => p.slug).join(', ') || 'none'}`);
}

build();
