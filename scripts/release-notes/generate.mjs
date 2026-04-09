import { readFileSync, writeFileSync, mkdirSync } from 'fs'

const pkg = JSON.parse(readFileSync('package.json', 'utf8'))
const PKG_VERSION = pkg.version

const {
  SONAR_METRICS,
  JIRA_TICKETS,
  PREV_TAG,
  CHECKOV_OUTCOME,
  VERSION,
  RUN_URL,
  BRANCH,
  REPO
} = process.env

const SHORT_SHA = VERSION?.slice(0, 7) ?? 'unknown'
const BUILD_DATE = new Date().toUTCString().replace(/:\d\d GMT/, ' UTC')

let sonar = {}
try {
  const data = JSON.parse(SONAR_METRICS ?? '{}')
  ;(data.component?.measures ?? []).forEach((m) => {
    sonar[m.metric] = m.value
  })
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

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Release Notes - TxMA Audit v${PKG_VERSION}</title>
  <style>
    :root { --green:#2ea44f; --red:#d73a49; --orange:#e36209; --blue:#0366d6; --grey:#6a737d; }
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif; background:#f6f8fa; color:#24292e; }
    header { background:#24292e; color:#fff; padding:20px 40px; display:flex; align-items:center; gap:16px; }
    header h1 { font-size:1.4rem; }
    header .version { background:#2ea44f; padding:4px 10px; border-radius:20px; font-size:.85rem; font-weight:600; }
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
    table { width:100%; border-collapse:collapse; font-size:.875rem; }
    th { background:#f6f8fa; text-align:left; padding:8px 12px; border-bottom:2px solid #e1e4e8; font-size:.8rem; text-transform:uppercase; color:var(--grey); }
    td { padding:8px 12px; border-bottom:1px solid #f0f0f0; vertical-align:top; }
    tr:last-child td { border-bottom:none; }
    a { color:var(--blue); text-decoration:none; } a:hover { text-decoration:underline; }
    .na { color:var(--grey); font-style:italic; font-size:.875rem; }
    .section-title { font-size:1rem; font-weight:600; margin:28px 0 12px; }
    footer { text-align:center; padding:24px; color:var(--grey); font-size:.8rem; border-top:1px solid #e1e4e8; margin-top:40px; }
  </style>
</head>
<body>
  <header>
    <div>
      <h1>TxMA Audit — Release Notes</h1>
      <div style="margin-top:6px;font-size:.85rem;color:#aaa;">
        Built on ${BUILD_DATE} &nbsp;|&nbsp;
        Branch: <strong style="color:#fff">${BRANCH}</strong> &nbsp;|&nbsp;
        Commit: <a href="https://github.com/${REPO}/commit/${VERSION}" style="color:#58a6ff">${SHORT_SHA}</a>
      </div>
    </div>
    <span class="version">v${PKG_VERSION}</span>
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
          <a href="https://sonarcloud.io/project/overview?id=govuk-one-login_txma-audit" target="_blank" class="badge badge-info">SonarCloud ↗</a>
        </div>
      </div>

      <div class="card">
        <h2>🛡️ IaC Security (Checkov)</h2>
        <div class="metric-row">
          <span>CloudFormation scan</span>
          <span>${checkovPassed ? '<span class="badge badge-pass">✓ Passed</span>' : '<span class="badge badge-fail">✗ Issues found</span>'}</span>
        </div>
        <div class="metric-row"><span>Framework</span><span class="metric-val">CloudFormation</span></div>
        <div class="metric-row"><span>Skipped checks</span><span class="metric-val">CKV_AWS_116</span></div>
      </div>
    </div>

    <div class="section-title">🎫 JIRA Tickets</div>
    <div class="card" style="margin-bottom:28px;padding:16px 20px">
      ${jiraHtml}
    </div>

    <div class="section-title">📝 Commits since ${PREV_TAG?.slice(0, 7) ?? 'last release'}</div>
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
writeFileSync('_site/index.html', html)
console.log(`Release notes written to _site/index.html (v${PKG_VERSION})`)
