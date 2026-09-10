document.addEventListener('DOMContentLoaded', async () => {
  await loadReport('students');
  setupReportTypeSelector();
});

function setupReportTypeSelector() {
  const btns = document.querySelectorAll('.report-type-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', async () => {
      btns.forEach(b => b.classList.remove('btn-primary'));
      btns.forEach(b => b.classList.add('btn-secondary'));
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');

      const reportType = btn.dataset.type;
      await loadReport(reportType);
    });
  });
}

async function loadReport(reportType) {
  const container = document.getElementById('report-container');
  if (!container) return;

  container.innerHTML = `<div class="loading-spinner"><p>Loading ${reportType} report...</p></div>`;

  try {
    const res = await api.get(`/admin/reports?reportType=${reportType}`);
    if (!res.success) {
      container.innerHTML = `<div class="empty-state">Unable to load report.</div>`;
      return;
    }

    renderReportView(container, reportType, res.data || []);
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Failed to load report data. ${err.message}</div>`;
  }
}

function renderReportView(container, type, data) {
  if (data.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 3rem 1rem;">
        <div class="empty-icon"><i data-lucide="bar-chart-2"></i></div>
        <h3>No Data Available for ${capitalize(type)} Report</h3>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  let title = `${capitalize(type)} System Report`;
  let tableHeader = '';
  let tableRows = '';

  if (type === 'students') {
    tableHeader = `
      <tr>
        <th>Student Name</th>
        <th>Roll Number</th>
        <th>Department & Year</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Room</th>
      </tr>
    `;
    tableRows = data.map(s => `
      <tr>
        <td><strong>${s.fullName}</strong></td>
        <td><strong style="color:var(--primary);">${s.rollNo}</strong></td>
        <td>${s.department} (${s.year})</td>
        <td>${s.email}</td>
        <td>${s.phone}</td>
        <td>${s.roomId ? 'Room ' + (s.roomId.roomNumber || s.roomId) : 'Unassigned'}</td>
      </tr>
    `).join('');
  } else if (type === 'wardens') {
    tableHeader = `
      <tr>
        <th>Warden Name</th>
        <th>Email Address</th>
        <th>Phone</th>
        <th>Assigned Hostel</th>
        <th>Block</th>
        <th>Status</th>
      </tr>
    `;
    tableRows = data.map(w => `
      <tr>
        <td><strong>${w.fullName}</strong></td>
        <td>${w.email}</td>
        <td>${w.phone || '-'}</td>
        <td>${w.hostel || 'Main Hostel'}</td>
        <td>Block ${w.block || 'A'}</td>
        <td><span class="badge badge-${w.status === 'active' ? 'active' : 'cancelled'}">${w.status}</span></td>
      </tr>
    `).join('');
  } else if (type === 'rooms') {
    tableHeader = `
      <tr>
        <th>Room Number</th>
        <th>Hostel & Block</th>
        <th>Floor</th>
        <th>Capacity</th>
        <th>Occupied</th>
        <th>Status</th>
      </tr>
    `;
    tableRows = data.map(r => `
      <tr>
        <td><strong>Room ${r.roomNumber}</strong></td>
        <td>${r.hostel} / Block ${r.block}</td>
        <td>Floor ${r.floor}</td>
        <td>${r.capacity} Beds</td>
        <td><strong>${r.currentOccupants}</strong></td>
        <td><span class="badge badge-${r.status.toLowerCase().replace(' ', '_')}">${r.status}</span></td>
      </tr>
    `).join('');
  } else if (type === 'leaves') {
    tableHeader = `
      <tr>
        <th>Student</th>
        <th>Leave Type</th>
        <th>Dates</th>
        <th>Destination</th>
        <th>Reason</th>
        <th>Status</th>
      </tr>
    `;
    tableRows = data.map(l => `
      <tr>
        <td><strong>${l.studentId ? l.studentId.fullName : 'Student'}</strong></td>
        <td>${l.leaveType}</td>
        <td>${formatDate(l.startDate)} - ${formatDate(l.endDate)}</td>
        <td>${l.destination}</td>
        <td>${l.reason}</td>
        <td><span class="badge badge-${l.status.toLowerCase()}">${l.status}</span></td>
      </tr>
    `).join('');
  } else if (type === 'complaints') {
    tableHeader = `
      <tr>
        <th>Student</th>
        <th>Category</th>
        <th>Subject</th>
        <th>Submitted Date</th>
        <th>Status</th>
      </tr>
    `;
    tableRows = data.map(c => `
      <tr>
        <td><strong>${c.studentId ? c.studentId.fullName : 'Student'}</strong></td>
        <td>${c.category}</td>
        <td>${c.subject}</td>
        <td>${formatDate(c.createdAt)}</td>
        <td><span class="badge badge-${c.status.toLowerCase().replace(' ', '_')}">${c.status}</span></td>
      </tr>
    `).join('');
  }

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">${title}</h3>
      <span style="font-size: 0.85rem; color: var(--text-muted); font-weight: 600;">Total Records: ${data.length}</span>
    </div>

    <div class="table-responsive">
      <table class="data-table">
        <thead>${tableHeader}</thead>
        <tbody>${tableRows}</tbody>
      </table>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function formatDate(dStr) {
  if (!dStr) return '-';
  const d = new Date(dStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
