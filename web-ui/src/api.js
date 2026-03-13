// API 配置
const API_CONFIG = {
  // 生产环境地址
  production: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  // 开发环境：智能检测
  development: () => {
    const host = window.location.hostname;
    const port = import.meta.env.VITE_API_PORT || '3001';
    
    // 如果是 localhost 或 127.0.0.1，使用 localhost
    if (host === 'localhost' || host === '127.0.0.1') {
      return `http://localhost:${port}/api`;
    }
    
    // 如果是 .local 域名（如 clawbox.local），使用 IP 地址
    // 因为 .local 域名可能无法在其他设备上解析
    if (host.endsWith('.local')) {
      console.log('🔍 检测到 .local 域名，尝试使用 IP 地址...');
      // 使用当前窗口 location 的 hostname，浏览器会自动解析
      return `http://${host}:${port}/api`;
    }
    
    // 其他情况（IP 地址或其他域名），使用当前主机
    return `http://${host}:${port}/api`;
  }
};

// 根据环境选择 API 地址
const API_BASE = import.meta.env.PROD 
  ? API_CONFIG.production 
  : API_CONFIG.development();

console.log('📡 API 地址:', API_BASE);
console.log('📍 当前主机:', window.location.hostname);

// 通用 fetch 包装器，添加超时和错误处理
async function apiFetch(endpoint, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 秒超时

  try {
    const url = `${API_BASE}${endpoint}`;
    console.log('📤 请求:', url);
    
    const response = await fetch(url, {
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

    const data = await response.json();
    console.log('📥 响应:', endpoint, data);
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('❌ API 请求失败:', {
      endpoint,
      error: error.message,
      url: `${API_BASE}${endpoint}`,
      hostname: window.location.hostname,
    });
    
    if (error.name === 'AbortError') {
      throw new Error('请求超时（10 秒），请检查：\n1. API 服务器是否运行\n2. 网络连接是否正常\n3. 防火墙是否阻止');
    }
    if (error.message.includes('Failed to fetch')) {
      throw new Error(`无法连接到 API 服务器\n\n地址：${API_BASE}\n主机名：${window.location.hostname}\n\n可能的原因：\n1. API 服务器未运行（端口 3001）\n2. 域名无法解析（如 .local 域名）\n3. 防火墙阻止连接\n\n解决方案：\n• 尝试使用 IP 地址访问（如 http://192.168.x.x:5173）\n• 检查 API 服务器：curl http://localhost:3001/api/status`);
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
