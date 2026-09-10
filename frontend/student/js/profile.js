document.addEventListener('DOMContentLoaded', async () => {
  await loadStudentProfile();
});

let currentStudent = null;

async function loadStudentProfile() {
  const container = document.getElementById('profile-content');
  if (!container) return;

  try {
    const res = await api.get('/student/profile');
    if (!res.success || !res.student) {
      container.innerHTML = `<div class="empty-state">Unable to load profile information.</div>`;
      return;
    }

    currentStudent = res.student;
    renderProfileUI(container, currentStudent);
  } catch (err) {
    container.innerHTML = `<div class="empty-state">Failed to load profile. ${err.message}</div>`;
  }
}

function renderProfileUI(container, s) {
  const roomNumber = s.roomId ? (s.roomId.roomNumber || s.roomId) : 'Not Assigned';
  const photoUrl = s.profilePhoto || '../assets/images/avatar-placeholder.png';

  container.innerHTML = `
    <div class="page-header">
      <h1>My Profile</h1>
      <p>View your information and update contact details.</p>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
      
      <!-- Left Profile Header & Avatar Card -->
      <div class="card" style="text-align: center; display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="position: relative; margin-bottom: 1.25rem;">
          <img id="profile-img-preview" src="${photoUrl}" onerror="this.src='../assets/images/avatar-placeholder.png'" alt="${s.fullName}" style="width: 130px; height: 130px; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary-light); box-shadow: var(--shadow-md);" />
          <label for="photo-file-input" style="position: absolute; bottom: 0; right: 0; background: var(--primary); color: #fff; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; border: 2px solid #fff; box-shadow: var(--shadow);">
            <i data-lucide="camera" style="width: 18px; height: 18px;"></i>
          </label>
          <input type="file" id="photo-file-input" accept="image/*" style="display: none;" />
        </div>

        <h2 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.25rem;">${s.fullName}</h2>
        <span style="font-size: 0.875rem; color: var(--primary); font-weight: 600;">Roll Number: ${s.rollNo}</span>
        <span style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">${s.department} • Year ${s.year}</span>

        <div style="margin-top: 1.5rem; width: 100%; border-top: 1px solid var(--border-color); padding-top: 1.25rem; text-align: left; font-size: 0.85rem; color: var(--text-muted);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>Gender:</span> <strong style="color: var(--text-main);">${s.gender || 'Not specified'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span>Hostel / Block:</span> <strong style="color: var(--text-main);">${s.hostel || '-'} / ${s.block || '-'}</strong>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Room Number:</span> <strong style="color: var(--text-main);">${roomNumber}</strong>
          </div>
        </div>
      </div>

      <!-- Right Form Card (Read-only + Editable) -->
      <div class="card" style="grid-column: span 2;">
        <div class="card-header">
          <div class="card-title"><i data-lucide="user-check"></i> Personal & Guardian Details</div>
        </div>

        <form id="profile-form" novalidate>
          <div class="form-grid">
            
            <!-- Read-only Controlled Fields -->
            <div class="form-group">
              <label class="form-label">Full Name (Read-only)</label>
              <input type="text" class="form-control" value="${s.fullName}" readonly />
            </div>

            <div class="form-group">
              <label class="form-label">Roll Number (Read-only)</label>
              <input type="text" class="form-control" value="${s.rollNo}" readonly />
            </div>

            <div class="form-group">
              <label class="form-label">Email Address (Read-only)</label>
              <input type="email" class="form-control" value="${s.email}" readonly />
            </div>

            <div class="form-group">
              <label class="form-label">Department (Read-only)</label>
              <input type="text" class="form-control" value="${s.department}" readonly />
            </div>

            <div class="form-group">
              <label class="form-label">Year (Read-only)</label>
              <input type="text" class="form-control" value="${s.year}" readonly />
            </div>

            <div class="form-group">
              <label class="form-label" for="gender">Gender</label>
              <select id="gender" name="gender" class="form-control">
                <option value="Male" ${s.gender === 'Male' ? 'selected' : ''}>Male</option>
                <option value="Female" ${s.gender === 'Female' ? 'selected' : ''}>Female</option>
                <option value="Other" ${s.gender === 'Other' ? 'selected' : ''}>Other</option>
              </select>
            </div>

            <!-- Editable Fields -->
            <div class="form-group">
              <label class="form-label" for="phone">Phone Number *</label>
              <input type="text" id="phone" name="phone" class="form-control" value="${s.phone || ''}" required />
            </div>

            <div class="form-group">
              <label class="form-label" for="guardianName">Guardian Name</label>
              <input type="text" id="guardianName" name="guardianName" class="form-control" value="${s.guardianName || ''}" />
            </div>

            <div class="form-group">
              <label class="form-label" for="guardianPhone">Guardian Phone</label>
              <input type="text" id="guardianPhone" name="guardianPhone" class="form-control" value="${s.guardianPhone || ''}" />
            </div>

            <div class="form-group" style="grid-column: 1 / -1;">
              <label class="form-label" for="address">Permanent / Contact Address</label>
              <textarea id="address" name="address" class="form-control" rows="3">${s.address || ''}</textarea>
            </div>

          </div>

          <div style="margin-top: 1.5rem; text-align: right;">
            <button type="submit" id="save-profile-btn" class="btn btn-primary">
              <i data-lucide="save"></i>
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>

    </div>
  `;

  if (window.lucide) {
    lucide.createIcons();
  }

  // Setup Photo Upload Handler
  const photoInput = document.getElementById('photo-file-input');
  photoInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Local Preview
    const reader = new FileReader();
    reader.onload = (event) => {
      document.getElementById('profile-img-preview').src = event.target.result;
    };
    reader.readAsDataURL(file);

    // Upload to Backend (Cloudinary)
    const formData = new FormData();
    formData.append('profilePhoto', file);

    try {
      toast.show('Uploading profile photo...', 'info', 2000);
      const res = await api.put('/student/profile', formData);
      if (res.success) {
        toast.success('Profile photo updated successfully!');
        if (res.student && res.student.profilePhoto) {
          document.getElementById('profile-img-preview').src = res.student.profilePhoto;
          const headerAvatar = document.getElementById('header-avatar');
          if (headerAvatar) headerAvatar.src = res.student.profilePhoto;
        }
      } else {
        toast.error(res.message || 'Failed to upload photo.');
      }
    } catch (err) {
      toast.error(err.message || 'Error uploading profile photo.');
    }
  });

  // Setup Profile Form Submission
  const profileForm = document.getElementById('profile-form');
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const phone = document.getElementById('phone').value.trim();
    const gender = document.getElementById('gender').value;
    const guardianName = document.getElementById('guardianName').value.trim();
    const guardianPhone = document.getElementById('guardianPhone').value.trim();
    const address = document.getElementById('address').value.trim();

    if (!validator.isNotEmpty(phone)) {
      toast.error('Phone number is required.');
      return;
    }

    const saveBtn = document.getElementById('save-profile-btn');
    saveBtn.disabled = true;
    saveBtn.querySelector('span').textContent = 'Saving...';

    try {
      const res = await api.put('/student/profile', {
        phone,
        gender,
        guardianName,
        guardianPhone,
        address
      });

      if (res.success) {
        toast.success('Profile updated successfully.');
      } else {
        toast.error(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      toast.error(err.message || 'Error saving profile changes.');
    } finally {
      saveBtn.disabled = false;
      saveBtn.querySelector('span').textContent = 'Save Changes';
    }
  });
}
