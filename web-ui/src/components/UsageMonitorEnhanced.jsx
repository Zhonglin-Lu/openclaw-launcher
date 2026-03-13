import { useState, useEffect } from 'react';

export default function UsageMonitorEnhanced() {
  const [realtimeUsage, setRealtimeUsage] = useState(null);
  const [report, setReport] = useState(null);
  const [modelRanking, setModelRanking] = useState([]);
  const [alerts, setAlerts] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportDays, setReportDays] = useState(7);

  useEffect(() => {
    loadAllData();
    const interval = setInterval(loadRealtimeUsage, 60000); // 每分钟刷新实时数据
    return () => clearInterval(interval);
  }, [reportDays]);

  const loadAllData = async () => {
    await Promise.all([
      loadRealtimeUsage(),
      loadReport(),
      loadModelRanking(),
      loadAlerts(),
      loadSuggestions()
    ]);
    setLoading(false);
  };

  const loadRealtimeUsage = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/usage/realtime');
      const result = await res.json();
      if (result.success) {
        setRealtimeUsage(result.usage);
      }
    } catch (error) {
      console.error('加载实时用量失败:', error);
    }
  };

  const loadReport = async () => {
    try {
      const res = await fetch(`http://localhost:3001/api/usage/report?days=${reportDays}`);
      const result = await res.json();
      if (result.success) {
        setReport(result.report);
      }
    } catch (error) {
      console.error('加载报告失败:', error);
    }
  };

  const loadModelRanking = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/usage/models?days=7');
      const result = await res.json();
      if (result.success) {
        setModelRanking(result.ranking);
      }
    } catch (error) {
      console.error('加载模型排行失败:', error);
    }
  };

  const loadAlerts = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/usage/alerts/check');
      const result = await res.json();
      if (result.success) {
        setAlerts(result.alerts);
      }
    } catch (error) {
      console.error('加载警告失败:', error);
    }
  };

  const loadSuggestions = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/usage/suggestions');
      const result = await res.json();
      if (result.success) {
        setSuggestions(result.suggestions);
      }
    } catch (error) {
      console.error('加载建议失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/30">
        <div className="text-center py-20">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500"></div>
            <div className="absolute inset-0 flex items-center justify-center text-xl">📈</div>
          </div>
          <div className="text-gray-600 mt-6 font-semibold text-lg">加载用量数据...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 实时用量卡片 */}
      {realtimeUsage && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <UsageCard
            title="今日 Token"
            value={realtimeUsage.today.tokens.total.toLocaleString()}
            subtitle={`输入：${realtimeUsage.today.tokens.input.toLocaleString()} | 输出：${realtimeUsage.today.tokens.output.toLocaleString()}`}
            color="from-blue-500 to-cyan-500"
            icon="📊"
          />
          <UsageCard
            title="今日花费"
            value={`¥${realtimeUsage.today.cost.toFixed(2)}`}
            subtitle={`${realtimeUsage.today.requests} 次请求`}
            color="from-green-500 to-emerald-500"
            icon="💰"
          />
          <UsageCard
            title="本月 Token"
            value={realtimeUsage.month.tokens.total.toLocaleString()}
            subtitle={`输入：${realtimeUsage.month.tokens.input.toLocaleString()} | 输出：${realtimeUsage.month.tokens.output.toLocaleString()}`}
            color="from-purple-500 to-pink-500"
            icon="📈"
          />
          <UsageCard
            title="本月花费"
            value={`¥${realtimeUsage.month.cost.toFixed(2)}`}
            subtitle={`${realtimeUsage.month.requests} 次请求`}
            color="from-orange-500 to-amber-500"
            icon="📅"
          />
        </div>
      )}

      {/* 用量警告 */}
      {alerts && alerts.triggered && (
        <div className="glass-card rounded-2xl p-6 shadow-xl border-l-4 border-red-500 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-start gap-4">
            <span className="text-4xl">⚠️</span>
            <div className="flex-1">
              <h3 className="font-black text-xl text-red-800 mb-3">用量警告</h3>
              <div className="space-y-2">
                {alerts.alerts.map((alert, i) => (
                  <div key={i} className="flex items-center gap-2 text-red-700 font-medium">
                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                    {alert.message}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 用量报告图表 */}
      {report && (
        <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/30">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📊</span>
              <h3 className="text-2xl font-black text-gray-800">用量趋势 (最近{reportDays}天)</h3>
            </div>
            <div className="flex gap-2 glass p-1.5 rounded-xl">
              {[7, 14, 30].map(days => (
                <button
                  key={days}
                  onClick={() => setReportDays(days)}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                    reportDays === days
                      ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                      : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md'
                  }`}
                >
                  {days}天
                </button>
              ))}
            </div>
          </div>

          <div className="h-64 flex items-end gap-3">
            {report.reports.map((day, i) => {
              const maxTokens = Math.max(...report.reports.map(r => r.tokens.total));
              const height = maxTokens > 0 ? (day.tokens.total / maxTokens) * 100 : 0;
              
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-3">
                  <div
                    className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-xl transition-all hover:from-purple-600 hover:to-pink-600 card-hover"
                    style={{ height: `${height}%` }}
                    title={`${day.date}: ${day.tokens.total.toLocaleString()} tokens`}
                  ></div>
                  <div className="text-xs font-bold text-gray-600 transform -rotate-45">
                    {day.date.slice(5)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-5 text-center">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200/50">
              <div className="text-3xl font-black text-purple-600 mb-1">
                {report.summary.totalTokens.total.toLocaleString()}
              </div>
              <div className="text-sm font-bold text-gray-600 uppercase tracking-wider">总 Token</div>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200/50">
              <div className="text-3xl font-black text-green-600 mb-1">
                ¥{report.summary.totalCost.toFixed(2)}
              </div>
              <div className="text-sm font-bold text-gray-600 uppercase tracking-wider">总花费</div>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200/50">
              <div className="text-3xl font-black text-blue-600 mb-1">
                {report.summary.totalRequests.toLocaleString()}
              </div>
              <div className="text-sm font-bold text-gray-600 uppercase tracking-wider">总请求</div>
            </div>
          </div>
        </div>
      )}

      {/* 模型用量排行 */}
      {modelRanking.length > 0 && (
        <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/30">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">🏆</span>
            <h3 className="text-2xl font-black text-gray-800">模型用量排行 (最近 7 天)</h3>
          </div>
          <div className="space-y-3">
            {modelRanking.slice(0, 10).map((model, index) => (
              <div
                key={index}
                className="flex items-center gap-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border-2 border-gray-200/50 hover:border-purple-300 hover:shadow-lg transition-all card-hover"
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-yellow-900 shadow-lg' :
                  index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-700 shadow-lg' :
                  index === 2 ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-amber-100 shadow-lg' :
                  'bg-gradient-to-br from-gray-100 to-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-black text-lg text-gray-800">
                    {model.provider}/{model.modelId}
                  </div>
                  <div className="text-sm font-semibold text-gray-600">
                    {model.tokens.total.toLocaleString()} tokens • {model.requests} 次请求
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-green-600">¥{model.cost.toFixed(2)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 优化建议 */}
      {suggestions.length > 0 && (
        <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/30">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">💡</span>
            <h3 className="text-2xl font-black text-gray-800">成本优化建议</h3>
          </div>
          <div className="space-y-4">
            {suggestions.map((suggestion, i) => (
              <div
                key={i}
                className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border-l-4 border-blue-500"
              >
                <div className="flex items-start gap-4">
                  <span className="text-4xl">💡</span>
                  <div className="flex-1">
                    <div className="font-black text-xl text-gray-800 mb-2">
                      {suggestion.type === 'high_cost_model' ? '🔴 高成本模型' : '📊 高输出比例'}
                    </div>
                    <div className="text-gray-700 font-medium mb-3">{suggestion.suggestion}</div>
                    {suggestion.model && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-bold text-gray-700 border border-gray-200">
                        📦 模型：{suggestion.model} • 💰 花费：¥{suggestion.cost.toFixed(2)}
                      </div>
                    )}
                    {suggestion.ratio && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full text-sm font-bold text-gray-700 border border-gray-200">
                        📈 输出/输入比例：{suggestion.ratio}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 无数据提示 */}
      {!realtimeUsage && !report && (
        <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/30">
          <div className="text-center py-20">
            <div className="text-8xl mb-6">📊</div>
            <h3 className="text-2xl font-black text-gray-800 mb-3">暂无用量数据</h3>
            <p className="text-gray-500 font-medium text-lg">开始使用模型后，用量数据将自动记录</p>
          </div>
        </div>
      )}
    </div>
  );
}

// 用量卡片组件
function UsageCard({ title, value, subtitle, color, icon }) {
  return (
    <div className={`group relative bg-gradient-to-br ${color} rounded-2xl shadow-xl p-6 text-white overflow-hidden card-hover`}>
      {/* 背景光晕 */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:opacity-100 opacity-0 transition-opacity"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <span className="text-4xl group-hover:scale-110 transition-transform">{icon}</span>
          <div className="text-right">
            <div className="text-3xl font-black tracking-tight">{value}</div>
            <div className="text-sm font-bold uppercase tracking-wider opacity-80">{title}</div>
          </div>
        </div>
        <div className="text-xs font-medium opacity-75">{subtitle}</div>
      </div>
    </div>
  );
}
