// API 配置
const API_CONFIG = {
  // 生产环境地址
  production: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  // 开发环境：自动检测当前主机
  development: () => {
    const host = window.location.hostname;
    const port = import.meta.env.VITE_API_PORT || '3001';
    // 如果是 localhost 或 127.0.0.1，使用 localhost
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://localhost:${port}/api`;
    }
    // 否则使用当前主机（局域网访问）
    return `http://${host}:${port}/api`;
  }
};

// 根据环境选择 API 地址
const API_BASE = import.meta.env.PROD 
  ? API_CONFIG.production 
  : API_CONFIG.development();

console.log('📡 API 地址:', API_BASE);

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
    console.error('API 请求失败:', {
      endpoint,
      error: error.message,
      url: `${API_BASE}${endpoint}`
    });
    
    if (error.name === 'AbortError') {
      throw new Error('请求超时，请检查网络连接');
    }
    if (error.message.includes('Failed to fetch')) {
      throw new Error(`无法连接到 API 服务器 (${API_BASE})，请确保 API 正在运行`);
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
