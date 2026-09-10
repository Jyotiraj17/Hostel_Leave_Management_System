document.addEventListener('DOMContentLoaded', async () => {
  await loadLeaveRecords();
});

let allLeavesData = [];

async function loadLeaveRecords() {
  const container = document.getElementById('leaves-container');
  if (!container) return;

  try {
    const res = await api.get('/admin/leaves');
    if (!res.success) {
      container.innerHTML = `<div class="empty-state">Unable to load leave records.</div>`;
      return;
    }

    allLeavesData = res.leaves || [];
    renderLeavesTable(container, allLeavesData);

    // Setup Status Filter Buttons
    const filterBtns = document.querySelectorAll('.leave-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('btn-primary'));
        filterBtns.forEach(b => b.classList.add('btn-secondary'));
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');

        const status = btn.dataset.status;
        if (status === 'ALL') {
          renderLeavesTable(container, allLeavesData);
        } else {
          const filtered = allLeavesData.filter(l => l.status.toUpperCase() === status.toUpperCase());
          renderLeavesTable(container, filtered);
        }
      });
    });

  } catch (err) {
    container.innerHTML = `<div class="empty-state">Failed to load leave records. ${err.message}</div>`;
  }
}

function renderLeavesTable(container, leaves) {
  if (leaves.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 3rem 1rem;">
        <div class="empty-icon"><i data-lucide="clipboard-check"></i></div>
        <h3>No Leave Records Found</h3>
        <p style="margin-top:0.35rem; color:var(--text-muted);">No leave applications match your selected filter.</p>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = `
    <div class="table-responsive">
      <table class="data-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Roll Number</th>
            <th>Leave Type</th>
            <th>Dates</th>
            <th>Destination & Contact</th>
            <th>Status</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${leaves.map(l => {
            const s = l.studentId || {};
            return `
              <tr>
                <td>
                  <strong>${s.fullName || 'Student'}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${s.email || ''}</div>
                </td>
                <td><strong style="color:var(--primary);">${s.rollNo || '-'}</strong></td>
                <td><strong>${l.leaveType}</strong></td>
                <td>${formatDate(l.startDate)} - ${formatDate(l.endDate)}</td>
                <td>
                  <div>${l.destination}</div>
                  <small style="color:var(--text-muted);">Emerg: ${l.emergencyContact}</small>
                </td>
                <td><span class="badge badge-${l.status.toLowerCase()}">${l.status}</span></td>
                <td>
                  <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; white-space: nowrap;">
                    <button class="btn-icon btn-icon-view view-leave-btn" data-id="${l._id}" title="View Details">
                      <i data-lucide="eye"></i>
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // Attach View Event
  container.querySelectorAll('.view-leave-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const l = leaves.find(item => item._id === btn.dataset.id);
      if (!l) return;

      const s = l.studentId || {};

      const modalBody = document.getElementById('leave-view-body');
      modalBody.innerHTML = `
        <div style="margin-bottom: 1.25rem;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--text-main);">${s.fullName || 'Student'} (${s.rollNo || '-'})</h3>
          <p style="font-size: 0.85rem; color: var(--text-muted);">${s.department || ''} • Year ${s.year || ''}</p>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.875rem;">
          <div><strong>Leave Type:</strong> ${l.leaveType}</div>
          <div><strong>Status:</strong> <span class="badge badge-${l.status.toLowerCase()}">${l.status}</span></div>
          <div><strong>Start Date:</strong> ${formatDate(l.startDate)}</div>
          <div><strong>End Date:</strong> ${formatDate(l.endDate)}</div>
          <div><strong>Destination:</strong> ${l.destination}</div>
          <div><strong>Emergency Contact:</strong> ${l.emergencyContact}</div>
          <div style="grid-column: 1 / -1;"><strong>Address During Leave:</strong> ${l.leaveAddress}</div>
          <div style="grid-column: 1 / -1;"><strong>Reason:</strong> ${l.reason}</div>
          ${l.wardenRemarks ? `<div style="grid-column: 1 / -1; color: var(--primary);"><strong>Warden Remarks:</strong> ${l.wardenRemarks}</div>` : ''}
        </div>
      `;

      document.getElementById('leave-view-modal').classList.add('show');
    });
  });
}

function formatDate(dStr) {
  if (!dStr) return '-';
  const d = new Date(dStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
