document.addEventListener('DOMContentLoaded', () => {
  const complaintForm = document.getElementById('complaint-form');
  const listContainer = document.getElementById('complaints-list-container');

  if (complaintForm) {
    initComplaintForm(complaintForm, listContainer);
  }

  if (listContainer) {
    loadComplaintsList(listContainer);
  }
});

let allComplaintsData = [];

function initComplaintForm(form, listContainer) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const category = document.getElementById('category').value;
    const subject = document.getElementById('subject').value.trim();
    const description = document.getElementById('description').value.trim();

    if (!validator.isNotEmpty(category)) {
      toast.error('Please select a complaint category.');
      return;
    }

    if (!validator.isNotEmpty(subject)) {
      toast.error('Please provide a subject line.');
      return;
    }

    if (!validator.isNotEmpty(description)) {
      toast.error('Please describe your complaint issue.');
      return;
    }

    const submitBtn = document.getElementById('submit-complaint-btn');
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Submitting...';

    try {
      const res = await api.post('/student/complaints', {
        category,
        subject,
        description
      });

      if (res.success) {
        toast.success('Complaint submitted successfully!');
        form.reset();
        if (listContainer) {
          await loadComplaintsList(listContainer);
        }
      } else {
        toast.error(res.message || 'Failed to submit complaint.');
      }
    } catch (err) {
      toast.error(err.message || 'Error submitting complaint.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Submit Complaint';
    }
  });
}

async function loadComplaintsList(container) {
  try {
    const res = await api.get('/student/complaints');
    if (!res.success) {
      container.innerHTML = `<div class="empty-state">Unable to load complaints.</div>`;
      return;
    }

    allComplaintsData = res.complaints || [];
    renderComplaintsTable(container, allComplaintsData);

    // Attach Filter Buttons
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
    container.innerHTML = `<div class="empty-state">Failed to load complaints list. ${err.message}</div>`;
  }
}

function renderComplaintsTable(container, complaints) {
  if (complaints.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 2.5rem 1rem;">
        <div class="empty-icon"><i data-lucide="check-circle-2"></i></div>
        <h3>No Complaints Found</h3>
        <p style="margin-top:0.35rem; color:var(--text-muted);">You have no submitted complaints matching this filter.</p>
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
            <th>Category</th>
            <th>Subject & Description</th>
            <th>Date Submitted</th>
            <th>Status</th>
            <th>Warden Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${complaints.map(c => `
            <tr>
              <td><strong>${c.category}</strong></td>
              <td>
                <div style="font-weight:700;">${c.subject}</div>
                <div style="font-size:0.8rem; color:var(--text-muted);">${c.description}</div>
              </td>
              <td>${formatDate(c.createdAt)}</td>
              <td><span class="badge badge-${c.status.toLowerCase().replace(' ', '_')}">${c.status}</span></td>
              <td>${c.remarks || (c.resolvedAt ? 'Resolved on ' + formatDate(c.resolvedAt) : '-')}</td>
            </tr>
          `).join('')}
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
