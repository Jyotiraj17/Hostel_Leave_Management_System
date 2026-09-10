document.addEventListener('DOMContentLoaded', async () => {
  await loadStudentsList();
});

let allStudentsData = [];

async function loadStudentsList() {
  const container = document.getElementById('students-container');
  if (!container) return;

  try {
    const res = await api.get('/warden/students');
    if (!res.success) {
      container.innerHTML = `<div class="empty-state">Unable to load students.</div>`;
      return;
    }

    allStudentsData = res.students || [];
    renderStudentsTable(container, allStudentsData);

    // Setup Search & Filter
    const searchInput = document.getElementById('student-search');
    const deptFilter = document.getElementById('dept-filter');

    const applyFilter = () => {
      const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const dept = deptFilter ? deptFilter.value : '';

      let filtered = allStudentsData;

      if (dept) {
        filtered = filtered.filter(s => s.department === dept);
      }

      if (query) {
        filtered = filtered.filter(s => 
          (s.fullName && s.fullName.toLowerCase().includes(query)) ||
          (s.rollNo && s.rollNo.toLowerCase().includes(query)) ||
          (s.email && s.email.toLowerCase().includes(query))
        );
      }

      renderStudentsTable(container, filtered);
    };

    if (searchInput) searchInput.addEventListener('input', applyFilter);
    if (deptFilter) deptFilter.addEventListener('change', applyFilter);

  } catch (err) {
    container.innerHTML = `<div class="empty-state">Failed to load student records. ${err.message}</div>`;
  }
}

function renderStudentsTable(container, students) {
  if (students.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 3rem 1rem;">
        <div class="empty-icon"><i data-lucide="users"></i></div>
        <h3>No Students Found</h3>
        <p style="margin-top:0.35rem; color:var(--text-muted);">No student records match your search or filter criteria.</p>
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
            <th>Department & Year</th>
            <th>Contact Phone</th>
            <th>Hostel & Room</th>
            <th>Status</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${students.map(s => `
            <tr>
              <td>
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <img src="${s.profilePhoto || '../assets/images/avatar-placeholder.png'}" onerror="this.src='../assets/images/avatar-placeholder.png'" alt="${s.fullName}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;" />
                  <div>
                    <strong style="color: var(--text-main);">${s.fullName}</strong>
                    <div style="font-size: 0.75rem; color: var(--text-muted);">${s.email}</div>
                  </div>
                </div>
              </td>
              <td><strong style="color: var(--primary);">${s.rollNo}</strong></td>
              <td>${s.department} (Yr ${s.year})</td>
              <td>${s.phone}</td>
              <td>${s.hostel ? s.hostel + ' / ' : ''}${s.roomId ? 'Room ' + (s.roomId.roomNumber || s.roomId) : 'Unassigned'}</td>
              <td><span class="badge badge-${s.status === 'active' ? 'active' : 'cancelled'}">${s.status}</span></td>
              <td>
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; white-space: nowrap;">
                  <button class="btn-icon btn-icon-view view-student-btn" data-id="${s._id}" title="View Student">
                    <i data-lucide="eye"></i>
                  </button>
                  <button class="btn-icon btn-icon-edit edit-student-btn" data-id="${s._id}" title="Edit Student">
                    <i data-lucide="edit"></i>
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

  // Attach View Event
  container.querySelectorAll('.view-student-btn').forEach(btn => {
    btn.addEventListener('click', () => openViewModal(btn.dataset.id));
  });

  // Attach Edit Event
  container.querySelectorAll('.edit-student-btn').forEach(btn => {
    btn.addEventListener('click', () => openEditModal(btn.dataset.id));
  });
}

// View Student Details Modal
async function openViewModal(studentId) {
  try {
    const res = await api.get(`/warden/students/${studentId}`);
    if (!res.success || !res.student) {
      toast.error('Unable to fetch student details.');
      return;
    }

    const s = res.student;
    const roomNo = s.roomId ? (s.roomId.roomNumber || s.roomId) : 'Unassigned';

    const modalBody = document.getElementById('view-modal-body');
    modalBody.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.5rem;">
        <img src="${s.profilePhoto || '../assets/images/avatar-placeholder.png'}" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; border: 3px solid var(--primary-light);" />
        <h3 style="font-size: 1.2rem; font-weight: 700; margin-top: 0.5rem;">${s.fullName}</h3>
        <span style="color: var(--primary); font-weight: 600; font-size: 0.875rem;">Roll Number: ${s.rollNo}</span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; font-size: 0.875rem;">
        <div><strong>Email:</strong> ${s.email}</div>
        <div><strong>Phone:</strong> ${s.phone}</div>
        <div><strong>Department:</strong> ${s.department}</div>
        <div><strong>Year:</strong> Year ${s.year}</div>
        <div><strong>Gender:</strong> ${s.gender}</div>
        <div><strong>Status:</strong> <span class="badge badge-${s.status === 'active' ? 'active' : 'cancelled'}">${s.status}</span></div>
        <div><strong>Hostel & Block:</strong> ${s.hostel || '-'} / ${s.block || '-'}</div>
        <div><strong>Room Number:</strong> ${roomNo}</div>
        <div><strong>Guardian Name:</strong> ${s.guardianName || '-'}</div>
        <div><strong>Guardian Phone:</strong> ${s.guardianPhone || '-'}</div>
        <div style="grid-column: 1 / -1;"><strong>Address:</strong> ${s.address || '-'}</div>
      </div>
    `;

    document.getElementById('view-student-modal').classList.add('show');
  } catch (err) {
    toast.error('Failed to load student details.');
  }
}

// Edit Student Modal
async function openEditModal(studentId) {
  try {
    const res = await api.get(`/warden/students/${studentId}`);
    if (!res.success || !res.student) return;

    const s = res.student;

    document.getElementById('edit-student-id').value = s._id;
    document.getElementById('edit-fullName').value = s.fullName;
    document.getElementById('edit-phone').value = s.phone;
    document.getElementById('edit-department').value = s.department;
    document.getElementById('edit-year').value = s.year;
    document.getElementById('edit-gender').value = s.gender;
    document.getElementById('edit-hostel').value = s.hostel || '';
    document.getElementById('edit-block').value = s.block || '';
    document.getElementById('edit-guardianName').value = s.guardianName || '';
    document.getElementById('edit-guardianPhone').value = s.guardianPhone || '';
    document.getElementById('edit-address').value = s.address || '';

    document.getElementById('edit-student-modal').classList.add('show');
  } catch (err) {
    toast.error('Failed to prepare student editor.');
  }
}
