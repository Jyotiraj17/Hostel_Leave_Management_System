document.addEventListener('DOMContentLoaded', async () => {
  await loadWardenDashboard();
});

async function loadWardenDashboard() {
  const container = document.getElementById('dashboard-content');
  if (!container) return;

  try {
    const res = await api.get('/warden/dashboard');
    if (!res.success) {
      container.innerHTML = `<div class="empty-state">Unable to load dashboard metrics.</div>`;
      return;
    }

    const { stats, recent } = res;
    const wardenProfileRes = await api.get('/warden/profile');
    const wardenName = (wardenProfileRes.success && wardenProfileRes.warden) ? wardenProfileRes.warden.fullName : 'Warden';

    container.innerHTML = `
      <div class="page-header">
        <h1>Welcome back, ${wardenName}!</h1>
        <p>Here's your hostel operational overview.</p>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon primary"><i data-lucide="users"></i></div>
          <div class="stat-info">
            <span class="stat-label">Total Students</span>
            <span class="stat-value">${stats.totalStudents}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon success"><i data-lucide="user-check"></i></div>
          <div class="stat-info">
            <span class="stat-label">Present Students</span>
            <span class="stat-value">${stats.presentStudents}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon info"><i data-lucide="user-minus"></i></div>
          <div class="stat-info">
            <span class="stat-label">On Leave</span>
            <span class="stat-value">${stats.studentsOnLeave}</span>
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
            <span class="stat-value">${stats.openComplaints}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon primary"><i data-lucide="bed"></i></div>
          <div class="stat-info">
            <span class="stat-label">Total Rooms</span>
            <span class="stat-value">${stats.roomOccupancy}</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions Grid -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i data-lucide="zap"></i> Quick Actions</div>
        </div>
        <div class="actions-grid">
          <a href="/warden/students.html" class="action-card">
            <div class="action-icon"><i data-lucide="users"></i></div>
            <div class="action-title">View Students</div>
          </a>
          <a href="/warden/leaves.html" class="action-card">
            <div class="action-icon"><i data-lucide="calendar"></i></div>
            <div class="action-title">View Leave Requests</div>
          </a>
          <a href="/warden/rooms.html" class="action-card">
            <div class="action-icon"><i data-lucide="bed"></i></div>
            <div class="action-title">View Rooms</div>
          </a>
          <a href="/warden/complaints.html" class="action-card">
            <div class="action-icon"><i data-lucide="alert-circle"></i></div>
            <div class="action-title">View Complaints</div>
          </a>
          <a href="/warden/announcements.html" class="action-card">
            <div class="action-icon"><i data-lucide="megaphone"></i></div>
            <div class="action-title">Create Announcement</div>
          </a>
        </div>
      </div>

      <!-- Recent Tables -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(340px, 1fr)); gap: 1.5rem;">
        
        <!-- Recent Leaves -->
        <div class="card" style="margin-bottom:0;">
          <div class="card-header">
            <div class="card-title"><i data-lucide="calendar"></i> Recent Leave Requests</div>
            <a href="/warden/leaves.html" style="font-size:0.8rem; font-weight:600;">View All</a>
          </div>
          ${!recent.leaves || recent.leaves.length === 0 ? `
            <div class="empty-state" style="padding:1.5rem 0;">No pending leave requests.</div>
          ` : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th style="text-align:right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${recent.leaves.map(l => `
                    <tr>
                      <td>
                        <strong>${l.studentId ? l.studentId.fullName : 'Student'}</strong>
                        <div style="font-size:0.75rem; color:var(--text-muted);">${l.studentId ? l.studentId.rollNo : ''}</div>
                      </td>
                      <td>${l.leaveType}</td>
                      <td><span class="badge badge-${l.status.toLowerCase()}">${l.status}</span></td>
                      <td>
                        <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; white-space: nowrap;">
                          <a href="/warden/leaves.html" class="btn-icon btn-icon-view" title="Review Leaves">
                            <i data-lucide="eye"></i>
                          </a>
                        </div>
                      </td>
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
            <a href="/warden/complaints.html" style="font-size:0.8rem; font-weight:600;">View All</a>
          </div>
          ${!recent.complaints || recent.complaints.length === 0 ? `
            <div class="empty-state" style="padding:1.5rem 0;">No active complaints.</div>
          ` : `
            <div class="table-responsive">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th style="text-align:right;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${recent.complaints.map(c => `
                    <tr>
                      <td>
                        <strong>${c.studentId ? c.studentId.fullName : 'Student'}</strong>
                      </td>
                      <td>${c.category}</td>
                      <td><span class="badge badge-${c.status.toLowerCase().replace(' ', '_')}">${c.status}</span></td>
                      <td>
                        <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; white-space: nowrap;">
                          <a href="/warden/complaints.html" class="btn-icon btn-icon-edit" title="Update Complaints">
                            <i data-lucide="edit"></i>
                          </a>
                        </div>
                      </td>
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
    container.innerHTML = `<div class="empty-state">Failed to load warden dashboard. ${err.message}</div>`;
  }
}
