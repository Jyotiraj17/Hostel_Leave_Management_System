document.addEventListener('DOMContentLoaded', async () => {
  await loadAdminDashboard();
});

async function loadAdminDashboard() {
  const container = document.getElementById('dashboard-content');
  if (!container) return;

  try {
    const res = await api.get('/admin/dashboard');
    if (!res.success) {
      container.innerHTML = `<div class="empty-state">Unable to load admin dashboard overview.</div>`;
      return;
    }

    const { stats, recent } = res;

    container.innerHTML = `
      <div class="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, Admin! Here's your complete hostel overview.</p>
      </div>

      <!-- Stat Cards Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon primary"><i data-lucide="users"></i></div>
          <div class="stat-info">
            <span class="stat-label">Total Students</span>
            <span class="stat-value">${stats.totalStudents}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon info"><i data-lucide="user-check"></i></div>
          <div class="stat-info">
            <span class="stat-label">Total Wardens</span>
            <span class="stat-value">${stats.totalWardens}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon warning"><i data-lucide="building"></i></div>
          <div class="stat-info">
            <span class="stat-label">Total Rooms</span>
            <span class="stat-value">${stats.totalRooms}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon danger"><i data-lucide="bed"></i></div>
          <div class="stat-info">
            <span class="stat-label">Occupied Rooms</span>
            <span class="stat-value">${stats.occupiedRooms}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon success"><i data-lucide="check-circle"></i></div>
          <div class="stat-info">
            <span class="stat-label">Available Rooms</span>
            <span class="stat-value">${stats.availableRooms}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon warning"><i data-lucide="clock"></i></div>
          <div class="stat-info">
            <span class="stat-label">Pending Leaves</span>
            <span class="stat-value">${stats.pendingLeaves}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon danger"><i data-lucide="alert-circle"></i></div>
          <div class="stat-info">
            <span class="stat-label">Open Complaints</span>
            <span class="stat-value">${stats.activeComplaints}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon info"><i data-lucide="megaphone"></i></div>
          <div class="stat-info">
            <span class="stat-label">Active Announcements</span>
            <span class="stat-value">${recent.announcements ? recent.announcements.length : 0}</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i data-lucide="zap"></i> Quick Actions</div>
        </div>
        <div class="actions-grid">
          <a href="/admin/students.html" class="action-card">
            <div class="action-icon"><i data-lucide="user-plus"></i></div>
            <div class="action-title">Add Student</div>
          </a>
          <a href="/admin/wardens.html" class="action-card">
            <div class="action-icon"><i data-lucide="user-check"></i></div>
            <div class="action-title">Add Warden</div>
          </a>
          <a href="/admin/rooms.html" class="action-card">
            <div class="action-icon"><i data-lucide="bed"></i></div>
            <div class="action-title">Add Room</div>
          </a>
          <a href="/admin/leaves.html" class="action-card">
            <div class="action-icon"><i data-lucide="calendar"></i></div>
            <div class="action-title">View Leaves</div>
          </a>
          <a href="/admin/complaints.html" class="action-card">
            <div class="action-icon"><i data-lucide="alert-circle"></i></div>
            <div class="action-title">View Complaints</div>
          </a>
          <a href="/admin/announcements.html" class="action-card">
            <div class="action-icon"><i data-lucide="megaphone"></i></div>
            <div class="action-title">Create Announcement</div>
          </a>
          <a href="/admin/reports.html" class="action-card">
            <div class="action-icon"><i data-lucide="bar-chart-3"></i></div>
            <div class="action-title">View Reports</div>
          </a>
        </div>
      </div>

      <!-- Recent Tables Grid -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem;">
        
        <!-- Recent Students -->
        <div class="card" style="margin-bottom:0;">
          <div class="card-header">
            <div class="card-title"><i data-lucide="users"></i> Recent Students</div>
            <a href="/admin/students.html" style="font-size:0.8rem; font-weight:600;">View All</a>
          </div>
          ${!recent.students || recent.students.length === 0 ? `
            <div class="empty-state" style="padding:1.5rem 0;">No registered students.</div>
          ` : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Roll No</th>
                    <th>Dept</th>
                  </tr>
                </thead>
                <tbody>
                  ${recent.students.map(s => `
                    <tr>
                      <td><strong>${s.fullName}</strong></td>
                      <td><span style="color:var(--primary); font-weight:600;">${s.rollNo}</span></td>
                      <td>${s.department}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

        <!-- Recent Leaves -->
        <div class="card" style="margin-bottom:0;">
          <div class="card-header">
            <div class="card-title"><i data-lucide="calendar"></i> Recent Leaves</div>
            <a href="/admin/leaves.html" style="font-size:0.8rem; font-weight:600;">View All</a>
          </div>
          ${!recent.leaves || recent.leaves.length === 0 ? `
            <div class="empty-state" style="padding:1.5rem 0;">No recent leave requests.</div>
          ` : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Type</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  ${recent.leaves.map(l => `
                    <tr>
                      <td><strong>${l.studentId ? l.studentId.fullName : 'Student'}</strong></td>
                      <td>${l.leaveType}</td>
                      <td><span class="badge badge-${l.status.toLowerCase()}">${l.status}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>

      </div>
    `;

    if (window.lucide) {
      lucide.createIcons();
    }
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Failed to load admin dashboard. ${err.message}</div>`;
  }
}
