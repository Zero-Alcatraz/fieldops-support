/**
 * Cliente API para FieldOps & Support
 * Maneja llamadas HTTP autenticadas con Correlation IDs y control de errores.
 */
class ApiClient {
  constructor() {
    this.baseUrl = '/api';
    this.token = localStorage.getItem('fieldops_token') || null;
    this.currentUser = JSON.parse(localStorage.getItem('fieldops_user') || 'null');
  }

  setSession(token, user) {
    this.token = token;
    this.currentUser = user;
    localStorage.setItem('fieldops_token', token);
    localStorage.setItem('fieldops_user', JSON.stringify(user));
  }

  clearSession() {
    this.token = null;
    this.currentUser = null;
    localStorage.removeItem('fieldops_token');
    localStorage.removeItem('fieldops_user');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'x-correlation-id': 'client-' + Math.random().toString(36).substring(2, 10),
      ...(options.headers || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = data?.error?.message || `Error del servidor (${response.status})`;
      const err = new Error(errorMsg);
      err.code = data?.error?.code;
      err.details = data?.error?.details;
      throw err;
    }

    return data.data;
  }

  // Métodos de negocio
  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setSession(data.token, data.user);
    return data.user;
  }

  async getIncidents(filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return this.request(`/incidents?${query}`);
  }

  async createIncident(incidentData) {
    return this.request('/incidents', {
      method: 'POST',
      body: JSON.stringify(incidentData)
    });
  }

  async getSkills() {
    return this.request('/skills');
  }

  async getSkill(code) {
    return this.request(`/skills/${code}`);
  }

  async saveDiagnostic(diagnosticData) {
    return this.request('/diagnostics', {
      method: 'POST',
      body: JSON.stringify(diagnosticData)
    });
  }

  async getDiagnostics() {
    return this.request('/diagnostics');
  }

  async escalateIncident(escalateData) {
    return this.request('/escalations', {
      method: 'POST',
      body: JSON.stringify(escalateData)
    });
  }

  async getEscalations() {
    return this.request('/escalations');
  }

  async getQueueMetrics() {
    return this.request('/queue/metrics');
  }

  async replayJob(jobId) {
    return this.request(`/queue/replay/${jobId}`, {
      method: 'POST'
    });
  }
}

const api = new ApiClient();
