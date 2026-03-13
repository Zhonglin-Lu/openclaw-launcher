// API 配置 - 使用相对路径，让 Vite 代理处理
const API_BASE = '/api';

console.log('📡 API 基础路径:', API_BASE);
console.log('📍 当前主机:', window.location.hostname);
console.log('🌐 完整地址:', window.location.origin + API_BASE);

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
      origin: window.location.origin,
    });
    
    if (error.name === 'AbortError') {
      throw new Error('请求超时（10 秒）\n\n请检查：\n1. API 服务器是否运行\n2. 网络连接是否正常\n3. 防火墙是否阻止');
    }
    if (error.message.includes('Failed to fetch')) {
      throw new Error(`无法连接到 API 服务器\n\n当前访问地址：${window.location.origin}\nAPI 路径：${API_BASE}\n\n可能的原因：\n1. API 服务器未运行（端口 3001）\n2. Vite 代理配置问题\n3. 防火墙阻止连接\n\n解决方案：\n• 确保 API 服务器正在运行\n• 检查浏览器控制台（F12）的详细错误\n• 尝试直接使用 IP 地址访问`);
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
