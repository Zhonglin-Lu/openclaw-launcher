import { useState, useEffect, useRef } from 'react';
import { fetchLogs } from '../api';

export default function LogViewer({ logs = [] }) {
  const [autoScroll, setAutoScroll] = useState(true);
  const logEndRef = useRef(null);

  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, autoScroll]);

  const getLogColor = (log) => {
    if (log.includes('成功') || log.includes('完成') || log.includes('✅')) return 'text-green-400';
    if (log.includes('失败') || log.includes('错误') || log.includes('❌')) return 'text-red-400';
    if (log.includes('警告') || log.includes('⚠️')) return 'text-yellow-400';
    if (log.includes('启动') || log.includes('停止') || log.includes('重启')) return 'text-blue-400';
    return 'text-gray-300';
  };

  const getLogIcon = (log) => {
    if (log.includes('成功') || log.includes('完成')) return '✅';
    if (log.includes('失败') || log.includes('错误')) return '❌';
    if (log.includes('警告')) return '⚠️';
    if (log.includes('启动')) return '▶️';
    if (log.includes('停止')) return '⏹️';
    if (log.includes('重启')) return '🔄';
    if (log.includes('刷新')) return '🔃';
    return '📝';
  };

  return (
    <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/30">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📝</span>
          <h2 className="text-3xl font-black text-gray-800">操作日志</h2>
        </div>
        <label className="flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-sm rounded-xl cursor-pointer hover:bg-white transition-all">
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
            className="w-5 h-5 accent-purple-500"
          />
          <span className="font-semibold text-gray-700">自动滚动</span>
        </label>
      </div>

      <div className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 rounded-2xl p-6 h-96 overflow-y-auto font-mono text-sm border border-gray-700/50 shadow-inner">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-16 font-sans">
            <div className="text-5xl mb-4">📭</div>
            <div className="text-lg font-semibold">暂无日志</div>
            <div className="text-sm mt-2">操作记录将显示在这里</div>
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all ${getLogColor(log)}`}
              >
                <span className="text-lg flex-shrink-0">{getLogIcon(log)}</span>
                <span className="flex-1 break-all">{log}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        )}
      </div>
    </div>
  );
}
