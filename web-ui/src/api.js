const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export async function fetchStatus() {
  const res = await fetch(`${API_BASE}/status`);
  return res.json();
}

export async function startGateway(options = {}) {
  const res = await fetch(`${API_BASE}/gateway/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options)
  });
  return res.json();
}

export async function stopGateway(options = {}) {
  const res = await fetch(`${API_BASE}/gateway/stop`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(options)
  });
  return res.json();
}

export async function restartGateway() {
  const res = await fetch(`${API_BASE}/gateway/restart`, {
    method: 'POST'
  });
  return res.json();
}

export async function fetchConfig() {
  const res = await fetch(`${API_BASE}/config`);
  return res.json();
}

export async function updateConfig(updates) {
  const res = await fetch(`${API_BASE}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates })
  });
  return res.json();
}

export async function fetchLogs(lines = 50) {
  const res = await fetch(`${API_BASE}/logs?lines=${lines}`);
  return res.json();
}

export async function fetchDiagnose() {
  const res = await fetch(`${API_BASE}/diagnose`);
  return res.json();
}

export async function installSkill(name) {
  const res = await fetch(`${API_BASE}/skills/install`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return res.json();
}

export async function searchSkills(query, limit = 10) {
  const res = await fetch(`${API_BASE}/skills/search?query=${query}&limit=${limit}`);
  return res.json();
}
