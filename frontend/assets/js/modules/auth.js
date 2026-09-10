const auth = {
  getToken() {
    return localStorage.getItem('hms_token') || localStorage.getItem('token');
  },

  getUser() {
    const userStr = localStorage.getItem('hms_user') || localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setSession(token, user) {
    localStorage.setItem('hms_token', token);
    localStorage.setItem('hms_user', JSON.stringify(user));
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  },

  clearSession() {
    localStorage.removeItem('hms_token');
    localStorage.removeItem('hms_user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isLoggedIn() {
    return !!this.getToken();
  },

  requireRole(allowedRoles) {
    const token = this.getToken();
    const user = this.getUser();

    if (!token || !user) {
      window.location.href = '/auth/login.html';
      return false;
    }

    if (!allowedRoles.includes(user.role)) {
      this.redirectDashboard(user.role);
      return false;
    }

    return true;
  },

  redirectDashboard(role) {
    switch (role) {
      case 'admin':
        window.location.href = '/admin/dashboard.html';
        break;
      case 'warden':
        window.location.href = '/warden/dashboard.html';
        break;
      case 'student':
        window.location.href = '/student/dashboard.html';
        break;
      default:
        window.location.href = '/auth/login.html';
    }
  },

  logout() {
    this.clearSession();
    window.location.href = '/auth/login.html';
  }
};
