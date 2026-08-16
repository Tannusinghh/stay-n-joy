const API_BASE = import.meta.env.VITE_API_BASE || '';

function getToken() {
  return localStorage.getItem('token');
}

function getAuthHeaders() {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth-logout'));
    }
    throw new Error(data.message || `Request failed: ${res.status}`);
  }
  return data;
}

export const api = {
  async get(path) {
    const res = await fetch(`${API_BASE}${path}`, { headers: getAuthHeaders() });
    return handleResponse(res);
  },

  async post(path, body, isFormData = false) {
    const headers = isFormData ? {} : getAuthHeaders();
    if (isFormData && getToken()) headers['Authorization'] = `Bearer ${getToken()}`;
    const options = {
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    };
    const res = await fetch(`${API_BASE}${path}`, options);
    return handleResponse(res);
  },

  async put(path, body, isFormData = false) {
    const headers = isFormData ? {} : getAuthHeaders();
    if (isFormData && getToken()) headers['Authorization'] = `Bearer ${getToken()}`;
    const options = {
      method: 'PUT',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    };
    const res = await fetch(`${API_BASE}${path}`, options);
    return handleResponse(res);
  },

  async delete(path) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },
};

export default api;
