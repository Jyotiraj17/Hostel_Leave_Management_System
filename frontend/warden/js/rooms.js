document.addEventListener('DOMContentLoaded', async () => {
  await loadRoomsAndStudents();
  initAssignModalHandlers();
});

let allRoomsData = [];
let allStudentsData = [];

async function loadRoomsAndStudents() {
  const container = document.getElementById('rooms-container');
  if (!container) return;

  try {
    const [roomsRes, studentsRes] = await Promise.all([
      api.get('/warden/rooms'),
      api.get('/warden/students')
    ]);

    if (!roomsRes.success) {
      container.innerHTML = `<div class="empty-state">Unable to load rooms.</div>`;
      return;
    }

    allRoomsData = roomsRes.rooms || [];
    allStudentsData = studentsRes.success ? (studentsRes.students || []) : [];

    renderRoomsTable(container, allRoomsData);
    renderOccupancySummary(allRoomsData, allStudentsData);
    setupStatusFilters(container);

  } catch (err) {
    container.innerHTML = `<div class="empty-state">Failed to load room details. ${err.message}</div>`;
  }
}

function renderOccupancySummary(rooms, students) {
  const summaryEl = document.getElementById('occupancy-summary-card');
  if (!summaryEl) return;

  let totalCap = 0;
  let totalOcc = 0;

  rooms.forEach(r => {
    totalCap += (r.capacity || 0);
    totalOcc += (r.currentOccupants || 0);
  });

  const availableBeds = Math.max(0, totalCap - totalOcc);
  const percentage = totalCap > 0 ? Math.round((totalOcc / totalCap) * 100) : 0;
  const unassignedStudents = students.filter(s => !s.roomId || (typeof s.roomId === 'object' && !s.roomId._id));

  summaryEl.innerHTML = `
    <div class="card-header" style="display: flex; justify-content: space-between; align-items: center;">
      <div class="card-title"><i data-lucide="pie-chart"></i> Hostel Room Occupancy Overview</div>
      <button class="btn btn-primary btn-sm" id="summary-assign-btn" style="display: flex; align-items: center; gap: 6px;">
        <i data-lucide="user-plus" style="width: 16px; height: 16px;"></i> Assign Room
      </button>
    </div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1.25rem; text-align: center;">
      <div style="padding: 1rem; border-radius: 8px; background-color: var(--bg-color);">
        <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Total Capacity</div>
        <div style="font-size: 1.75rem; font-weight: 700; color: var(--text-main);">${totalCap} Beds</div>
      </div>
      <div style="padding: 1rem; border-radius: 8px; background-color: var(--info-bg);">
        <div style="font-size: 0.8rem; color: var(--info); font-weight: 600;">Occupied Beds</div>
        <div style="font-size: 1.75rem; font-weight: 700; color: var(--info);">${totalOcc} (${percentage}%)</div>
      </div>
      <div style="padding: 1rem; border-radius: 8px; background-color: var(--success-bg);">
        <div style="font-size: 0.8rem; color: var(--success); font-weight: 600;">Available Beds</div>
        <div style="font-size: 1.75rem; font-weight: 700; color: var(--success);">${availableBeds}</div>
      </div>
      <div style="padding: 1rem; border-radius: 8px; background-color: ${unassignedStudents.length > 0 ? 'var(--warning-bg)' : 'var(--bg-color)'};">
        <div style="font-size: 0.8rem; color: ${unassignedStudents.length > 0 ? 'var(--warning)' : 'var(--text-muted)'}; font-weight: 600;">Students Without Room</div>
        <div style="font-size: 1.75rem; font-weight: 700; color: ${unassignedStudents.length > 0 ? 'var(--warning)' : 'var(--text-main)'};">${unassignedStudents.length}</div>
      </div>
    </div>
  `;

  if (window.lucide) lucide.createIcons();

  const summaryBtn = document.getElementById('summary-assign-btn');
  if (summaryBtn) {
    summaryBtn.addEventListener('click', () => openAssignRoomModal());
  }
}

function setupStatusFilters(container) {
  const filterBtns = document.querySelectorAll('.room-filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('btn-primary'));
      filterBtns.forEach(b => b.classList.add('btn-secondary'));
      btn.classList.remove('btn-secondary');
      btn.classList.add('btn-primary');

      const status = btn.dataset.status;
      if (status === 'ALL') {
        renderRoomsTable(container, allRoomsData);
      } else {
        const filtered = allRoomsData.filter(r => r.status.toUpperCase().replace(' ', '_') === status.toUpperCase());
        renderRoomsTable(container, filtered);
      }
    });
  });
}

function renderRoomsTable(container, rooms) {
  if (rooms.length === 0) {
    container.innerHTML = `
      <div class="empty-state" style="padding: 3rem 1rem;">
        <div class="empty-icon"><i data-lucide="bed"></i></div>
        <h3>No Rooms Found</h3>
        <p style="margin-top:0.35rem; color:var(--text-muted);">No hostel rooms match your selected filter.</p>
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
            <th>Room Number</th>
            <th>Hostel & Block</th>
            <th>Floor</th>
            <th>Capacity</th>
            <th>Occupied</th>
            <th>Available</th>
            <th>Status</th>
            <th style="text-align: right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${rooms.map(r => `
            <tr>
              <td><strong style="font-size: 1rem;">Room ${r.roomNumber}</strong></td>
              <td>${r.hostel} / Block ${r.block}</td>
              <td>${r.floor}</td>
              <td>${r.capacity} Beds</td>
              <td><strong>${r.currentOccupants}</strong></td>
              <td><strong style="color: var(--success);">${r.availableBeds}</strong></td>
              <td><span class="badge badge-${r.status.toLowerCase().replace(' ', '_')}">${r.status}</span></td>
              <td>
                <div style="display: flex; align-items: center; justify-content: flex-end; gap: 8px; white-space: nowrap;">
                  <button class="btn-icon btn-icon-view view-occupants-btn" data-id="${r._id}" title="View Occupants (${r.occupants ? r.occupants.length : 0})" aria-label="View Occupants">
                    <i data-lucide="users"></i>
                  </button>
                  <button class="btn-icon btn-icon-assign assign-room-btn" data-id="${r._id}" title="Assign or Change Room" aria-label="Assign or Change Room">
                    <i data-lucide="user-plus"></i>
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

  // Attach View Occupants Event
  container.querySelectorAll('.view-occupants-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const roomId = btn.dataset.id;
      const room = rooms.find(r => r._id === roomId);
      if (!room) return;
      showOccupantsModal(room);
    });
  });

  // Attach Assign Room Event
  container.querySelectorAll('.assign-room-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      openAssignRoomModal(null, btn.dataset.id);
    });
  });
}

function showOccupantsModal(room) {
  let modalBody = document.getElementById('occupants-modal-body');
  if (!modalBody) return;

  const occupants = room.occupants || [];

  modalBody.innerHTML = `
    <h3 style="font-size: 1.1rem; font-weight: 700; margin-bottom: 1rem;">
      Room ${room.roomNumber} - ${room.hostel} Block ${room.block}
    </h3>

    ${occupants.length === 0 ? `
      <div class="empty-state">No active occupants assigned to this room.</div>
    ` : `
      <div style="display: flex; flex-direction: column; gap: 0.75rem;">
        ${occupants.map(o => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 0.75rem 1rem; border: 1px solid var(--border-color); border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 0.75rem;">
              <img src="${o.profilePhoto || '../assets/images/avatar-placeholder.png'}" onerror="this.src='../assets/images/avatar-placeholder.png'" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />
              <div>
                <strong style="color: var(--text-main);">${o.fullName}</strong>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${o.department} • Year ${o.year}</div>
              </div>
            </div>
            <strong style="color: var(--primary); font-size: 0.875rem;">Roll: ${o.rollNo}</strong>
          </div>
        `).join('')}
      </div>
    `}
  `;

  document.getElementById('occupants-modal').classList.add('show');
}

function openAssignRoomModal(preselectedStudentId = null, preselectedRoomId = null) {
  const studentSelect = document.getElementById('assign-student-select');
  const roomSelect = document.getElementById('assign-room-select');
  const studentInfoCard = document.getElementById('selected-student-info');
  const roomInfoCard = document.getElementById('selected-room-info');
  const alertCard = document.getElementById('change-room-alert');
  const submitBtn = document.getElementById('submit-assign-room-btn');
  const modalTitle = document.getElementById('assign-modal-title');
  const btnText = document.getElementById('assign-btn-text');

  if (!studentSelect || !roomSelect) return;

  // Populate Student Dropdown
  studentSelect.innerHTML = `<option value="">-- Select Student --</option>`;
  
  const unassigned = allStudentsData.filter(s => !s.roomId || (typeof s.roomId === 'object' && !s.roomId._id));
  const assigned = allStudentsData.filter(s => s.roomId && (typeof s.roomId === 'string' || s.roomId._id));

  if (unassigned.length > 0) {
    const groupUnassigned = document.createElement('optgroup');
    groupUnassigned.label = 'Students Awaiting Room Assignment';
    unassigned.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s._id;
      opt.textContent = `${s.rollNo} - ${s.fullName}`;
      groupUnassigned.appendChild(opt);
    });
    studentSelect.appendChild(groupUnassigned);
  }

  if (assigned.length > 0) {
    const groupAssigned = document.createElement('optgroup');
    groupAssigned.label = 'Assigned Students (Change Room)';
    assigned.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s._id;
      const currentRoomNum = typeof s.roomId === 'object' ? s.roomId.roomNumber : 'Assigned';
      opt.textContent = `${s.rollNo} - ${s.fullName} (Current: Room ${currentRoomNum})`;
      groupAssigned.appendChild(opt);
    });
    studentSelect.appendChild(groupAssigned);
  }

  // Populate Room Dropdown
  populateRoomDropdown(roomSelect, null, preselectedRoomId);

  // Reset details view
  studentInfoCard.style.display = 'none';
  roomInfoCard.style.display = 'none';
  alertCard.style.display = 'none';
  submitBtn.disabled = true;
  modalTitle.textContent = 'Assign Room';
  btnText.textContent = 'Assign Room';

  // Handle pre-selections
  if (preselectedStudentId) {
    studentSelect.value = preselectedStudentId;
    updateStudentDetails();
  }

  if (preselectedRoomId) {
    roomSelect.value = preselectedRoomId;
    updateRoomDetails();
  }

  // Add Change Listeners
  studentSelect.onchange = () => {
    updateStudentDetails();
    validateForm();
  };

  roomSelect.onchange = () => {
    updateRoomDetails();
    validateForm();
  };

  document.getElementById('assign-room-modal').classList.add('show');

  function populateRoomDropdown(selectEl, studentObj = null, forceRoomId = null) {
    selectEl.innerHTML = `<option value="">-- Select Available Room --</option>`;
    
    let availableRooms = allRoomsData.filter(r => r.availableBeds > 0 && r.status !== 'Full' && r.status !== 'Maintenance');

    // If preselected room is full but forceRoomId provided, keep it
    if (forceRoomId && !availableRooms.find(r => r._id === forceRoomId)) {
      const targetRoom = allRoomsData.find(r => r._id === forceRoomId);
      if (targetRoom) availableRooms.push(targetRoom);
    }

    // Filter by student gender / hostel if available
    if (studentObj && studentObj.hostel) {
      const matchingRooms = availableRooms.filter(r => r.hostel.toLowerCase().includes(studentObj.hostel.toLowerCase()));
      if (matchingRooms.length > 0) availableRooms = matchingRooms;
    }

    availableRooms.forEach(r => {
      const opt = document.createElement('option');
      opt.value = r._id;
      opt.textContent = `Room ${r.roomNumber} - ${r.hostel} • Block ${r.block} • Floor ${r.floor} (Available: ${r.availableBeds}/${r.capacity} Beds)`;
      if (r._id === forceRoomId) opt.selected = true;
      selectEl.appendChild(opt);
    });
  }

  function updateStudentDetails() {
    const studentId = studentSelect.value;
    if (!studentId) {
      studentInfoCard.style.display = 'none';
      alertCard.style.display = 'none';
      return;
    }

    const s = allStudentsData.find(st => st._id === studentId);
    if (!s) return;

    const currentRoomStr = s.roomId ? (typeof s.roomId === 'object' ? `Room ${s.roomId.roomNumber} (${s.roomId.hostel || ''})` : 'Assigned') : 'Not Assigned';
    const isChange = !!s.roomId;

    studentInfoCard.innerHTML = `
      <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.35rem;">
        <div><strong>Student:</strong> ${s.fullName} (${s.rollNo})</div>
        <div><strong>Dept / Year:</strong> ${s.department} • Year ${s.year} • Gender: ${s.gender || 'Not specified'}</div>
        <div><strong>Current Room:</strong> <span style="font-weight: 700; color: ${isChange ? 'var(--primary)' : 'var(--warning)'};">${currentRoomStr}</span></div>
      </div>
    `;
    studentInfoCard.style.display = 'block';

    if (isChange) {
      modalTitle.textContent = 'Change Room';
      btnText.textContent = 'Change Room';
    } else {
      modalTitle.textContent = 'Assign Room';
      btnText.textContent = 'Assign Room';
    }

    updateAlertText();
  }

  function updateRoomDetails() {
    const roomId = roomSelect.value;
    if (!roomId) {
      roomInfoCard.style.display = 'none';
      alertCard.style.display = 'none';
      return;
    }

    const r = allRoomsData.find(rm => rm._id === roomId);
    if (!r) return;

    roomInfoCard.innerHTML = `
      <div style="font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.35rem;">
        <div><strong>Selected Room:</strong> Room ${r.roomNumber} (${r.hostel} - Block ${r.block}, Floor ${r.floor})</div>
        <div><strong>Capacity:</strong> ${r.capacity} Beds • <strong>Occupied:</strong> ${r.currentOccupants} • <strong>Available:</strong> ${r.availableBeds}</div>
        <div><strong>Status:</strong> <span class="badge badge-${r.status.toLowerCase().replace(' ', '_')}">${r.status}</span></div>
      </div>
    `;
    roomInfoCard.style.display = 'block';

    updateAlertText();
  }

  function updateAlertText() {
    const studentId = studentSelect.value;
    const roomId = roomSelect.value;

    if (!studentId || !roomId) {
      alertCard.style.display = 'none';
      return;
    }

    const s = allStudentsData.find(st => st._id === studentId);
    const r = allRoomsData.find(rm => rm._id === roomId);

    if (s && s.roomId && r) {
      const oldRoomNum = typeof s.roomId === 'object' ? s.roomId.roomNumber : 'Current Room';
      alertCard.innerHTML = `
        <div style="font-weight: 700; margin-bottom: 0.25rem;">⚠️ Confirmation Required</div>
        <div>Are you sure you want to change <strong>${s.fullName}</strong>'s room?</div>
        <div style="font-weight: 700; margin-top: 0.35rem; color: var(--primary);">Room ${oldRoomNum} → Room ${r.roomNumber} (${r.hostel})</div>
      `;
      alertCard.style.display = 'block';
    } else {
      alertCard.style.display = 'none';
    }
  }

  function validateForm() {
    const studentId = studentSelect.value;
    const roomId = roomSelect.value;
    submitBtn.disabled = (!studentId || !roomId);
  }
}

function initAssignModalHandlers() {
  const assignForm = document.getElementById('assign-room-form');
  if (!assignForm) return;

  assignForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const studentId = document.getElementById('assign-student-select').value;
    const roomId = document.getElementById('assign-room-select').value;

    if (!studentId || !roomId) {
      toast.error('Please select both a student and a room.');
      return;
    }

    const submitBtn = document.getElementById('submit-assign-room-btn');
    submitBtn.disabled = true;

    try {
      const res = await api.post('/warden/rooms/assign', { studentId, roomId });
      if (res.success) {
        toast.success(res.message || 'Room assignment updated successfully!');
        document.getElementById('assign-room-modal').classList.remove('show');
        await loadRoomsAndStudents();
      } else {
        toast.error(res.message || 'Failed to assign room.');
      }
    } catch (err) {
      toast.error(err.message || 'Error assigning room.');
    } finally {
      submitBtn.disabled = false;
    }
  });
}
