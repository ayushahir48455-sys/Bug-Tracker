/* =========================================================
   IN-MEMORY DATA STORE
   (No browser storage is used — data lives only for this tab
   session and resets on reload.)
========================================================= */
let users = [
  { name: "Demo User", username: "demo", email: "demo@buglog.app", password: "demo123" }
];
let currentUser = null;
let bugs = [];
let nextBugId = 1;

function seedDemoBugs(){
  const demoBugs = [
    { title: "Login button unresponsive on Safari", desc: "Clicking 'Log In' on Safari 17 does nothing on the first tap; second tap works. Likely an event-binding timing issue.", severity: "high", status: "open" },
    { title: "Dashboard totals miscount resolved specimens", desc: "The 'Resolved' stat card sometimes shows one less than the actual count after editing a bug's status.", severity: "medium", status: "progress" },
    { title: "Signup allows duplicate usernames with different casing", desc: "'JDoe' and 'jdoe' are treated as different users, which will cause login collisions later.", severity: "critical", status: "open" },
    { title: "Search field lags on large specimen lists", desc: "Typing quickly in the search box feels laggy once there are 100+ entries. Consider debouncing.", severity: "low", status: "resolved" }
  ];
  demoBugs.forEach(b => {
    bugs.push({
      id: nextBugId++,
      title: b.title,
      desc: b.desc,
      severity: b.severity,
      status: b.status,
      reporter: "demo",
      createdAt: new Date()
    });
  });
}
seedDemoBugs();

/* =========================================================
   AUTH SCREEN LOGIC
========================================================= */
function switchTab(which){
  const loginTab = document.getElementById('tab-login');
  const signupTab = document.getElementById('tab-signup');
  const loginForm = document.getElementById('login-form');
  const signupForm = document.getElementById('signup-form');
  hideError('login-error');
  hideError('signup-error');

  if(which === 'login'){
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
  } else {
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
    signupForm.style.display = 'block';
    loginForm.style.display = 'none';
  }
}

function fillDemo(){
  document.getElementById('login-username').value = 'demo';
  document.getElementById('login-password').value = 'demo123';
}

function showError(id, msg){
  const el = document.getElementById(id);
  el.textContent = msg;
  el.classList.add('show');
}
function hideError(id){
  document.getElementById(id).classList.remove('show');
}

function handleLogin(e){
  e.preventDefault();
  hideError('login-error');
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;

  const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
  if(!user || user.password !== password){
    showError('login-error', 'Username or password is incorrect.');
    return;
  }
  currentUser = user;
  enterApp();
}

function handleSignup(e){
  e.preventDefault();
  hideError('signup-error');
  const name = document.getElementById('signup-name').value.trim();
  const username = document.getElementById('signup-username').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const password2 = document.getElementById('signup-password2').value;

  if(users.some(u => u.username.toLowerCase() === username.toLowerCase())){
    showError('signup-error', 'That username is already taken.');
    return;
  }
  if(password !== password2){
    showError('signup-error', 'Passwords do not match.');
    return;
  }
  if(password.length < 4){
    showError('signup-error', 'Password must be at least 4 characters.');
    return;
  }

  const newUser = { name, username, email, password };
  users.push(newUser);
  currentUser = newUser;
  enterApp();
}

function enterApp(){
  document.getElementById('auth-screen').style.display = 'none';
  document.getElementById('app-screen').style.display = 'block';
  document.getElementById('who-name').textContent = currentUser.name || currentUser.username;
  // reset auth forms
  document.getElementById('login-form').reset();
  document.getElementById('signup-form').reset();
  renderBugs();
}

function handleLogout(){
  currentUser = null;
  document.getElementById('app-screen').style.display = 'none';
  document.getElementById('auth-screen').style.display = 'flex';
  switchTab('login');
}

/* =========================================================
   BUG CRUD
========================================================= */
const statusLabel = { open: 'Open', progress: 'In Progress', resolved: 'Resolved' };
const statusClass = { open: 'st-open', progress: 'st-progress', resolved: 'st-resolved' };
const severityLabel = { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' };

function openBugModal(bugId){
  const backdrop = document.getElementById('modal-backdrop');
  const form = document.getElementById('bug-form');
  form.reset();
  if(bugId){
    const bug = bugs.find(b => b.id === bugId);
    document.getElementById('modal-title').textContent = 'Edit Specimen #' + String(bug.id).padStart(4,'0');
    document.getElementById('bug-id').value = bug.id;
    document.getElementById('bug-title').value = bug.title;
    document.getElementById('bug-desc').value = bug.desc;
    document.getElementById('bug-severity').value = bug.severity;
    document.getElementById('bug-status').value = bug.status;
  } else {
    document.getElementById('modal-title').textContent = 'Log a New Specimen';
    document.getElementById('bug-id').value = '';
  }
  backdrop.classList.add('show');
  document.getElementById('bug-title').focus();
}

function closeBugModal(){
  document.getElementById('modal-backdrop').classList.remove('show');
}

function saveBug(e){
  e.preventDefault();
  const id = document.getElementById('bug-id').value;
  const title = document.getElementById('bug-title').value.trim();
  const desc = document.getElementById('bug-desc').value.trim();
  const severity = document.getElementById('bug-severity').value;
  const status = document.getElementById('bug-status').value;

  if(id){
    const bug = bugs.find(b => b.id === Number(id));
    bug.title = title;
    bug.desc = desc;
    bug.severity = severity;
    bug.status = status;
    showToast('Specimen #' + String(bug.id).padStart(4,'0') + ' updated.');
  } else {
    const bug = {
      id: nextBugId++,
      title, desc, severity, status,
      reporter: currentUser.username,
      createdAt: new Date()
    };
    bugs.unshift(bug);
    showToast('Specimen #' + String(bug.id).padStart(4,'0') + ' logged.');
  }
  closeBugModal();
  renderBugs();
}

function deleteBug(id){
  const bug = bugs.find(b => b.id === id);
  if(!bug) return;
  if(!confirm('Delete specimen #' + String(id).padStart(4,'0') + ' — "' + bug.title + '"? This cannot be undone.')) return;
  bugs = bugs.filter(b => b.id !== id);
  showToast('Specimen #' + String(id).padStart(4,'0') + ' deleted.');
  renderBugs();
}

function cycleStatus(id){
  const order = ['open','progress','resolved'];
  const bug = bugs.find(b => b.id === id);
  const idx = order.indexOf(bug.status);
  bug.status = order[(idx + 1) % order.length];
  showToast('Specimen #' + String(id).padStart(4,'0') + ' marked ' + statusLabel[bug.status] + '.');
  renderBugs();
}

function formatDate(d){
  return d.toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' });
}

function renderBugs(){
  const grid = document.getElementById('bug-grid');
  const search = document.getElementById('search-input').value.trim().toLowerCase();
  const statusFilter = document.getElementById('filter-status').value;
  const sevFilter = document.getElementById('filter-severity').value;

  let list = bugs.filter(b => {
    const matchesSearch = !search || b.title.toLowerCase().includes(search) || b.desc.toLowerCase().includes(search);
    const matchesStatus = !statusFilter || b.status === statusFilter;
    const matchesSev = !sevFilter || b.severity === sevFilter;
    return matchesSearch && matchesStatus && matchesSev;
  });

  grid.innerHTML = '';

  if(list.length === 0){
    grid.innerHTML = `
      <div class="empty">
        <span class="mark">🔍</span>
        <h3>No specimens match</h3>
        <p>${bugs.length === 0 ? "Click + New Specimen to log your first bug." : "Try clearing your search or filters."}</p>
      </div>`;
  } else {
    list.forEach(bug => {
      const card = document.createElement('div');
      card.className = 'bug-card sev-' + bug.severity;
      card.innerHTML = `
        <div class="bug-top">
          <div>
            <div class="specimen-no">SPECIMEN #${String(bug.id).padStart(4,'0')}</div>
            <h3 class="bug-title">${escapeHtml(bug.title)}</h3>
          </div>
        </div>
        <div class="badges">
          <span class="stamp sev-${bug.severity}">${severityLabel[bug.severity]}</span>
          <span class="stamp ${statusClass[bug.status]}">${statusLabel[bug.status]}</span>
        </div>
        <div class="bug-desc">${escapeHtml(bug.desc)}</div>
        <div class="bug-meta">
          <span>Reported by ${escapeHtml(bug.reporter)}</span>
          <span>${formatDate(bug.createdAt)}</span>
        </div>
        <div class="bug-actions">
          <button onclick="cycleStatus(${bug.id})">Advance Status</button>
          <button onclick="openBugModal(${bug.id})">Edit</button>
          <button class="danger" onclick="deleteBug(${bug.id})">Delete</button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // stats
  document.getElementById('stat-open').textContent = bugs.filter(b => b.status === 'open').length;
  document.getElementById('stat-progress').textContent = bugs.filter(b => b.status === 'progress').length;
  document.getElementById('stat-resolved').textContent = bugs.filter(b => b.status === 'resolved').length;
  document.getElementById('stat-critical').textContent = bugs.filter(b => b.severity === 'critical').length;
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

let toastTimer;
function showToast(msg){
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2600);
}

// close modal on backdrop click
document.getElementById('modal-backdrop').addEventListener('click', function(e){
  if(e.target === this) closeBugModal();
});
// close modal on Escape
document.addEventListener('keydown', function(e){
  if(e.key === 'Escape') closeBugModal();
});
