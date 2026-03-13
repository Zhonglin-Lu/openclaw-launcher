export default function StatusCard({ status }) {
  if (!status) return null;

  const gatewayRunning = status.gateway?.running;
  const gatewayHealthy = status.gateway?.healthy;

  const stats = [
    {
      label: 'PID',
      value: gatewayRunning ? status.gateway.pid : '-',
      icon: '🔢',
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'from-blue-500/10 to-cyan-500/10'
    },
    {
      label: '端口',
      value: status.gateway.port || 18789,
      icon: '🔌',
      gradient: 'from-purple-500 to-pink-500',
      bg: 'from-purple-500/10 to-pink-500/10'
    },
    {
      label: '健康状态',
      value: gatewayHealthy ? '健康' : '异常',
      icon: gatewayHealthy ? '✅' : '⚠️',
      gradient: gatewayHealthy ? 'from-green-500 to-emerald-500' : 'from-red-500 to-rose-500',
      bg: gatewayHealthy ? 'from-green-500/10 to-emerald-500/10' : 'from-red-500/10 to-rose-500/10'
    },
    {
      label: '运行模式',
      value: status.gateway.mode || 'local',
      icon: '⚙️',
      gradient: 'from-orange-500 to-amber-500',
      bg: 'from-orange-500/10 to-amber-500/10'
    }
  ];

  return (
    <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/30">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${gatewayRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <h2 className="text-3xl font-black text-gray-800">🚀 Gateway 状态</h2>
        </div>
        <div className={`px-5 py-2.5 rounded-full font-bold text-sm ${
          gatewayRunning 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
            : 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg'
        }`}>
          {gatewayRunning ? '● 运行中' : '● 已停止'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className={`group relative bg-gradient-to-br ${stat.bg} rounded-2xl p-5 border border-gray-200/50 hover:border-purple-300/50 transition-all duration-300 card-hover overflow-hidden`}
          >
            {/* 背景光晕 */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${stat.gradient} rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">{stat.icon}</span>
                <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="text-3xl font-black text-gray-800 tracking-tight">
                {stat.value}
              </div>
            </div>
            
            {/* 底部渐变条 */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${stat.gradient} rounded-b-2xl`}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
