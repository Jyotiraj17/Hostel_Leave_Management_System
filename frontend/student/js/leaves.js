document.addEventListener('DOMContentLoaded', () => {
  const applyForm = document.getElementById('leave-apply-form');
  const historyContainer = document.getElementById('leave-history-container');

  if (applyForm) {
    initApplyForm(applyForm);
  }

  if (historyContainer) {
    initLeaveHistory(historyContainer);
  }
});

// --- APPLY LEAVE FORM HANDLER ---
function initApplyForm(form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const leaveType = document.getElementById('leaveType').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const destination = document.getElementById('destination').value.trim();
    const leaveAddress = document.getElementById('leaveAddress').value.trim();
    const reason = document.getElementById('reason').value.trim();
    const emergencyContact = document.getElementById('emergencyContact').value.trim();
    const remarks = document.getElementById('remarks') ? document.getElementById('remarks').value.trim() : '';

    if (!validator.isNotEmpty(leaveType)) {
      toast.error('Please select a leave type.');
      return;
    }

    if (!validator.isNotEmpty(startDate) || !validator.isNotEmpty(endDate)) {
      toast.error('Please specify both start and end dates.');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      toast.error('End date cannot be before start date.');
      return;
    }

    if (!validator.isNotEmpty(reason)) {
      toast.error('Please provide a reason for leave.');
      return;
    }

    if (!validator.isNotEmpty(destination) || !validator.isNotEmpty(leaveAddress) || !validator.isNotEmpty(emergencyContact)) {
      toast.error('Destination, address during leave, and emergency contact are required.');
      return;
    }

    const submitBtn = document.getElementById('submit-leave-btn');
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Submitting Request...';

    try {
      const res = await api.post('/student/leaves', {
        leaveType,
        startDate,
        endDate,
        reason,
        destination,
        leaveAddress,
        emergencyContact,
        remarks
      });

      if (res.success) {
        toast.success('Leave application submitted successfully!');
        setTimeout(() => {
          window.location.href = '/student/leave-history.html';
        }, 1000);
      } else {
        toast.error(res.message || 'Failed to submit leave application.');
      }
    } catch (err) {
      toast.error(err.message || 'Error submitting leave request.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Submit Leave Application';
    }
  });
}

// --- LEAVE HISTORY HANDLER ---
let allLeavesData = [];

async function initLeaveHistory(container) {
  try {
    const res = await api.get('/student/leaves');
    if (!res.success) {
      container.innerHTML = `<div class="empty-state">Unable to load leave history.</div>`;
      return;
    }

    allLeavesData = res.leaves || [];
    renderLeaveHistoryTable(container, allLeavesData);

    // Filter Buttons
    const filterBtns = document.querySelectorAll('.status-filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('btn-primary'));
        filterBtns.forEach(b => b.classList.add('btn-secondary'));
        btn.classList.remove('btn-secondary');
        btn.classList.add('btn-primary');

        const filter = btn.dataset.filter;
        if (filter === 'ALL') {
          renderLeaveHistoryTable(container, allLeavesData);
        } else {
          const filtered = allLeavesData.filter(l => l.status.toUpperCase() === filter.toUpperCase());
          renderLeaveHistoryTable(container, filtered);
        }
      });
    });

  } catch (err) {
    container.innerHTML = `<div class="empty-state">Failed to load leave records. ${err.message}</div>`;
  }
}

function renderLeaveHistoryTable(container, leaves) {
  if (leaves.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 3rem 1rem;">
        <div class="empty-icon"><i data-lucide="clipboard"></i></div>
        <h3>No Leave Records Found</h3>
        <p style="margin-top:0.35rem; color:var(--text-muted);">You have not applied for any leave requests in this category.</p>
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
            <th>Leave Type</th>
            <th>Dates</th>
            <th>Reason & Destination</th>
            <th>Applied On</th>
            <th>Status</th>
            <th>Remarks</th>
            <th style="text-align: right;">Action</th>
          </tr>
        </thead>
        <tbody>
          ${leaves.map(l => `
            <tr>
              <td><strong>${l.leaveType}</strong></td>
              <td>${formatDate(l.startDate)} - ${formatDate(l.endDate)}</td>
              <td>
                <div>${l.reason}</div>
                <small style="color:var(--text-muted);"><i data-lucide="map-pin" style="width:12px; height:12px; display:inline;"></i> ${l.destination}</small>
              </td>
              <td>${formatDate(l.appliedAt || l.createdAt)}</td>
              <td><span class="badge badge-${l.status.toLowerCase()}">${l.status}</span></td>
              <td>${l.wardenRemarks || l.remarks || '-'}</td>
              <td>
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; white-space: nowrap;">
                  ${l.status === 'Pending' ? `
                    <button class="btn-icon btn-icon-delete cancel-leave-btn" data-id="${l._id}" title="Cancel Leave Request">
                      <i data-lucide="x-circle"></i>
                    </button>
                  ` : '<span style="color:var(--text-muted); font-size:0.8rem;">-</span>'}
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // Attach Cancel Event Listeners
  const cancelBtns = container.querySelectorAll('.cancel-leave-btn');
  cancelBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const leaveId = btn.dataset.id;
      if (!confirm('Are you sure you want to cancel this pending leave request?')) return;

      try {
        btn.disabled = true;
        const res = await api.patch(`/student/leaves/${leaveId}/cancel`, {});
        if (res.success) {
          toast.success('Leave request cancelled successfully.');
          await initLeaveHistory(container);
        } else {
          toast.error(res.message || 'Failed to cancel leave request.');
        }
      } catch (err) {
        toast.error(err.message || 'Error cancelling leave request.');
      }
    });
  });
}

function formatDate(dStr) {
  if (!dStr) return '-';
  const d = new Date(dStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
