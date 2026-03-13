import { useState, useEffect } from 'react';
import { fetchConfig, updateConfig } from '../api';

export default function ConfigEditor({ config, onRefresh, addLog }) {
  const [activeSection, setActiveSection] = useState('models');
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // 加载配置
  useEffect(() => {
    const loadConfig = async () => {
      const result = await fetchConfig();
      if (result.success) {
        setFormData(result.config);
      }
    };
    loadConfig();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      const result = await updateConfig(formData);
      if (result.success) {
        setMessage({ type: 'success', text: '配置已保存！' });
        addLog('配置已保存');
        onRefresh();
      } else {
        setMessage({ type: 'error', text: '保存失败：' + result.error });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '保存失败：' + error.message });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const updateField = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateNestedField = (section, path, value) => {
    const keys = path.split('.');
    setFormData(prev => {
      const newData = { ...prev };
      let current = newData[section];
      for (let i = 0; i < keys.length - 1; i++) {
        current = { ...current, [keys[i]]: { ...current[keys[i]] } };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const sections = [
    { id: 'models', label: '🤖 模型配置', icon: '🤖' },
    { id: 'gateway', label: '🚀 Gateway', icon: '🚀' },
    { id: 'channels', label: '💬 机器人通道', icon: '💬' },
    { id: 'agents', label: '👤 Agent 设置', icon: '👤' },
    { id: 'plugins', label: '🔌 插件管理', icon: '🔌' }
  ];

  return (
    <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/30 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚙️</span>
          <h2 className="text-3xl font-black text-gray-800">配置管理</h2>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold btn-hover shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? '⏳ 保存中...' : '💾 保存配置'}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-5 rounded-xl font-semibold ${
          message.type === 'success' 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
            : 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg'
        }`}>
          {message.text}
        </div>
      )}

      {/* Section Tabs */}
      <div className="flex flex-wrap gap-3 mb-8 glass p-2 rounded-2xl">
        {sections.map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-6 py-3 rounded-xl font-bold transition-all card-hover ${
              activeSection === section.id
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {/* Section Content */}
      <div className="space-y-6">
        {activeSection === 'models' && (
          <ModelsSection data={formData.models} onChange={updateNestedField} />
        )}
        
        {activeSection === 'gateway' && (
          <GatewaySection data={formData.gateway} onChange={updateField} />
        )}
        
        {activeSection === 'channels' && (
          <ChannelsSection data={formData.channels} onChange={updateField} />
        )}
        
        {activeSection === 'agents' && (
          <AgentsSection data={formData.agents} onChange={updateNestedField} />
        )}
        
        {activeSection === 'plugins' && (
          <PluginsSection data={formData.plugins} onChange={updateField} />
        )}
      </div>
    </div>
  );
}

// 模型配置部分
function ModelsSection({ data = {}, onChange }) {
  const providers = data.providers || {};
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
          <span className="text-3xl">🤖</span>
          模型提供商配置
        </h3>
        
        {Object.entries(providers).map(([name, provider]) => (
          <div key={name} className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 mb-4 border-2 border-blue-200/50 hover:border-blue-300 transition-all">
            <h4 className="font-black text-xl text-gray-800 mb-6 capitalize flex items-center gap-2">
              <span className="w-2 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></span>
              {name}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  Base URL
                </label>
                <input
                  type="text"
                  value={provider.baseUrl || ''}
                  onChange={(e) => onChange('models', `providers.${name}.baseUrl`, e.target.value)}
                  className="w-full px-5 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-medium"
                  placeholder="https://api.example.com/v1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  API Key
                </label>
                <input
                  type="password"
                  value={provider.apiKey || ''}
                  onChange={(e) => onChange('models', `providers.${name}.apiKey`, e.target.value)}
                  className="w-full px-5 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-medium"
                  placeholder="sk-..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                  API 类型
                </label>
                <select
                  value={provider.api || 'openai-completions'}
                  onChange={(e) => onChange('models', `providers.${name}.api`, e.target.value)}
                  className="w-full px-5 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all font-medium cursor-pointer"
                >
                  <option value="openai-completions">OpenAI Compatible</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="google">Google AI</option>
                </select>
              </div>
            </div>

            {/* 模型列表 */}
            {provider.models && provider.models.length > 0 && (
              <div className="mt-6 pt-6 border-t-2 border-blue-100">
                <h5 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <span>📦</span>
                  可用模型 ({provider.models.length})
                </h5>
                <div className="flex flex-wrap gap-2">
                  {provider.models.slice(0, 10).map((model, i) => (
                    <span key={i} className="px-4 py-2 bg-white rounded-full text-sm font-semibold text-gray-700 border-2 border-gray-200 hover:border-blue-300 transition-all">
                      {model.id}
                    </span>
                  ))}
                  {provider.models.length > 10 && (
                    <span className="px-4 py-2 bg-blue-50 rounded-full text-sm font-semibold text-blue-700 border-2 border-blue-200">
                      +{provider.models.length - 10} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Gateway 配置部分
function GatewaySection({ data = {}, onChange }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
            运行模式
          </label>
          <select
            value={data.mode || 'local'}
            onChange={(e) => onChange('gateway', 'mode', e.target.value)}
            className="w-full px-5 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all font-medium cursor-pointer"
          >
            <option value="local">本地模式</option>
            <option value="remote">远程模式</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
            端口
          </label>
          <input
            type="number"
            value={data.port || 18789}
            onChange={(e) => onChange('gateway', 'port', parseInt(e.target.value))}
            className="w-full px-5 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all font-medium"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
            认证模式
          </label>
          <select
            value={data.auth?.mode || 'token'}
            onChange={(e) => onChange('gateway', 'auth.mode', e.target.value)}
            className="w-full px-5 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all font-medium cursor-pointer"
          >
            <option value="none">无认证</option>
            <option value="token">Token 认证</option>
            <option value="password">密码认证</option>
            <option value="trusted-proxy">可信代理</option>
          </select>
        </div>

        {data.auth?.mode === 'token' && (
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
              Gateway Token
            </label>
            <input
              type="password"
              value={data.auth?.token || ''}
              onChange={(e) => onChange('gateway', 'auth.token', e.target.value)}
              className="w-full px-5 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all font-medium"
              placeholder="留空则自动生成"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// 通道配置部分
function ChannelsSection({ data = {}, onChange }) {
  const channels = [
    { id: 'qqbot', name: 'QQ 机器人', icon: '🐧' },
    { id: 'telegram', name: 'Telegram', icon: '✈️' },
    { id: 'discord', name: 'Discord', icon: '🎮' },
    { id: 'whatsapp', name: 'WhatsApp', icon: '📱' },
    { id: 'feishu', name: '飞书', icon: '📝' },
    { id: 'wechat', name: '微信', icon: '💚' }
  ];

  return (
    <div className="space-y-4">
      {channels.map(channel => {
        const channelData = data[channel.id] || {};
        const enabled = channelData.enabled || false;
        
        return (
          <div
            key={channel.id}
            className={`p-6 rounded-2xl border-2 transition-all card-hover ${
              enabled
                ? 'border-green-400 bg-gradient-to-r from-green-50 to-emerald-50'
                : 'border-gray-200 bg-gradient-to-r from-gray-50 to-white'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <span className="text-4xl">{channel.icon}</span>
                <span className="font-black text-xl text-gray-800">{channel.name}</span>
              </div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => onChange('channels', `${channel.id}.enabled`, e.target.checked)}
                  className="sr-only"
                />
                <div className={`w-14 h-7 rounded-full transition-colors ${
                  enabled ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gray-300'
                }`}>
                  <div className={`w-7 h-7 bg-white rounded-full shadow-lg transform transition-transform ${
                    enabled ? 'translate-x-7' : 'translate-x-0'
                  }`}></div>
                </div>
              </label>
            </div>

            {enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6 pt-6 border-t-2 border-gray-200">
                {channel.id === 'qqbot' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                        App ID
                      </label>
                      <input
                        type="text"
                        value={channelData.appId || ''}
                        onChange={(e) => onChange('channels', `${channel.id}.appId`, e.target.value)}
                        className="w-full px-5 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                        Client Secret
                      </label>
                      <input
                        type="password"
                        value={channelData.clientSecret || ''}
                        onChange={(e) => onChange('channels', `${channel.id}.clientSecret`, e.target.value)}
                        className="w-full px-5 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all font-medium"
                      />
                    </div>
                  </>
                )}

                {channel.id === 'feishu' && (
                  <>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                        App ID
                      </label>
                      <input
                        type="text"
                        value={channelData.appId || ''}
                        onChange={(e) => onChange('channels', `${channel.id}.appId`, e.target.value)}
                        className="w-full px-5 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                        App Secret
                      </label>
                      <input
                        type="password"
                        value={channelData.appSecret || ''}
                        onChange={(e) => onChange('channels', `${channel.id}.appSecret`, e.target.value)}
                        className="w-full px-5 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
                        验证 Token
                      </label>
                      <input
                        type="text"
                        value={channelData.token || ''}
                        onChange={(e) => onChange('channels', `${channel.id}.token`, e.target.value)}
                        className="w-full px-5 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all font-medium"
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Agent 配置部分
function AgentsSection({ data = {}, onChange }) {
  const defaults = data.defaults || {};
  const model = defaults.model || {};
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
            默认模型
          </label>
          <input
            type="text"
            value={model.primary || ''}
            onChange={(e) => onChange('agents', 'defaults.model.primary', e.target.value)}
            className="w-full px-5 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all font-medium"
            placeholder="例如：bailian/qwen3.5-plus"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">
            上下文压缩模式
          </label>
          <select
            value={defaults.compaction?.mode || 'safeguard'}
            onChange={(e) => onChange('agents', 'defaults.compaction.mode', e.target.value)}
            className="w-full px-5 py-3.5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all font-medium cursor-pointer"
          >
            <option value="off">关闭</option>
            <option value="safeguard">安全模式</option>
            <option value="aggressive">激进模式</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// 插件配置部分
function PluginsSection({ data = {}, onChange }) {
  const installs = data.installs || {};
  
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-black text-gray-800 flex items-center gap-3">
        <span className="text-3xl">🔌</span>
        已安装插件 ({Object.keys(installs).length})
      </h3>
      
      {Object.keys(installs).length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-dashed border-gray-300">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-gray-500 font-semibold text-lg">暂无已安装插件</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Object.entries(installs).map(([name, plugin]) => (
            <div key={name} className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 border-2 border-purple-200/50 hover:border-purple-300 transition-all card-hover">
              <div className="font-black text-xl text-gray-800 mb-2">{name}</div>
              <div className="flex items-center gap-4 text-sm">
                <span className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full font-bold">
                  📦 v{plugin.version}
                </span>
                <span className="text-gray-500 font-semibold">
                  来源：{plugin.source}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
