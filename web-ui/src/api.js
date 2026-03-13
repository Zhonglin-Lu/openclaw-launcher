// 自动检测 API 地址
const getApiBase = () => {
  // 如果是开发环境，尝试使用当前主机
  if (import.meta.env.DEV) {
    const host = window.location.hostname;
    const port = import.meta.env.VITE_API_PORT || '3001';
    return `http://${host}:${port}/api`;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
};

const API_BASE = getApiBase();

// 通用 fetch 包装器，添加超时和错误处理
async function apiFetch(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 秒超时

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请检查网络连接');
    }
    if (error.message.includes('Failed to fetch')) {
      throw new Error('无法连接到 API 服务器，请确保 API 正在运行 (端口 3001)');
    }
    throw error;
  }
}

export async function fetchStatus() {
  return apiFetch('/status');
}

export async function startGateway(options = {}) {
  return apiFetch('/gateway/start', {
    method: 'POST',
    body: JSON.stringify(options),
  });
}

export async function stopGateway(options = {}) {
  return apiFetch('/gateway/stop', {
    method: 'POST',
    body: JSON.stringify(options),
  });
}

export async function restartGateway() {
  return apiFetch('/gateway/restart', {
    method: 'POST',
  });
}

export async function fetchConfig() {
  return apiFetch('/config');
}

export async function updateConfig(updates) {
  return apiFetch('/config', {
    method: 'POST',
    body: JSON.stringify({ updates }),
  });
}

export async function fetchLogs(lines = 50) {
  return apiFetch(`/logs?lines=${lines}`);
}

export async function fetchDiagnose() {
  return apiFetch('/diagnose');
}

export async function installSkill(name) {
  return apiFetch('/skills/install', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export async function searchSkills(query, limit = 10) {
  return apiFetch(`/skills/search?query=${query}&limit=${limit}`);
}
