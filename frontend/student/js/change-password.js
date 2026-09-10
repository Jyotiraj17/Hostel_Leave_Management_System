document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('change-password-form');
  if (form) {
    initChangePasswordForm(form);
  }
});

function initChangePasswordForm(form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById('currentPassword').value.trim();
    const newPassword = document.getElementById('newPassword').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();

    if (!validator.isNotEmpty(currentPassword)) {
      toast.error('Please enter your current password.');
      return;
    }

    if (!validator.isMinLength(newPassword, 6)) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    if (!validator.doMatch(newPassword, confirmPassword)) {
      toast.error('New password and confirmation password do not match.');
      return;
    }

    const submitBtn = document.getElementById('change-pass-btn');
    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = 'Updating Password...';

    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });

      if (res.success) {
        toast.success('Password changed successfully.');
        form.reset();
      } else {
        toast.error(res.message || 'Failed to change password.');
      }
    } catch (err) {
      toast.error(err.message || 'Error updating password.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.querySelector('span').textContent = 'Update Password';
    }
  });
}
