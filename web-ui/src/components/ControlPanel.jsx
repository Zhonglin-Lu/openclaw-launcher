export default function ControlPanel({ status, onStart, onStop, onRestart, onRefresh }) {
  const gatewayRunning = status?.gateway?.running;

  const buttons = [
    {
      label: '启动',
      icon: '▶️',
      onClick: onStart,
      disabled: gatewayRunning,
      gradient: 'from-green-500 to-emerald-600',
      shadow: 'shadow-green-500/30',
      disabledBg: 'from-gray-300 to-gray-400'
    },
    {
      label: '停止',
      icon: '⏹️',
      onClick: onStop,
      disabled: !gatewayRunning,
      gradient: 'from-red-500 to-rose-600',
      shadow: 'shadow-red-500/30',
      disabledBg: 'from-gray-300 to-gray-400'
    },
    {
      label: '重启',
      icon: '🔄',
      onClick: onRestart,
      disabled: false,
      gradient: 'from-orange-500 to-amber-600',
      shadow: 'shadow-orange-500/30',
      disabledBg: 'from-gray-300 to-gray-400'
    },
    {
      label: '刷新',
      icon: '🔃',
      onClick: onRefresh,
      disabled: false,
      gradient: 'from-blue-500 to-cyan-600',
      shadow: 'shadow-blue-500/30',
      disabledBg: 'from-gray-300 to-gray-400'
    }
  ];

  return (
    <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/30">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">🎮</span>
        <h2 className="text-3xl font-black text-gray-800">控制面板</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {buttons.map((btn, index) => (
          <button
            key={index}
            onClick={btn.onClick}
            disabled={btn.disabled}
            className={`group relative px-6 py-5 rounded-2xl font-bold text-lg transition-all duration-300 btn-hover overflow-hidden ${
              btn.disabled
                ? `bg-gradient-to-r ${btn.disabledBg} text-gray-400 cursor-not-allowed`
                : `bg-gradient-to-r ${btn.gradient} text-white ${btn.shadow} hover:shadow-2xl`
            }`}
          >
            {/* 光晕效果 */}
            {!btn.disabled && (
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            )}
            
            <span className="relative flex items-center justify-center gap-3">
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
