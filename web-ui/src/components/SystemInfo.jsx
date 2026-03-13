export default function SystemInfo({ status }) {
  if (!status) return null;

  const infoCards = [
    {
      label: 'OpenClaw 版本',
      value: status.system.openclawVersion || 'unknown',
      icon: '🦞',
      gradient: 'from-purple-500 to-blue-500',
      bg: 'from-purple-500/10 to-blue-500/10'
    },
    {
      label: 'Node.js 版本',
      value: status.system.nodeVersion || 'unknown',
      icon: '📦',
      gradient: 'from-green-500 to-emerald-500',
      bg: 'from-green-500/10 to-emerald-500/10'
    },
    {
      label: '配置文件',
      value: status.system.configExists ? '✓ 存在' : '✗ 缺失',
      icon: '⚙️',
      gradient: status.system.configExists ? 'from-green-500 to-emerald-500' : 'from-red-500 to-rose-500',
      bg: status.system.configExists ? 'from-green-500/10 to-emerald-500/10' : 'from-red-500/10 to-rose-500/10',
      valueColor: status.system.configExists ? 'text-green-600' : 'text-red-600'
    },
    {
      label: 'Workspace',
      value: status.system.workspaceExists ? '✓ 存在' : '✗ 缺失',
      icon: '💼',
      gradient: status.system.workspaceExists ? 'from-blue-500 to-cyan-500' : 'from-red-500 to-rose-500',
      bg: status.system.workspaceExists ? 'from-blue-500/10 to-cyan-500/10' : 'from-red-500/10 to-rose-500/10',
      valueColor: status.system.workspaceExists ? 'text-blue-600' : 'text-red-600'
    }
  ];

  return (
    <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/30">
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">📊</span>
        <h2 className="text-3xl font-black text-gray-800">系统信息</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {infoCards.map((info, index) => (
          <div
            key={index}
            className={`group relative bg-gradient-to-br ${info.bg} rounded-2xl p-6 border border-gray-200/50 hover:border-purple-300/50 transition-all duration-300 card-hover overflow-hidden`}
          >
            {/* 背景光晕 */}
            <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${info.gradient} rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`}></div>
            
            <div className="relative">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-3xl">{info.icon}</span>
                <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider">{info.label}</span>
              </div>
              <div className={`text-2xl font-black tracking-tight ${info.valueColor || 'text-gray-800'}`}>
                {info.value}
              </div>
            </div>
            
            {/* 底部渐变条 */}
            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${info.gradient} rounded-b-2xl`}></div>
          </div>
        ))}
      </div>

      {status.skills && (
        <div className="mt-8 pt-8 border-t-2 border-gray-200/50">
          <div className="flex justify-between items-center bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200/50">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🧩</span>
              <span className="text-gray-600 font-semibold text-lg">已安装 Skills</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-black bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                {status.skills.total}
              </div>
              <span className="text-purple-600 font-bold text-lg">个</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
