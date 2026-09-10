const API_BASE_URL = (typeof window !== 'undefined' && window.location.origin && window.location.origin.includes(':5000'))
  ? '/api'
  : 'http://localhost:5000/api';

const api = {
  async request(endpoint, options = {}) {
    const token = localStorage.getItem('hms_token') || localStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // If body is FormData (file upload), remove Content-Type to let browser set boundary
    if (options.body instanceof FormData) {
      delete headers['Content-Type'];
    }

    const fullUrl = `${API_BASE_URL}${endpoint}`;
    console.log('API Request URL:', fullUrl);

    try {
      const response = await fetch(fullUrl, {
        ...options,
        headers
      });

      console.log('Response Status:', response.status);
      console.log('Response Content-Type:', response.headers.get('content-type'));

      // Safely read response as text first to avoid "Unexpected end of JSON input"
      const responseText = await response.text();
      console.log('Raw Response Body:', responseText);

      if (!responseText.trim()) {
        throw new Error(`Server returned an empty response. HTTP status: ${response.status}`);
      }

      let data = {};
      try {
        data = JSON.parse(responseText);
        console.log('Parsed JSON Response:', data);
      } catch (parseError) {
        console.error('Invalid JSON returned by server:', responseText);
        throw new Error(`Server returned an invalid response. HTTP status: ${response.status}`);
      }

      if (!response.ok || !data.success) {
        if (response.status === 401 && !endpoint.includes('/auth/login')) {
          localStorage.removeItem('hms_token');
          localStorage.removeItem('hms_user');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/auth/login.html';
        }
        throw new Error(data.message || `Request failed with status ${response.status}.`);
      }

      return data;
    } catch (error) {
      console.error('API Error:', error.message);
      throw error;
    }
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      method: 'POST',
      body: isFormData ? body : JSON.stringify(body)
    });
  },

  put(endpoint, body) {
    const isFormData = body instanceof FormData;
    return this.request(endpoint, {
      method: 'PUT',
      body: isFormData ? body : JSON.stringify(body)
    });
  },

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body)
    });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
};
