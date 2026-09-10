document.addEventListener('DOMContentLoaded', async () => {
  await loadWardensList();
  initWardenFormHandlers();
});

let allWardensData = [];

async function loadWardensList() {
  const container = document.getElementById('wardens-container');
  if (!container) return;

  try {
    const res = await api.get('/admin/wardens');
    if (!res.success) {
      container.innerHTML = `<div class="empty-state">Unable to load wardens list.</div>`;
      return;
    }

    allWardensData = res.wardens || [];
    renderWardensTable(container, allWardensData);
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Failed to load warden records. ${err.message}</div>`;
  }
}

function renderWardensTable(container, wardens) {
  if (wardens.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 3rem 1rem;">
        <div class="empty-icon"><i data-lucide="user-check"></i></div>
        <h3>No Wardens Registered</h3>
        <p style="margin-top:0.35rem; color:var(--text-muted);">Click "Add New Warden" above to register a hostel warden.</p>
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
            <th>Warden Name</th>
            <th>Email Address</th>
            <th>Phone</th>
            <th>Assigned Hostel & Block</th>
            <th>Status</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${wardens.map(w => `
            <tr>
              <td><strong style="color: var(--text-main); font-size: 0.95rem;">${w.fullName}</strong></td>
              <td>${w.email}</td>
              <td>${w.phone || '-'}</td>
              <td>${w.hostel || 'Main Hostel'} / Block ${w.block || 'A'}</td>
              <td><span class="badge badge-${w.status === 'active' ? 'active' : 'cancelled'}">${w.status}</span></td>
              <td>
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; white-space: nowrap;">
                  <button class="btn-icon btn-icon-edit edit-warden-btn" data-id="${w._id}" title="Edit Warden">
                    <i data-lucide="edit"></i>
                  </button>
                  <button class="btn-icon btn-icon-delete delete-warden-btn" data-id="${w._id}" data-name="${w.fullName}" title="Delete Warden">
                    <i data-lucide="trash-2"></i>
                  </button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  // Attach Edit Event
  container.querySelectorAll('.edit-warden-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const w = allWardensData.find(item => item._id === btn.dataset.id);
      if (!w) return;

      document.getElementById('edit-warden-id').value = w._id;
      document.getElementById('edit-w-fullName').value = w.fullName;
      document.getElementById('edit-w-phone').value = w.phone || '';
      document.getElementById('edit-w-hostel').value = w.hostel || '';
      document.getElementById('edit-w-block').value = w.block || '';
      document.getElementById('edit-w-status').value = w.status || 'active';

      document.getElementById('edit-warden-modal').classList.add('show');
    });
  });

  // Attach Delete Event
  container.querySelectorAll('.delete-warden-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;

      if (!confirm(`Are you sure you want to delete warden "${name}"?`)) return;

      try {
        const res = await api.delete(`/admin/wardens/${id}`);
        if (res.success) {
          toast.success('Warden deleted successfully.');
          await loadWardensList();
        } else {
          toast.error(res.message || 'Failed to delete warden.');
        }
      } catch (err) {
        toast.error(err.message || 'Error deleting warden.');
      }
    });
  });
}

function initWardenFormHandlers() {
  // Add Warden Form Submit
  const addForm = document.getElementById('add-warden-form');
  if (addForm) {
    addForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullName = document.getElementById('add-w-fullName').value.trim();
      const email = document.getElementById('add-w-email').value.trim();
      const password = document.getElementById('add-w-password').value.trim();
      const phone = document.getElementById('add-w-phone').value.trim();
      const hostel = document.getElementById('add-w-hostel').value.trim();
      const block = document.getElementById('add-w-block').value.trim();

      if (!fullName || !email || !phone) {
        toast.error('Please fill in all required fields.');
        return;
      }

      const saveBtn = document.getElementById('save-warden-btn');
      saveBtn.disabled = true;

      try {
        const res = await api.post('/admin/wardens', { fullName, email, password, phone, hostel, block });
        if (res.success) {
          toast.success('Warden added successfully!');
          document.getElementById('add-warden-modal').classList.remove('show');
          addForm.reset();
          await loadWardensList();
        } else {
          toast.error(res.message || 'Failed to add warden.');
        }
      } catch (err) {
        toast.error(err.message || 'Error adding warden.');
      } finally {
        saveBtn.disabled = false;
      }
    });
  }

  // Edit Warden Form Submit
  const editForm = document.getElementById('edit-warden-form');
  if (editForm) {
    editForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('edit-warden-id').value;
      const fullName = document.getElementById('edit-w-fullName').value.trim();
      const phone = document.getElementById('edit-w-phone').value.trim();
      const hostel = document.getElementById('edit-w-hostel').value.trim();
      const block = document.getElementById('edit-w-block').value.trim();
      const status = document.getElementById('edit-w-status').value;

      const updateBtn = document.getElementById('update-warden-btn');
      updateBtn.disabled = true;

      try {
        const res = await api.put(`/admin/wardens/${id}`, { fullName, phone, hostel, block, status });
        if (res.success) {
          toast.success('Warden information updated.');
          document.getElementById('edit-warden-modal').classList.remove('show');
          await loadWardensList();
        } else {
          toast.error(res.message || 'Failed to update warden.');
        }
      } catch (err) {
        toast.error(err.message || 'Error updating warden.');
      } finally {
        updateBtn.disabled = false;
      }
    });
  }
}
