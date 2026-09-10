document.addEventListener('DOMContentLoaded', async () => {
  await loadDashboardData();
});

async function loadDashboardData() {
  const container = document.getElementById('dashboard-content');
  if (!container) return;

  try {
    const res = await api.get('/student/dashboard');
    const leavesRes = await api.get('/student/leaves');
    const complaintsRes = await api.get('/student/complaints');

    if (!res.success) {
      container.innerHTML = `<div class="empty-state">Unable to load dashboard information.</div>`;
      return;
    }

    const { student, currentLeaveStatus, pendingLeavesCount, activeComplaintsCount, recentAnnouncements } = res.dashboard;
    const leaves = leavesRes.success ? leavesRes.leaves.slice(0, 3) : [];
    const complaints = complaintsRes.success ? complaintsRes.complaints.slice(0, 3) : [];

    const greeting = getGreeting();

    container.innerHTML = `
      <div class="page-header">
        <h1>${greeting}, ${student.fullName}!</h1>
        <p>Here's your hostel overview.</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon primary"><i data-lucide="bed"></i></div>
          <div class="stat-info">
            <span class="stat-label">My Room</span>
            <span class="stat-value">${student.roomNumber !== 'Not Assigned' ? 'Room ' + student.roomNumber : 'Unassigned'}</span>
            <span style="font-size:0.75rem; color:var(--text-muted);">${student.block || student.hostel || 'Hostel'}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon ${currentLeaveStatus.includes('Approved') ? 'warning' : 'success'}"><i data-lucide="calendar"></i></div>
          <div class="stat-info">
            <span class="stat-label">Leave Status</span>
            <span class="stat-value" style="font-size: 1rem;">${currentLeaveStatus}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon warning"><i data-lucide="clock"></i></div>
          <div class="stat-info">
            <span class="stat-label">Pending Leave</span>
            <span class="stat-value">${pendingLeavesCount} ${pendingLeavesCount === 1 ? 'Request' : 'Requests'}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon danger"><i data-lucide="alert-circle"></i></div>
          <div class="stat-info">
            <span class="stat-label">Open Complaints</span>
            <span class="stat-value">${activeComplaintsCount} ${activeComplaintsCount === 1 ? 'Open' : 'Open'}</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i data-lucide="zap"></i> Quick Actions</div>
        </div>
        <div class="actions-grid">
          <a href="/student/apply-leave.html" class="action-card">
            <div class="action-icon"><i data-lucide="calendar-plus"></i></div>
            <div class="action-title">Apply Leave</div>
          </a>
          <a href="/student/leave-history.html" class="action-card">
            <div class="action-icon"><i data-lucide="clipboard-list"></i></div>
            <div class="action-title">Leave History</div>
          </a>
          <a href="/student/room.html" class="action-card">
            <div class="action-icon"><i data-lucide="bed"></i></div>
            <div class="action-title">My Room</div>
          </a>
          <a href="/student/complaints.html" class="action-card">
            <div class="action-icon"><i data-lucide="alert-triangle"></i></div>
            <div class="action-title">Submit Complaint</div>
          </a>
          <a href="/student/profile.html" class="action-card">
            <div class="action-icon"><i data-lucide="user"></i></div>
            <div class="action-title">My Profile</div>
          </a>
          <a href="/student/announcements.html" class="action-card">
            <div class="action-icon"><i data-lucide="megaphone"></i></div>
            <div class="action-title">Announcements</div>
          </a>
        </div>
      </div>

      <!-- Recent Tables Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem;">
        
        <!-- Recent Leaves -->
        <div class="card" style="margin-bottom:0;">
          <div class="card-header">
            <div class="card-title"><i data-lucide="calendar"></i> Recent Leave Requests</div>
            <a href="/student/leave-history.html" style="font-size:0.8rem; font-weight:600;">View All</a>
          </div>
          ${leaves.length === 0 ? `
            <div class="empty-state" style="padding:1.5rem 0;">No leave requests found.</div>
          ` : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Dates</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${leaves.map(l => `
                    <tr>
                      <td><strong>${l.leaveType}</strong></td>
                      <td>${formatDate(l.startDate)} - ${formatDate(l.endDate)}</td>
                      <td><span class="badge badge-${l.status.toLowerCase()}">${l.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

        <!-- Recent Complaints -->
        <div class="card" style="margin-bottom:0;">
          <div class="card-header">
            <div class="card-title"><i data-lucide="alert-circle"></i> Recent Complaints</div>
            <a href="/student/complaints.html" style="font-size:0.8rem; font-weight:600;">View All</a>
          </div>
          ${complaints.length === 0 ? `
            <div class="empty-state" style="padding:1.5rem 0;">No complaints found.</div>
          ` : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Subject</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${complaints.map(c => `
                    <tr>
                      <td><strong>${c.category}</strong></td>
                      <td>${c.subject}</td>
                      <td><span class="badge badge-${c.status.toLowerCase().replace(' ', '_')}">${c.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

      </div>

      <!-- Recent Announcements Section -->
      <div class="card" style="margin-top:1.5rem;">
        <div class="card-header">
          <div class="card-title"><i data-lucide="megaphone"></i> Recent Announcements</div>
          <a href="/student/announcements.html" style="font-size:0.8rem; font-weight:600;">View All</a>
        </div>
        ${recentAnnouncements.length === 0 ? `
          <div class="empty-state" style="padding:1.5rem 0;">No active announcements.</div>
        ` : `
          <div style="display:flex; flex-direction:column; gap:1rem;">
            ${recentAnnouncements.map(a => `
              <div style="padding:1rem; border:1px solid var(--border-color); border-radius:8px; display:flex; justify-content:space-between; align-items:flex-start; gap:1rem;">
                <div>
                  <div style="display:flex; align-items:center; gap:0.5rem; margin-bottom:0.35rem;">
                    <span class="badge badge-${a.priority.toLowerCase()}">${a.priority}</span>
                    <h4 style="font-size:0.95rem; font-weight:700;">${a.title}</h4>
                  </div>
                  <p style="font-size:0.85rem; color:var(--text-muted);">${a.description}</p>
                </div>
                <span style="font-size:0.75rem; color:var(--text-muted); white-space:nowrap;">${formatDate(a.createdAt)}</span>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    if (window.lucide) {
      lucide.createIcons();
    }
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Failed to load dashboard data. ${err.message}</div>`;
  }
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
