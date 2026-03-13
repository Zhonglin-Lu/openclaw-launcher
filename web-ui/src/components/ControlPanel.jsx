export default function ControlPanel({ status, onStart, onStop, onRestart, onRefresh, loading, error }) {
  const gatewayRunning = status?.gateway?.running;

  const buttons = [
    {
      label: '启动',
      icon: '▶️',
      onClick: onStart,
      disabled: gatewayRunning || loading === 'start',
      loading: loading === 'start',
      gradient: 'from-green-500 to-emerald-600',
      shadow: 'shadow-green-500/30',
      disabledBg: 'from-gray-300 to-gray-400'
    },
    {
      label: '停止',
      icon: '⏹️',
      onClick: onStop,
      disabled: !gatewayRunning || loading === 'stop',
      loading: loading === 'stop',
      gradient: 'from-red-500 to-rose-600',
      shadow: 'shadow-red-500/30',
      disabledBg: 'from-gray-300 to-gray-400'
    },
    {
      label: '重启',
      icon: '🔄',
      onClick: onRestart,
      disabled: loading === 'restart',
      loading: loading === 'restart',
      gradient: 'from-orange-500 to-amber-600',
      shadow: 'shadow-orange-500/30',
      disabledBg: 'from-gray-300 to-gray-400'
    },
    {
      label: '刷新',
      icon: '🔃',
      onClick: onRefresh,
      disabled: loading === 'refresh',
      loading: loading === 'refresh',
      gradient: 'from-blue-500 to-cyan-600',
      shadow: 'shadow-blue-500/30',
      disabledBg: 'from-gray-300 to-gray-400'
    }
  ];

  return (
    <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/30">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🎮</span>
          <h2 className="text-3xl font-black text-gray-800">控制面板</h2>
        </div>
        
        {/* API 连接状态指示器 */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white/50 backdrop-blur-sm rounded-full">
          <div className={`w-2 h-2 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'} animate-pulse`}></div>
          <span className="text-xs font-bold text-gray-600">{error ? 'API 断开' : '已连接'}</span>
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="mb-6 p-4 bg-gradient-to-r from-red-500 to-rose-500 rounded-xl text-white shadow-lg animate-fade-in">
          <div className="flex items-start gap-3">
            <span className="text-2xl">❌</span>
            <div className="flex-1">
              <div className="font-bold mb-1">API 连接失败</div>
              <div className="text-sm opacity-90">{error}</div>
              <div className="text-xs mt-2 opacity-75">请确保 API 服务器正在运行 (端口 3001)</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {buttons.map((btn, index) => (
          <button
            key={index}
            onClick={btn.onClick}
            disabled={btn.disabled}
            className={`group relative px-6 py-5 rounded-2xl font-bold text-lg transition-all duration-300 overflow-hidden ${
              btn.disabled && !btn.loading
                ? `bg-gradient-to-r ${btn.disabledBg} text-gray-400 cursor-not-allowed`
                : `bg-gradient-to-r ${btn.gradient} text-white ${btn.shadow} hover:shadow-2xl btn-hover`
            }`}
          >
            {/* 加载动画 */}
            {btn.loading && (
              <div className="absolute inset-0 bg-white/20 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-white/30 border-t-white"></div>
              </div>
            )}
            
            {/* 光晕效果 */}
            {!btn.disabled && (
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            )}
            
            <span className={`relative flex items-center justify-center gap-3 ${btn.loading ? 'opacity-0' : ''}`}>
              <span className="text-2xl group-hover:scale-110 transition-transform">{btn.icon}</span>
              <span>{btn.label}</span>
            </span>
            
            {/* 底部高光 */}
            {!btn.disabled && (
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/10 to-transparent rounded-b-2xl"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
