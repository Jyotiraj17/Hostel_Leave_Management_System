document.addEventListener('DOMContentLoaded', async () => {
  await loadAdminComplaints();
});

let allComplaintsData = [];

async function loadAdminComplaints() {
  const container = document.getElementById('complaints-container');
  if (!container) return;

  try {
    const res = await api.get('/admin/complaints');
    if (!res.success) {
      container.innerHTML = `<div class="empty-state">Unable to load complaints list.</div>`;
      return;
    }

    allComplaintsData = res.complaints || [];
    renderComplaintsTable(container, allComplaintsData);

    // Setup Status Filter Buttons
    const filterBtns = document.querySelectorAll('.complaint-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('btn-primary'));
        filterBtns.forEach(b => b.classList.add('btn-secondary'));
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');

        const status = btn.dataset.status;
        if (status === 'ALL') {
          renderComplaintsTable(container, allComplaintsData);
        } else {
          const filtered = allComplaintsData.filter(c => c.status.toUpperCase().replace(' ', '_') === status.toUpperCase());
          renderComplaintsTable(container, filtered);
        }
      });
    });

  } catch (err) {
    container.innerHTML = `<div class="empty-state">Failed to load complaints. ${err.message}</div>`;
  }
}

function renderComplaintsTable(container, complaints) {
  if (complaints.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 3rem 1rem;">
        <div class="empty-icon"><i data-lucide="check-circle-2"></i></div>
        <h3>No Complaints Found</h3>
        <p style="margin-top:0.35rem; color:var(--text-muted);">No student complaints match your selected filter.</p>
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
            <th>Category</th>
            <th>Subject & Details</th>
            <th>Submitted On</th>
            <th>Status</th>
            <th>Warden Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${complaints.map(c => {
            const s = c.studentId || {};
            return `
              <tr>
                <td>
                  <strong>${s.fullName || 'Student'}</strong>
                  <div style="font-size:0.75rem; color:var(--text-muted);">${s.rollNo ? 'Roll: ' + s.rollNo : ''}</div>
                </td>
                <td><strong>${c.category}</strong></td>
                <td>
                  <div style="font-weight:700;">${c.subject}</div>
                  <div style="font-size:0.8rem; color:var(--text-muted);">${c.description}</div>
                </td>
                <td>${formatDate(c.createdAt)}</td>
                <td><span class="badge badge-${c.status.toLowerCase().replace(' ', '_')}">${c.status}</span></td>
                <td>${c.remarks || '-'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  if (window.lucide) lucide.createIcons();
}

function formatDate(dStr) {
  if (!dStr) return '-';
  const d = new Date(dStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
