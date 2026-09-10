document.addEventListener('DOMContentLoaded', async () => {
  await loadRoomInformation();
});

async function loadRoomInformation() {
  const container = document.getElementById('room-content');
  if (!container) return;

  try {
    const res = await api.get('/student/room');
    if (!res.success) {
      container.innerHTML = `<div class="empty-state">Unable to load room details.</div>`;
      return;
    }

    if (!res.assigned || !res.room) {
      container.innerHTML = `
        <div class="page-header">
          <h1>My Room</h1>
          <p>Hostel room allocation and roommate details.</p>
        </div>
        <div class="card empty-state" style="padding: 4rem 2rem;">
          <div class="empty-icon"><i data-lucide="bed-double"></i></div>
          <h2>No Room Assigned Yet</h2>
          <p style="margin-top: 0.5rem; color: var(--text-muted);">You do not currently have a hostel room assigned. Please contact your warden or administrator for room allocation.</p>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    const room = res.room;
    const occupied = room.capacity - (room.availableBeds !== undefined ? room.availableBeds : 0);
    const available = room.capacity - room.roommates.length - 1;

    container.innerHTML = `
      <div class="page-header">
        <h1>My Room</h1>
        <p>Hostel room allocation details and roommates.</p>
      </div>

      <!-- Room Key Stat Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon primary"><i data-lucide="hash"></i></div>
          <div class="stat-info">
            <span class="stat-label">Room Number</span>
            <span class="stat-value">Room ${room.roomNumber}</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon info"><i data-lucide="building"></i></div>
          <div class="stat-info">
            <span class="stat-label">Hostel & Block</span>
            <span class="stat-value">${room.hostel} - ${room.block}</span>
            <span style="font-size:0.75rem; color:var(--text-muted);">${getOrdinalFloor(room.floor)} Floor</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon warning"><i data-lucide="users"></i></div>
          <div class="stat-info">
            <span class="stat-label">Room Capacity</span>
            <span class="stat-value">${room.capacity} Beds</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon success"><i data-lucide="check-circle"></i></div>
          <div class="stat-info">
            <span class="stat-label">Room Status</span>
            <span class="stat-value" style="font-size:1rem;"><span class="badge badge-${room.status.toLowerCase().replace(' ', '_')}">${room.status}</span></span>
          </div>
        </div>
      </div>

      <!-- Detail Breakdown Card -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i data-lucide="info"></i> Occupancy Summary</div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; text-align: center; padding: 1rem 0;">
          <div style="padding: 1rem; border-radius: 8px; background-color: var(--bg-color);">
            <div style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">Total Capacity</div>
            <div style="font-size: 1.75rem; font-weight: 700; color: var(--text-main);">${room.capacity}</div>
          </div>
          <div style="padding: 1rem; border-radius: 8px; background-color: var(--info-bg);">
            <div style="font-size: 0.8rem; color: var(--info); font-weight: 600;">Occupied Beds</div>
            <div style="font-size: 1.75rem; font-weight: 700; color: var(--info);">${room.roommates.length + 1}</div>
          </div>
          <div style="padding: 1rem; border-radius: 8px; background-color: var(--success-bg);">
            <div style="font-size: 0.8rem; color: var(--success); font-weight: 600;">Available Beds</div>
            <div style="font-size: 1.75rem; font-weight: 700; color: var(--success);">${Math.max(0, room.capacity - (room.roommates.length + 1))}</div>
          </div>
        </div>
      </div>

      <!-- Roommates Card -->
      <div class="card">
        <div class="card-header">
          <div class="card-title"><i data-lucide="users"></i> Room Members / Roommates</div>
        </div>

        ${room.roommates.length === 0 ? `
          <div class="empty-state" style="padding: 2rem 0;">No other roommates currently assigned to this room.</div>
        ` : `
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem;">
            ${room.roommates.map(rm => `
              <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; border: 1px solid var(--border-color); border-radius: 8px; background-color: #ffffff;">
                <img src="${rm.profilePhoto || '../assets/images/avatar-placeholder.png'}" onerror="this.src='../assets/images/avatar-placeholder.png'" alt="${rm.fullName}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;" />
                <div>
                  <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--text-main);">${rm.fullName}</h4>
                  <div style="font-size: 0.8rem; color: var(--primary); font-weight: 600;">Roll: ${rm.rollNo}</div>
                  <div style="font-size: 0.75rem; color: var(--text-muted);">${rm.department} • Yr ${rm.year}</div>
                </div>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Failed to load room details. ${err.message}</div>`;
  }
}

function getOrdinalFloor(n) {
  if (!n) return '1st';
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
