import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  readdirSync,
  existsSync,
  unlinkSync
} from 'fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const PKG_VERSION = pkg.version

// --- Retention Config (days) ---
const RETENTION_DAYS = 30

const {
  SONAR_METRICS,
  JIRA_TICKETS,
  CHECKOV_OUTCOME,
  CHECKOV_RESULTS_FILE,
  NPM_AUDIT_FILE,
  VERSION,
  RUN_URL,
  BRANCH,
  REPO,
  PREV_SHA
} = process.env

const SHORT_SHA = VERSION?.slice(0, 7) ?? 'unknown'
const BUILD_DATE = new Date().toUTCString().replace(/:\d\d GMT/, ' UTC')

// --- Sonar ---
let sonar = {}
try {
  const data = JSON.parse(SONAR_METRICS ?? '{}')
  ;(data.component?.measures ?? []).forEach((m) => {
    sonar[m.metric] = m.value
  })
} catch {}

// --- npm audit ---
let auditVulns = []
try {
  const audit = JSON.parse(readFileSync(NPM_AUDIT_FILE, 'utf8'))
  // npm audit --json v2 schema: vulnerabilities is a map keyed by package name
  auditVulns = Object.values(audit.vulnerabilities ?? {})
    .filter(
      (v) => v.isDirect || v.severity === 'critical' || v.severity === 'high'
    )
    .map((v) => ({
      name: v.name,
      severity: v.severity,
      via: [v.via ?? []]
        .flat()
        .filter((x) => typeof x === 'object')
        .map((x) => x.title ?? x.url ?? '')
        .filter(Boolean)
        .join(', '),
      cves: [v.via ?? []]
        .flat()
        .filter((x) => typeof x === 'object')
        .flatMap((x) => x.cves ?? [])
        .join(', '),
      fixAvailable:
        v.fixAvailable === true
          ? '✓ Fix available'
          : v.fixAvailable?.name
            ? `Update to ${v.fixAvailable.name}@${v.fixAvailable.version}`
            : '✗ No fix',
      range: v.range ?? ''
    }))
} catch {}

// --- Checkov ---
let checkovFailures = []
try {
  const raw = readFileSync(CHECKOV_RESULTS_FILE, 'utf8')
  // Checkov JSON can be an array (one entry per framework) or a single object
  const results = JSON.parse(raw)
  const checks = [results].flat().flatMap((r) => r.results?.failed_checks ?? [])
  checkovFailures = checks.map((c) => ({
    checkId: c.check_id,
    checkName: c.check_id
      ? `<a href="https://docs.bridgecrew.io/docs/${c.check_id.toLowerCase()}" target="_blank">${c.check_id}</a>`
      : '',
    resource: c.resource ?? '',
    file: c.repo_file_path ?? c.file_path ?? '',
    line: c.file_line_range
      ? `L${c.file_line_range[0]}–${c.file_line_range[1]}`
      : '',
    guideline: c.guideline ?? ''
  }))
} catch {}

const commits = JSON.parse(readFileSync('commits.json', 'utf8'))
const jiraTickets = (JIRA_TICKETS ?? '').split(',').filter(Boolean)
const checkovPassed = CHECKOV_OUTCOME === 'success'

const ratingLabel = (r) =>
  ({ 1: 'A', 2: 'B', 3: 'C', 4: 'D', 5: 'E' })[r] ?? r ?? 'N/A'
const ratingClass = (r) =>
  ({
    1: 'rating-a',
    2: 'rating-b',
    3: 'rating-c',
    4: 'rating-d',
    5: 'rating-e'
  })[r] ?? ''
const metricVal = (k, suffix = '') =>
  sonar[k] != null ? sonar[k] + suffix : 'N/A'

const severityClass = (s) =>
  ({
    critical: 'sev-critical',
    high: 'sev-high',
    moderate: 'sev-moderate',
    low: 'sev-low'
  })[s] ?? ''

const CSS = `
  :root { --green:#2ea44f; --red:#d73a49; --orange:#e36209; --blue:#0366d6; --grey:#6a737d; }
  * { box-sizing:border-box; margin:0; padding:0; }
  body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; background:#f6f8fa; color:#24292e; }
  header { background:#24292e; color:#fff; padding:20px 40px; display:flex; align-items:center; gap:16px; }
  header h1 { font-size:1.4rem; }
  .version-badge { background:#2ea44f; padding:4px 10px; border-radius:20px; font-size:.85rem; font-weight:600; }
  main { max-width:1100px; margin:32px auto; padding:0 24px; }
  .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(280px,1fr)); gap:20px; margin-bottom:28px; }
  .card { background:#fff; border:1px solid #e1e4e8; border-radius:8px; padding:20px; }
  .card h2 { font-size:.9rem; text-transform:uppercase; letter-spacing:.05em; color:var(--grey); margin-bottom:14px; }
  .metric-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #f0f0f0; font-size:.9rem; }
  .metric-row:last-child { border-bottom:none; }
  .metric-val { font-weight:600; }
  .rating-a { color:var(--green); } .rating-b { color:#6cc644; } .rating-c { color:var(--orange); }
  .rating-d { color:#e05d44; } .rating-e { color:var(--red); }
  .badge { display:inline-block; padding:3px 10px; border-radius:20px; font-size:.8rem; font-weight:600; text-decoration:none; margin:2px; }
  .badge-jira { background:#0052cc; color:#fff; }
  .badge-pass { background:#e6f4ea; color:var(--green); border:1px solid var(--green); }
  .badge-fail { background:#ffeef0; color:var(--red); border:1px solid var(--red); }
  .badge-info { background:#f1f8ff; color:var(--blue); border:1px solid #c8e1ff; }
  .sev-critical { background:#6e0000; color:#fff; padding:2px 8px; border-radius:4px; font-size:.75rem; font-weight:700; }
  .sev-high { background:#d73a49; color:#fff; padding:2px 8px; border-radius:4px; font-size:.75rem; font-weight:700; }
  .sev-moderate { background:#e36209; color:#fff; padding:2px 8px; border-radius:4px; font-size:.75rem; font-weight:700; }
  .sev-low { background:#6a737d; color:#fff; padding:2px 8px; border-radius:4px; font-size:.75rem; font-weight:700; }
  table { width:100%; border-collapse:collapse; font-size:.875rem; }
  th { background:#f6f8fa; text-align:left; padding:8px 12px; border-bottom:2px solid #e1e4e8; font-size:.8rem; text-transform:uppercase; color:var(--grey); }
  td { padding:8px 12px; border-bottom:1px solid #f0f0f0; vertical-align:top; }
  tr:last-child td { border-bottom:none; }
  a { color:var(--blue); text-decoration:none; } a:hover { text-decoration:underline; }
  .na { color:var(--grey); font-style:italic; font-size:.875rem; }
  .section-title { font-size:1rem; font-weight:600; margin:28px 0 12px; }
  footer { text-align:center; padding:24px; color:var(--grey); font-size:.8rem; border-top:1px solid #e1e4e8; margin-top:40px; }
`

const jiraHtml = jiraTickets.length
  ? jiraTickets
      .map(
        (t) =>
          `<a href="https://govukverify.atlassian.net/browse/${t}" target="_blank" class="badge badge-jira">${t}</a>`
      )
      .join(' ')
  : '<span class="na">No JIRA tickets found in commits</span>'

const commitsHtml = commits.length
  ? commits
      .map(
        (c) => `
      <tr>
        <td><code><a href="https://github.com/${REPO}/commit/${c.hash}" target="_blank">${c.hash}</a></code></td>
        <td>${c.subject?.replace(/</g, '&lt;') ?? ''}</td>
        <td>${c.author ?? ''}</td>
        <td>${c.date ?? ''}</td>
      </tr>`
      )
      .join('')
  : '<tr><td colspan="4">No commits found</td></tr>'

const auditHtml = auditVulns.length
  ? auditVulns
      .map(
        (v) => `
      <tr>
        <td><strong>${v.name}</strong>${v.range ? `<br><span style="color:var(--grey);font-size:.8rem">${v.range}</span>` : ''}</td>
        <td><span class="${severityClass(v.severity)}">${v.severity}</span></td>
        <td>${v.cves || '<span class="na">—</span>'}</td>
        <td>${v.via || '<span class="na">—</span>'}</td>
        <td style="font-size:.8rem">${v.fixAvailable}</td>
      </tr>`
      )
      .join('')
  : '<tr><td colspan="5"><span class="na">No vulnerabilities found</span></td></tr>'

const checkovHtml = checkovFailures.length
  ? checkovFailures
      .map(
        (c) => `
      <tr>
        <td>${c.checkName}</td>
        <td>${c.resource}</td>
        <td style="font-size:.8rem">${c.file}${c.line ? ` <span style="color:var(--grey)">${c.line}</span>` : ''}</td>
      </tr>`
      )
      .join('')
  : '<tr><td colspan="3"><span class="na">No failed checks</span></td></tr>'

const prevShaShort = PREV_SHA?.slice(0, 7) ?? 'initial'

const releaseHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="release-sha" content="${VERSION}">
  <title>Release Notes - TxMA Audit v${PKG_VERSION}</title>
  <style>${CSS}</style>
</head>
<body>
  <header>
    <div>
      <h1>TxMA Audit — Release Notes</h1>
      <div style="margin-top:6px;font-size:.85rem;color:#aaa;">
        Built on ${BUILD_DATE} &nbsp;|&nbsp;
        Branch: <strong style="color:#fff">${BRANCH}</strong> &nbsp;|&nbsp;
        Commit: <a href="https://github.com/${REPO}/commit/${VERSION}" style="color:#58a6ff">${SHORT_SHA}</a>
        &nbsp;|&nbsp; <a href="index.html" style="color:#58a6ff">← All releases</a>
      </div>
    </div>
    <span class="version-badge">v${PKG_VERSION}</span>
  </header>

  <main>
    <div class="grid">
      <div class="card">
        <h2>📦 Release Info</h2>
        <div class="metric-row"><span>Package version</span><span class="metric-val">${PKG_VERSION}</span></div>
        <div class="metric-row"><span>Commit SHA</span><span class="metric-val"><a href="https://github.com/${REPO}/commit/${VERSION}">${SHORT_SHA}</a></span></div>
        <div class="metric-row"><span>Branch</span><span class="metric-val">${BRANCH}</span></div>
        <div class="metric-row"><span>Build date</span><span class="metric-val">${BUILD_DATE}</span></div>
        <div class="metric-row"><span>CI run</span><span class="metric-val"><a href="${RUN_URL}" target="_blank">View run ↗</a></span></div>
      </div>

      <div class="card">
        <h2>🔬 SonarCloud Quality</h2>
        <div class="metric-row"><span>Coverage</span><span class="metric-val">${metricVal('coverage', '%')}</span></div>
        <div class="metric-row"><span>Bugs</span><span class="metric-val">${metricVal('bugs')}</span></div>
        <div class="metric-row"><span>Vulnerabilities</span><span class="metric-val">${metricVal('vulnerabilities')}</span></div>
        <div class="metric-row"><span>Security hotspots</span><span class="metric-val">${metricVal('security_hotspots')}</span></div>
        <div class="metric-row"><span>Code smells</span><span class="metric-val">${metricVal('code_smells')}</span></div>
        <div class="metric-row"><span>Duplication</span><span class="metric-val">${metricVal('duplicated_lines_density', '%')}</span></div>
      </div>

      <div class="card">
        <h2>⭐ SonarCloud Ratings</h2>
        <div class="metric-row"><span>Reliability</span><span class="metric-val ${ratingClass(sonar['reliability_rating'])}">${ratingLabel(sonar['reliability_rating'])}</span></div>
        <div class="metric-row"><span>Security</span><span class="metric-val ${ratingClass(sonar['security_rating'])}">${ratingLabel(sonar['security_rating'])}</span></div>
        <div class="metric-row"><span>Maintainability</span><span class="metric-val ${ratingClass(sonar['sqale_rating'])}">${ratingLabel(sonar['sqale_rating'])}</span></div>
        <div class="metric-row" style="margin-top:12px"><span>Full report</span>
          <a href="https://sonarcloud.io/project/overview?id=txma-audit" target="_blank" class="badge badge-info">SonarCloud ↗</a>
        </div>
      </div>

      <div class="card">
        <h2>🛡️ IaC Security (Checkov)</h2>
        <div class="metric-row">
          <span>CloudFormation scan</span>
          <span>${checkovPassed ? '<span class="badge badge-pass">✓ Passed</span>' : '<span class="badge badge-fail">✗ Issues found</span>'}</span>
        </div>
        <div class="metric-row"><span>Failed checks</span><span class="metric-val">${checkovFailures.length}</span></div>
        <div class="metric-row"><span>Skipped checks</span><span class="metric-val">CKV_AWS_116</span></div>
      </div>
    </div>

    <div class="section-title">🎫 JIRA Tickets</div>
    <div class="card" style="margin-bottom:28px;padding:16px 20px">
      ${jiraHtml}
    </div>

    <div class="section-title">🔒 Dependency CVEs (npm audit — critical &amp; high)</div>
    <div class="card" style="padding:0;overflow:hidden;margin-bottom:28px">
      <table>
        <thead><tr><th>Package</th><th>Severity</th><th>CVE</th><th>Advisory</th><th>Fix</th></tr></thead>
        <tbody>${auditHtml}</tbody>
      </table>
    </div>

    <div class="section-title">🛡️ Checkov Failed Checks</div>
    <div class="card" style="padding:0;overflow:hidden;margin-bottom:28px">
      <table>
        <thead><tr><th>Check</th><th>Resource</th><th>Location</th></tr></thead>
        <tbody>${checkovHtml}</tbody>
      </table>
    </div>

    <div class="section-title">📝 Commits since ${prevShaShort}</div>
    <div class="card" style="padding:0;overflow:hidden">
      <table>
        <thead><tr><th>SHA</th><th>Message</th><th>Author</th><th>Date</th></tr></thead>
        <tbody>${commitsHtml}</tbody>
      </table>
    </div>
  </main>

  <footer>
    TxMA Audit v${PKG_VERSION} &nbsp;·&nbsp;
    <a href="https://github.com/${REPO}" target="_blank">GitHub</a> &nbsp;·&nbsp;
    Generated by GitHub Actions
  </footer>
</body>
</html>`

mkdirSync('_site', { recursive: true })
writeFileSync(`_site/v${PKG_VERSION}.html`, releaseHtml)
console.log(`Written _site/v${PKG_VERSION}.html`)

// Rebuild index.html from all versioned pages in _site/
const versionPages = readdirSync('_site')
  .filter((f) => /^v[\d.]+\.html$/.test(f))
  .sort((a, b) => {
    const parse = (f) =>
      f
        .replace(/^v|\.html$/g, '')
        .split('.')
        .map(Number)
    const [aMaj, aMin, aPat] = parse(a)
    const [bMaj, bMin, bPat] = parse(b)
    return bMaj - aMaj || bMin - aMin || bPat - aPat
  })

// --- Prune release pages older than RETENTION_DAYS ---
const now = Date.now()
const retentionMs = RETENTION_DAYS * 24 * 60 * 60 * 1000

const activeVersionPages = versionPages.filter((file) => {
  const content = readFileSync(`_site/${file}`, 'utf8')
  const dateStr = content.match(/Built on ([^&<]+)/)?.[1]?.trim()
  if (!dateStr) return true
  const pageDate = new Date(dateStr).getTime()
  if (isNaN(pageDate)) return true
  if (now - pageDate > retentionMs) {
    console.log(`Pruning old release page: ${file} (built ${dateStr})`)
    unlinkSync(`_site/${file}`)
    return false
  }
  return true
})

const indexRows = activeVersionPages.map((file) => {
  const content = readFileSync(`_site/${file}`, 'utf8')
  const sha =
    content.match(/meta name="release-sha" content="([^"]+)"/)?.[1] ?? ''
  const date = content.match(/Built on ([^&<]+)/)?.[1]?.trim() ?? ''
  const version = file.replace(/^v|\.html$/g, '')
  const jiras = [...content.matchAll(/browse\/(DPT-\d+)/g)].map((m) => m[1])
  const jiraBadges = [...new Set(jiras)]
    .map(
      (t) =>
        `<a href="https://govukverify.atlassian.net/browse/${t}" target="_blank" class="badge badge-jira">${t}</a>`
    )
    .join(' ')

  return `
    <tr>
      <td><a href="${file}" class="metric-val">v${version}</a></td>
      <td>${date}</td>
      <td><code><a href="https://github.com/${REPO}/commit/${sha}" target="_blank">${sha.slice(0, 7)}</a></code></td>
      <td>${jiraBadges || '<span class="na">—</span>'}</td>
    </tr>`
})

const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Release Notes - TxMA Audit</title>
  <style>${CSS}</style>
</head>
<body>
  <header>
    <div>
      <h1>TxMA Audit — All Releases</h1>
      <div style="margin-top:6px;font-size:.85rem;color:#aaa;">
        <a href="https://github.com/${REPO}" style="color:#58a6ff" target="_blank">GitHub ↗</a>
      </div>
    </div>
    <span class="version-badge">${activeVersionPages.length} release${activeVersionPages.length !== 1 ? 's' : ''}</span>
  </header>

  <main>
    <div class="card" style="padding:0;overflow:hidden;margin-top:8px">
      <table>
        <thead><tr><th>Version</th><th>Released</th><th>Commit</th><th>JIRA Tickets</th></tr></thead>
        <tbody>${indexRows.join('')}</tbody>
      </table>
    </div>
  </main>

  <footer>
    TxMA Audit &nbsp;·&nbsp; Generated by GitHub Actions
  </footer>
</body>
</html>`

writeFileSync('_site/index.html', indexHtml)
console.log(`Rebuilt index.html with ${activeVersionPages.length} release(s)`)
