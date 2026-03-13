import { useState, useEffect } from 'react';
import { fetchStatus, startGateway, stopGateway, restartGateway } from './api';
import StatusCard from './components/StatusCard';
import ControlPanel from './components/ControlPanel';
import SystemInfo from './components/SystemInfo';
import SkillsManager from './components/SkillsManager';
import SkillsMarket from './components/SkillsMarket';
import LogViewer from './components/LogViewer';
import ConfigEditor from './components/ConfigEditor';
import DiagnosticCenter from './components/DiagnosticCenter';
import UsageMonitorEnhanced from './components/UsageMonitorEnhanced';
import './App.css';

function App() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [config, setConfig] = useState(null);
  const [skillsSubTab, setSkillsSubTab] = useState('manage');

  const addLog = (message) => {
    const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
    setLogs(prev => [...prev, `[${time}] ${message}`].slice(-100));
  };

  const refreshStatus = async () => {
    addLog('刷新状态...');
    try {
      const result = await fetchStatus();
      if (result.success) {
        setStatus(result.data);
        addLog(`状态刷新完成 - ${result.data.skills.total} 个 Skills`);
      } else {
        addLog('获取状态失败：' + result.error);
      }
    } catch (error) {
      addLog('获取状态失败：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = async () => {
    addLog('正在启动 Gateway...');
    try {
      const result = await startGateway();
      addLog(result.message || 'Gateway 启动成功');
      setTimeout(refreshStatus, 2000);
    } catch (error) {
      addLog('启动失败：' + error.message);
    }
  };

  const handleStop = async () => {
    addLog('正在停止 Gateway...');
    try {
      const result = await stopGateway();
      addLog(result.message || 'Gateway 已停止');
      setTimeout(refreshStatus, 1000);
    } catch (error) {
      addLog('停止失败：' + error.message);
    }
  };

  const handleRestart = async () => {
    addLog('正在重启 Gateway...');
    try {
      const result = await restartGateway();
      addLog(result.message || 'Gateway 重启完成');
      setTimeout(refreshStatus, 3000);
    } catch (error) {
      addLog('重启失败：' + error.message);
    }
  };

  useEffect(() => {
    refreshStatus();
    const interval = setInterval(refreshStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const tabs = [
    { id: 'overview', label: '概览', icon: '📊' },
    { id: 'config', label: '配置', icon: '⚙️' },
    { id: 'diagnose', label: '诊断', icon: '🔍' },
    { id: 'usage', label: '用量', icon: '📈' },
    { id: 'skills', label: 'Skills', icon: '🧩' },
    { id: 'logs', label: '日志', icon: '📝' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 gradient-animate">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative glass border-b border-white/20 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-600 rounded-2xl flex items-center justify-center text-4xl shadow-lg pulse-glow">
                🦞
              </div>
              <div>
                <h1 className="text-4xl font-black text-white drop-shadow-lg tracking-tight">
                  OpenClaw <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">启动器</span>
                </h1>
                <p className="text-white/70 mt-1 text-sm font-medium">
                  让 OpenClaw 更易用 · 一键启动 · 图形配置 · 智能诊断
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
                <span className="text-white/60 text-xs font-semibold uppercase tracking-wider">v1.0.0</span>
                {status && (
                  <>
                    <span className="text-white/30">·</span>
                    <span className={`text-xs font-bold ${status.gateway.running ? 'text-green-400' : 'text-red-400'}`}>
                      {status.gateway.running ? '● 运行中' : '● 已停止'}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto px-6 py-8">
        {/* Tab Navigation */}
        <nav className="flex flex-wrap gap-2 mb-8 justify-center glass p-2 rounded-2xl shadow-xl">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`group px-5 py-3 rounded-xl font-bold transition-all duration-300 card-hover ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg scale-105'
                  : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white hover:scale-105'
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <span className="text-xl group-hover:scale-110 transition-transform">{tab.icon}</span>
                <span>{tab.label}</span>
              </span>
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-center">
              <div className="relative inline-block">
                <div className="animate-spin rounded-full h-20 w-20 border-4 border-purple-500/30 border-t-purple-400"></div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🦞</div>
              </div>
              <div className="text-white/80 text-xl font-semibold mt-6">正在加载</div>
              <div className="text-white/50 text-sm mt-2">请稍候...</div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <StatusCard status={status} />
                <ControlPanel
                  status={status}
                  onStart={handleStart}
                  onStop={handleStop}
                  onRestart={handleRestart}
                  onRefresh={refreshStatus}
                />
                <SystemInfo status={status} />
              </div>
            )}

            {activeTab === 'config' && (
              <div className="scale-in">
                <ConfigEditor 
                  config={status?.config} 
                  onRefresh={refreshStatus}
                  addLog={addLog}
                />
              </div>
            )}

            {activeTab === 'diagnose' && (
              <div className="scale-in">
                <DiagnosticCenter addLog={addLog} />
              </div>
            )}

            {activeTab === 'skills' && (
              <div className="animate-fade-in">
                {/* Skills 子标签导航 */}
                <div className="flex gap-2 mb-6 glass p-2 rounded-xl inline-flex">
                  <button
                    onClick={() => setSkillsSubTab('manage')}
                    className={`px-6 py-2.5 rounded-lg font-bold transition-all duration-300 ${
                      skillsSubTab === 'manage'
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    🛠️ 管理
                  </button>
                  <button
                    onClick={() => setSkillsSubTab('market')}
                    className={`px-6 py-2.5 rounded-lg font-bold transition-all duration-300 ${
                      skillsSubTab === 'market'
                        ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                        : 'bg-white/10 text-white/70 hover:bg-white/20 hover:text-white'
                    }`}
                  >
                    🏪 市场
                  </button>
                </div>
                {/* 子标签内容 */}
                {skillsSubTab === 'manage' && <SkillsManager addLog={addLog} />}
                {skillsSubTab === 'market' && <SkillsMarket addLog={addLog} />}
              </div>
            )}

            {activeTab === 'usage' && (
              <div className="scale-in">
                <UsageMonitorEnhanced />
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="scale-in">
                <LogViewer logs={logs} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative glass border-t border-white/20 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-6 text-center">
          <p className="text-white/60 text-sm">
            Made with <span className="text-red-400">❤️</span> by VA7 · OpenClaw 启动器 v1.0.0
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
