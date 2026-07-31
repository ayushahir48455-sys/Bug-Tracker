import React, { useState } from "react";

const statusLabel = { open: "Open", progress: "In Progress", resolved: "Resolved" };
const statusClass = { open: "st-open", progress: "st-progress", resolved: "st-resolved" };
const severityLabel = { low: "Low", medium: "Medium", high: "High", critical: "Critical" };

function seedDemoBugs() {
  const demoBugs = [
    {
      title: "Login button unresponsive on Safari",
      desc: "Clicking 'Log In' on Safari 17 does nothing on the first tap; second tap works. Likely an event-binding timing issue.",
      severity: "high",
      status: "open",
    },
    {
      title: "Dashboard totals miscount resolved specimens",
      desc: "The 'Resolved' stat card sometimes shows one less than the actual count after editing a bug's status.",
      severity: "medium",
      status: "progress",
    },
    {
      title: "Signup allows duplicate usernames with different casing",
      desc: "'JDoe' and 'jdoe' are treated as different users, which will cause login collisions later.",
      severity: "critical",
      status: "open",
    },
    {
      title: "Search field lags on large specimen lists",
      desc: "Typing quickly in the search box feels laggy once there are 100+ entries. Consider debouncing.",
      severity: "low",
      status: "resolved",
    },
  ];
  return demoBugs.map((b, i) => ({
    id: i + 1,
    title: b.title,
    desc: b.desc,
    severity: b.severity,
    status: b.status,
    reporter: "demo",
    createdAt: new Date(),
  }));
}

function formatDate(d) {
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function BugLog() {
  // auth state
  const [users, setUsers] = useState([
    { name: "Demo User", username: "demo", email: "demo@buglog.app", password: "demo123" },
  ]);
  const [currentUser, setCurrentUser] = useState(null);
  const [authTab, setAuthTab] = useState("login");
  const [loginError, setLoginError] = useState("");
  const [signupError, setSignupError] = useState("");

  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [signupName, setSignupName] = useState("");
  const [signupUsername, setSignupUsername] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupPassword2, setSignupPassword2] = useState("");

  // bug data
  const [bugs, setBugs] = useState(() => seedDemoBugs());
  const [nextBugId, setNextBugId] = useState(5);

  // toolbar
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sevFilter, setSevFilter] = useState("");

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formTitle, setFormTitle] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formSeverity, setFormSeverity] = useState("medium");
  const [formStatus, setFormStatus] = useState("open");

  // toast
  const [toast, setToast] = useState({ show: false, msg: "" });
  const toastTimer = React.useRef(null);

  function showToast(msg) {
    setToast({ show: true, msg });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast((t) => ({ ...t, show: false })), 2600);
  }

  function fillDemo() {
    setLoginUsername("demo");
    setLoginPassword("demo123");
  }

  function handleLogin(e) {
    e.preventDefault();
    setLoginError("");
    const user = users.find((u) => u.username.toLowerCase() === loginUsername.trim().toLowerCase());
    if (!user || user.password !== loginPassword) {
      setLoginError("Username or password is incorrect.");
      return;
    }
    setCurrentUser(user);
    setLoginUsername("");
    setLoginPassword("");
  }

  function handleSignup(e) {
    e.preventDefault();
    setSignupError("");
    const name = signupName.trim();
    const username = signupUsername.trim();
    const email = signupEmail.trim();

    if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) {
      setSignupError("That username is already taken.");
      return;
    }
    if (signupPassword !== signupPassword2) {
      setSignupError("Passwords do not match.");
      return;
    }
    if (signupPassword.length < 4) {
      setSignupError("Password must be at least 4 characters.");
      return;
    }

    const newUser = { name, username, email, password: signupPassword };
    setUsers((u) => [...u, newUser]);
    setCurrentUser(newUser);
    setSignupName("");
    setSignupUsername("");
    setSignupEmail("");
    setSignupPassword("");
    setSignupPassword2("");
  }

  function handleLogout() {
    setCurrentUser(null);
    setAuthTab("login");
    setLoginError("");
    setSignupError("");
  }

  function openBugModal(bugId) {
    if (bugId) {
      const bug = bugs.find((b) => b.id === bugId);
      setEditingId(bug.id);
      setFormTitle(bug.title);
      setFormDesc(bug.desc);
      setFormSeverity(bug.severity);
      setFormStatus(bug.status);
    } else {
      setEditingId(null);
      setFormTitle("");
      setFormDesc("");
      setFormSeverity("medium");
      setFormStatus("open");
    }
    setModalOpen(true);
  }

  function closeBugModal() {
    setModalOpen(false);
  }

  function saveBug(e) {
    e.preventDefault();
    const title = formTitle.trim();
    const desc = formDesc.trim();

    if (editingId) {
      setBugs((prev) =>
        prev.map((b) =>
          b.id === editingId ? { ...b, title, desc, severity: formSeverity, status: formStatus } : b
        )
      );
      showToast("Specimen #" + String(editingId).padStart(4, "0") + " updated.");
    } else {
      const bug = {
        id: nextBugId,
        title,
        desc,
        severity: formSeverity,
        status: formStatus,
        reporter: currentUser.username,
        createdAt: new Date(),
      };
      setBugs((prev) => [bug, ...prev]);
      setNextBugId((n) => n + 1);
      showToast("Specimen #" + String(bug.id).padStart(4, "0") + " logged.");
    }
    setModalOpen(false);
  }

  function deleteBug(id) {
    const bug = bugs.find((b) => b.id === id);
    if (!bug) return;
    if (!window.confirm('Delete specimen #' + String(id).padStart(4, "0") + ' — "' + bug.title + '"? This cannot be undone.'))
      return;
    setBugs((prev) => prev.filter((b) => b.id !== id));
    showToast("Specimen #" + String(id).padStart(4, "0") + " deleted.");
  }

  function cycleStatus(id) {
    const order = ["open", "progress", "resolved"];
    setBugs((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const idx = order.indexOf(b.status);
        const newStatus = order[(idx + 1) % order.length];
        showToast("Specimen #" + String(id).padStart(4, "0") + " marked " + statusLabel[newStatus] + ".");
        return { ...b, status: newStatus };
      })
    );
  }

  const filteredBugs = bugs.filter((b) => {
    const s = search.trim().toLowerCase();
    const matchesSearch = !s || b.title.toLowerCase().includes(s) || b.desc.toLowerCase().includes(s);
    const matchesStatus = !statusFilter || b.status === statusFilter;
    const matchesSev = !sevFilter || b.severity === sevFilter;
    return matchesSearch && matchesStatus && matchesSev;
  });

  const statOpen = bugs.filter((b) => b.status === "open").length;
  const statProgress = bugs.filter((b) => b.status === "progress").length;
  const statResolved = bugs.filter((b) => b.status === "resolved").length;
  const statCritical = bugs.filter((b) => b.severity === "critical").length;

  return (
    <div className="buglog-root">
      <style>{css}</style>

      {!currentUser ? (
        <div id="auth-screen">
          <div className="auth-wrap">
            <div className="auth-brand">
              <span className="mark">🐞</span>
              <h1>BUG LOG</h1>
              <p>Specimen Intake &amp; Field Tracker</p>
            </div>

            <div className="card index-card grain">
              <div className="pin"></div>

              <div className="tabs">
                <button
                  className={"tab-btn" + (authTab === "login" ? " active" : "")}
                  onClick={() => {
                    setAuthTab("login");
                    setLoginError("");
                    setSignupError("");
                  }}
                >
                  Log In
                </button>
                <button
                  className={"tab-btn" + (authTab === "signup" ? " active" : "")}
                  onClick={() => {
                    setAuthTab("signup");
                    setLoginError("");
                    setSignupError("");
                  }}
                >
                  Sign Up
                </button>
              </div>

              {loginError && authTab === "login" && <div className="error-msg show">{loginError}</div>}
              {signupError && authTab === "signup" && <div className="error-msg show">{signupError}</div>}

              {authTab === "login" ? (
                <form onSubmit={handleLogin}>
                  <div className="field">
                    <label htmlFor="login-username">Username</label>
                    <input
                      type="text"
                      id="login-username"
                      autoComplete="username"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="login-password">Password</label>
                    <input
                      type="password"
                      id="login-password"
                      autoComplete="current-password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="stamp-btn">
                    Enter Log
                  </button>
                  <button type="button" className="demo-fill" onClick={fillDemo}>
                    Use demo credentials
                  </button>
                  <p className="hint">
                    No account yet?{" "}
                    <button type="button" className="linklike" onClick={() => setAuthTab("signup")}>
                      Create one
                    </button>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleSignup}>
                  <div className="field">
                    <label htmlFor="signup-name">Full name</label>
                    <input
                      type="text"
                      id="signup-name"
                      autoComplete="name"
                      required
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="signup-username">Username</label>
                    <input
                      type="text"
                      id="signup-username"
                      autoComplete="username"
                      required
                      value={signupUsername}
                      onChange={(e) => setSignupUsername(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="signup-email">Email</label>
                    <input
                      type="email"
                      id="signup-email"
                      autoComplete="email"
                      required
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="signup-password">Password</label>
                    <input
                      type="password"
                      id="signup-password"
                      autoComplete="new-password"
                      required
                      minLength={4}
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="signup-password2">Confirm password</label>
                    <input
                      type="password"
                      id="signup-password2"
                      autoComplete="new-password"
                      required
                      minLength={4}
                      value={signupPassword2}
                      onChange={(e) => setSignupPassword2(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="stamp-btn">
                    Register &amp; Enter
                  </button>
                  <p className="hint">
                    Already registered?{" "}
                    <button type="button" className="linklike" onClick={() => setAuthTab("login")}>
                      Log in
                    </button>
                  </p>
                </form>
              )}
            </div>
            <p className="hint" style={{ textAlign: "center", marginTop: 16 }}>
              Runs entirely in this browser tab — accounts and specimens reset on reload.
            </p>
          </div>
        </div>
      ) : (
        <div id="app-screen" style={{ display: "block" }}>
          <div className="topbar">
            <div className="brand">
              <span className="mark">🐞</span>
              <div>
                <h1>BUG LOG</h1>
                <div className="sub">Specimen Tracker</div>
              </div>
            </div>
            <div className="who">
              <span className="name">
                Logged in as <b>{currentUser.name || currentUser.username}</b>
              </span>
              <button className="logout-btn" onClick={handleLogout}>
                Log Out
              </button>
            </div>
          </div>

          <div className="container">
            <div className="stats">
              <div className="stat open">
                <div className="num">{statOpen}</div>
                <div className="lbl">Open</div>
              </div>
              <div className="stat progress">
                <div className="num">{statProgress}</div>
                <div className="lbl">In Progress</div>
              </div>
              <div className="stat resolved">
                <div className="num">{statResolved}</div>
                <div className="lbl">Resolved</div>
              </div>
              <div className="stat critical">
                <div className="num">{statCritical}</div>
                <div className="lbl">Critical</div>
              </div>
            </div>

            <div className="toolbar">
              <input
                type="text"
                placeholder="Search specimens by title or description…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                <option value="open">Open</option>
                <option value="progress">In Progress</option>
                <option value="resolved">Resolved</option>
              </select>
              <select value={sevFilter} onChange={(e) => setSevFilter(e.target.value)}>
                <option value="">All severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
              <button className="new-btn" onClick={() => openBugModal()}>
                + New Specimen
              </button>
            </div>

            <div className="grid">
              {filteredBugs.length === 0 ? (
                <div className="empty">
                  <span className="mark">🔍</span>
                  <h3>No specimens match</h3>
                  <p>
                    {bugs.length === 0
                      ? "Click + New Specimen to log your first bug."
                      : "Try clearing your search or filters."}
                  </p>
                </div>
              ) : (
                filteredBugs.map((bug) => (
                  <div key={bug.id} className={"bug-card sev-" + bug.severity}>
                    <div className="bug-top">
                      <div>
                        <div className="specimen-no">SPECIMEN #{String(bug.id).padStart(4, "0")}</div>
                        <h3 className="bug-title">{bug.title}</h3>
                      </div>
                    </div>
                    <div className="badges">
                      <span className={"stamp sev-" + bug.severity}>{severityLabel[bug.severity]}</span>
                      <span className={"stamp " + statusClass[bug.status]}>{statusLabel[bug.status]}</span>
                    </div>
                    <div className="bug-desc">{bug.desc}</div>
                    <div className="bug-meta">
                      <span>Reported by {bug.reporter}</span>
                      <span>{formatDate(bug.createdAt)}</span>
                    </div>
                    <div className="bug-actions">
                      <button onClick={() => cycleStatus(bug.id)}>Advance Status</button>
                      <button onClick={() => openBugModal(bug.id)}>Edit</button>
                      <button className="danger" onClick={() => deleteBug(bug.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className="modal-backdrop show"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeBugModal();
          }}
        >
          <div className="modal grain">
            <h2>{editingId ? "Edit Specimen #" + String(editingId).padStart(4, "0") : "Log a New Specimen"}</h2>
            <form onSubmit={saveBug}>
              <div className="field">
                <label htmlFor="bug-title">Title</label>
                <input
                  type="text"
                  id="bug-title"
                  required
                  placeholder="e.g. Login button unresponsive on Safari"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </div>
              <div className="field">
                <label htmlFor="bug-desc">Description</label>
                <textarea
                  id="bug-desc"
                  required
                  placeholder="Steps to reproduce, expected vs actual behavior…"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                />
              </div>
              <div className="modal-row">
                <div className="field">
                  <label htmlFor="bug-severity">Severity</label>
                  <select
                    id="bug-severity"
                    value={formSeverity}
                    onChange={(e) => setFormSeverity(e.target.value)}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="bug-status">Status</label>
                  <select id="bug-status" value={formStatus} onChange={(e) => setFormStatus(e.target.value)}>
                    <option value="open">Open</option>
                    <option value="progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={closeBugModal}>
                  Cancel
                </button>
                <button type="submit" className="stamp-btn save-btn">
                  Save Specimen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div id="toast" className={toast.show ? "show" : ""}>
        {toast.msg}
      </div>
    </div>
  );
}

const css = `
.buglog-root{
  --bg: #14170F;
  --panel: #1E2318;
  --panel-alt: #262C1F;
  --panel-raised: #2C331F;
  --line: #3A4230;
  --ink: #E9E4D3;
  --muted: #8D9480;
  --accent: #C99A3D;
  --accent-soft: rgba(201,154,61,0.14);
  --moss: #6B8F5C;
  --moss-soft: rgba(107,143,92,0.14);
  --rust: #B0402C;
  --rust-soft: rgba(176,64,44,0.14);
  --slate: #5B7B99;
  --slate-soft: rgba(91,123,153,0.14);
  --burnt: #C9793D;
  --burnt-soft: rgba(201,121,61,0.14);
  --shadow: 0 10px 30px rgba(0,0,0,0.35);
  --radius: 3px;

  font-family: 'IBM Plex Mono', monospace;
  color: var(--ink);
  background:
    radial-gradient(circle at 15% -10%, rgba(201,154,61,0.06), transparent 45%),
    radial-gradient(circle at 100% 0%, rgba(107,143,92,0.05), transparent 40%),
    var(--bg);
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}

.buglog-root *{ box-sizing: border-box; }

.buglog-root h1,.buglog-root h2,.buglog-root h3{
  font-family: 'Bitter', serif;
  font-weight: 700;
  letter-spacing: 0.01em;
  margin: 0;
}

.buglog-root ::selection{ background: var(--accent-soft); }

.buglog-root .grain{ position:relative; }
.buglog-root .grain::before{
  content:"";
  position:absolute; inset:0;
  background-image: radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px);
  background-size: 3px 3px;
  pointer-events:none;
  border-radius: inherit;
}

.buglog-root .pin{
  position:absolute;
  top:10px; left:14px;
  width:8px; height:8px;
  border-radius:50%;
  background: radial-gradient(circle at 35% 30%, #f4e6c2, var(--accent) 60%, #7a5a1e 100%);
  box-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

.buglog-root #auth-screen{
  min-height:100vh;
  display:flex;
  align-items:center;
  justify-content:center;
  padding: 24px;
}

.buglog-root .auth-wrap{ width:100%; max-width: 420px; }

.buglog-root .auth-brand{ text-align:center; margin-bottom: 22px; }
.buglog-root .auth-brand .mark{ font-size: 34px; display:inline-block; transform: rotate(-6deg); }
.buglog-root .auth-brand h1{ font-size: 22px; margin: 6px 0 2px; color: var(--ink); }
.buglog-root .auth-brand p{
  margin:0; color: var(--muted); font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase;
}

.buglog-root .card{
  position:relative;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
}

.buglog-root .index-card{ padding: 30px 28px 26px; border-left: 3px dashed var(--line); }

.buglog-root .tabs{
  display:flex; gap:2px; margin-bottom: 22px;
  background: var(--panel-alt); border: 1px solid var(--line); border-radius: var(--radius); padding: 3px;
}
.buglog-root .tab-btn{
  flex:1; padding: 9px 10px; background: transparent; border: none; color: var(--muted);
  font-family: 'IBM Plex Mono', monospace; font-size: 12px; letter-spacing: 0.1em; text-transform: uppercase;
  cursor:pointer; border-radius: 2px; transition: background .15s ease, color .15s ease;
}
.buglog-root .tab-btn.active{ background: var(--panel-raised); color: var(--accent); }

.buglog-root .field{ margin-bottom: 16px; }
.buglog-root .field label{
  display:block; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--muted); margin-bottom: 6px;
}
.buglog-root .field input, .buglog-root .field select, .buglog-root .field textarea{
  width:100%; background: var(--panel-alt); border: 1px solid var(--line); color: var(--ink);
  padding: 10px 11px; border-radius: 2px; font-family: 'IBM Plex Mono', monospace; font-size: 13px;
  outline: none; transition: border-color .15s ease, box-shadow .15s ease;
}
.buglog-root .field input:focus, .buglog-root .field select:focus, .buglog-root .field textarea:focus{
  border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-soft);
}
.buglog-root .field textarea{ resize: vertical; min-height: 74px; }

.buglog-root .hint{ font-size: 11px; color: var(--muted); margin-top: 10px; line-height:1.5; }
.buglog-root .hint button.linklike{
  background:none;border:none;color:var(--accent);cursor:pointer;
  font-family:inherit; font-size:11px; text-decoration:underline; padding:0;
}

.buglog-root .error-msg{
  background: var(--rust-soft); border: 1px solid var(--rust); color: #f0c8bf; font-size: 12px;
  padding: 8px 10px; border-radius: 2px; margin-bottom: 14px; display:none;
}
.buglog-root .error-msg.show{ display:block; }

.buglog-root .stamp-btn{
  width:100%; padding: 12px; background: var(--accent); color: #221805; border: none; border-radius: 2px;
  font-family: 'Bitter', serif; font-weight: 700; font-size: 13px; letter-spacing: 0.08em;
  text-transform: uppercase; cursor:pointer; transition: transform .1s ease, filter .15s ease;
}
.buglog-root .stamp-btn:hover{ filter: brightness(1.08); }
.buglog-root .stamp-btn:active{ transform: scale(0.98); }

.buglog-root .demo-fill{
  width:100%; margin-top:10px; padding: 9px; background: transparent; border: 1px dashed var(--line);
  color: var(--muted); border-radius: 2px; font-family: 'IBM Plex Mono', monospace; font-size: 11px;
  letter-spacing: 0.06em; cursor:pointer;
}
.buglog-root .demo-fill:hover{ border-color: var(--accent); color: var(--accent); }

.buglog-root .topbar{
  display:flex; align-items:center; justify-content:space-between; padding: 16px 28px;
  border-bottom: 1px solid var(--line); background: var(--panel); position: sticky; top:0; z-index: 20;
}
.buglog-root .brand{ display:flex; align-items:center; gap:10px; }
.buglog-root .brand .mark{ font-size:22px; transform: rotate(-6deg); display:inline-block; }
.buglog-root .brand h1{ font-size:16px; margin:0; letter-spacing:0.04em; }
.buglog-root .brand .sub{ font-size:10px; color:var(--muted); letter-spacing:0.14em; text-transform:uppercase; }

.buglog-root .who{ display:flex; align-items:center; gap:14px; }
.buglog-root .who .name{ font-size:12px; color:var(--muted); }
.buglog-root .who .name b{ color:var(--ink); }
.buglog-root .logout-btn{
  background:transparent; border:1px solid var(--line); color: var(--muted); padding: 7px 12px;
  font-family:'IBM Plex Mono',monospace; font-size:11px; letter-spacing:0.08em; text-transform:uppercase;
  border-radius:2px; cursor:pointer;
}
.buglog-root .logout-btn:hover{ border-color: var(--rust); color:#f0c8bf; }

.buglog-root .container{ max-width: 1180px; margin: 0 auto; padding: 26px 28px 60px; }

.buglog-root .stats{ display:grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 22px; }
.buglog-root .stat{
  position:relative; background: var(--panel); border:1px solid var(--line); border-radius: var(--radius);
  padding: 14px 16px; overflow:hidden;
}
.buglog-root .stat .num{ font-family:'Bitter',serif; font-size: 26px; font-weight:800; }
.buglog-root .stat .lbl{ font-size:10px; letter-spacing:0.14em; text-transform:uppercase; color:var(--muted); margin-top:2px; }
.buglog-root .stat.open .num{ color: var(--accent); }
.buglog-root .stat.progress .num{ color: var(--slate); }
.buglog-root .stat.resolved .num{ color: var(--moss); }
.buglog-root .stat.critical .num{ color: var(--rust); }

.buglog-root .toolbar{ display:flex; flex-wrap:wrap; gap:10px; align-items:center; margin-bottom: 18px; }
.buglog-root .toolbar input[type=text]{
  flex:1; min-width: 180px; background: var(--panel); border:1px solid var(--line); color:var(--ink);
  padding: 9px 12px; border-radius:2px; font-family:'IBM Plex Mono',monospace; font-size:13px; outline:none;
}
.buglog-root .toolbar input[type=text]:focus{ border-color:var(--accent); }
.buglog-root .toolbar select{
  background: var(--panel); border:1px solid var(--line); color:var(--muted); padding: 9px 10px;
  border-radius:2px; font-family:'IBM Plex Mono',monospace; font-size:12px; outline:none;
}
.buglog-root .new-btn{
  background: var(--accent); color:#221805; border:none; padding: 10px 16px; border-radius:2px;
  font-family:'Bitter',serif; font-weight:700; font-size:12.5px; letter-spacing:0.06em; text-transform:uppercase;
  cursor:pointer; white-space:nowrap;
}
.buglog-root .new-btn:hover{ filter:brightness(1.08); }

.buglog-root .grid{ display:grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; }

.buglog-root .bug-card{
  position:relative; background: var(--panel); border:1px solid var(--line); border-left: 3px solid var(--line);
  border-radius: var(--radius); padding: 18px 16px 14px 22px; display:flex; flex-direction:column; gap:10px;
}
.buglog-root .bug-card.sev-low{ border-left-color: var(--slate); }
.buglog-root .bug-card.sev-medium{ border-left-color: var(--accent); }
.buglog-root .bug-card.sev-high{ border-left-color: var(--burnt); }
.buglog-root .bug-card.sev-critical{ border-left-color: var(--rust); }

.buglog-root .bug-top{ display:flex; justify-content:space-between; align-items:flex-start; gap:10px; }
.buglog-root .specimen-no{ font-size:10.5px; color: var(--muted); letter-spacing:0.1em; }
.buglog-root .bug-title{ font-family:'Bitter',serif; font-weight:700; font-size:15px; margin: 3px 0 0; line-height:1.3; }

.buglog-root .badges{ display:flex; gap:6px; flex-wrap:wrap; }
.buglog-root .stamp{
  display:inline-block; font-size:9.5px; font-weight:700; letter-spacing:0.09em; text-transform:uppercase;
  padding: 3px 7px; border-radius:2px; border:1.5px solid currentColor; transform: rotate(-2deg); white-space:nowrap;
}
.buglog-root .stamp.sev-low{ color: var(--slate); background: var(--slate-soft); }
.buglog-root .stamp.sev-medium{ color: var(--accent); background: var(--accent-soft); }
.buglog-root .stamp.sev-high{ color: var(--burnt); background: var(--burnt-soft); }
.buglog-root .stamp.sev-critical{ color: var(--rust); background: var(--rust-soft); }
.buglog-root .stamp.st-open{ color: var(--accent); background: var(--accent-soft); }
.buglog-root .stamp.st-progress{ color: var(--slate); background: var(--slate-soft); }
.buglog-root .stamp.st-resolved{ color: var(--moss); background: var(--moss-soft); }

.buglog-root .bug-desc{ font-size:12.5px; color: var(--muted); line-height:1.55; flex:1; }

.buglog-root .bug-meta{
  font-size:10.5px; color: var(--muted); display:flex; justify-content:space-between;
  border-top: 1px dashed var(--line); padding-top: 9px;
}

.buglog-root .bug-actions{ display:flex; gap:6px; margin-top: 2px; }
.buglog-root .bug-actions button{
  flex:1; background: var(--panel-alt); border:1px solid var(--line); color: var(--muted); padding: 7px 6px;
  font-family:'IBM Plex Mono',monospace; font-size:10.5px; letter-spacing:0.05em; text-transform:uppercase;
  border-radius:2px; cursor:pointer;
}
.buglog-root .bug-actions button:hover{ border-color: var(--accent); color: var(--accent); }
.buglog-root .bug-actions button.danger:hover{ border-color: var(--rust); color:#f0c8bf; }

.buglog-root .empty{
  grid-column: 1 / -1; text-align:center; padding: 60px 20px; color: var(--muted);
  border: 1px dashed var(--line); border-radius: var(--radius);
}
.buglog-root .empty .mark{ font-size: 30px; display:block; margin-bottom:10px; transform: rotate(-6deg); }
.buglog-root .empty h3{ color: var(--ink); font-size:15px; margin: 0 0 6px; }
.buglog-root .empty p{ font-size:12px; margin:0; }

.buglog-root .modal-backdrop{
  display:none; position:fixed; inset:0; background: rgba(10,12,7,0.6); backdrop-filter: blur(2px);
  z-index: 50; align-items:center; justify-content:center; padding: 20px;
}
.buglog-root .modal-backdrop.show{ display:flex; }
.buglog-root .modal{
  width:100%; max-width: 480px; background: var(--panel); border:1px solid var(--line); border-radius: var(--radius);
  box-shadow: var(--shadow); padding: 24px 24px 20px; max-height: 90vh; overflow-y:auto;
}
.buglog-root .modal h2{ font-size:16px; margin:0 0 16px; }
.buglog-root .modal-row{ display:grid; grid-template-columns:1fr 1fr; gap:12px; }
.buglog-root .modal-actions{ display:flex; gap:10px; margin-top: 6px; }
.buglog-root .modal-actions .cancel-btn{
  flex:1; background:transparent; border:1px solid var(--line); color: var(--muted); padding: 10px;
  border-radius:2px; font-family:'IBM Plex Mono',monospace; font-size:12px; text-transform:uppercase;
  letter-spacing:0.06em; cursor:pointer;
}
.buglog-root .modal-actions .save-btn{ flex:1; }

.buglog-root #toast{
  position:fixed; bottom: 22px; left:50%; transform: translateX(-50%) translateY(10px);
  background: var(--panel-raised); border:1px solid var(--accent); color: var(--ink); padding: 10px 18px;
  border-radius: 2px; font-size:12px; letter-spacing:0.03em; box-shadow: var(--shadow); opacity:0;
  pointer-events:none; transition: opacity .2s ease, transform .2s ease; z-index: 100;
}
.buglog-root #toast.show{ opacity:1; transform: translateX(-50%) translateY(0); }

@media (max-width: 720px){
  .buglog-root .stats{ grid-template-columns: repeat(2,1fr); }
  .buglog-root .modal-row{ grid-template-columns: 1fr; }
  .buglog-root .topbar{ padding: 14px 16px; }
  .buglog-root .container{ padding: 20px 16px 50px; }
}

@media (prefers-reduced-motion: reduce){
  .buglog-root *{ transition: none !important; }
}

.buglog-root :focus-visible{ outline: 2px solid var(--accent); outline-offset: 2px; }
`;