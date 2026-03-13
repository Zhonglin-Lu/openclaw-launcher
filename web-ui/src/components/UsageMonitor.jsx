import { useState, useEffect } from 'react';

export default function UsageMonitor() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(null);

  useEffect(() => {
    fetchUsage();
  }, []);

  const fetchUsage = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/usage');
      const result = await res.json();
      if (result.success) {
        setUsage(result.usage);
      }
    } catch (error) {
      console.error('获取用量失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const testModel = async (modelId, provider) => {
    setTesting(modelId);
    setTestResult(null);
    
    try {
      const res = await fetch('http://localhost:3001/api/models/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ modelId, provider })
      });
      const result = await res.json();
      setTestResult(result);
    } catch (error) {
      setTestResult({ success: false, error: error.message });
    } finally {
      setTesting(null);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
          <div className="text-gray-600 mt-4">加载用量信息...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 模型用量监控</h2>

      {/* 用量摘要 */}
      {usage && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-purple-600">{usage.totalModels}</div>
            <div className="text-sm text-gray-600 mt-1">可用模型</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-blue-600">{usage.providers?.length || 0}</div>
            <div className="text-sm text-gray-600 mt-1">提供商</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
            <div className="text-3xl font-bold text-green-600">¥0</div>
            <div className="text-sm text-gray-600 mt-1">本月花费</div>
          </div>
        </div>
      )}

      {/* 模型列表 */}
      {usage && usage.models && usage.models.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">可用模型列表</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {usage.models.map((model, index) => (
              <div
                key={index}
                className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-4 border border-gray-200 hover:border-purple-300 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-800">{model.id}</span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        {model.provider}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span>📚 上下文：{(model.contextWindow / 1000).toFixed(0)}k</span>
                      <span>📝 最大输出：{model.maxTokens}</span>
                      <span>💰 输入：¥{model.cost?.input || 0}/1k tokens</span>
                      <span>💰 输出：¥{model.cost?.output || 0}/1k tokens</span>
                    </div>
                  </div>
                  <button
                    onClick={() => testModel(model.id, model.provider)}
                    disabled={testing === model.id}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-all disabled:opacity-50"
                  >
                    {testing === model.id ? '🔄 测试中...' : '🧪 测试连接'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 测试结果 */}
      {testResult && (
        <div className={`mt-6 p-4 rounded-xl ${
          testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{testResult.success ? '✅' : '❌'}</span>
            <span className="font-bold">测试结果</span>
          </div>
          <div className="mt-2 text-sm">
            {testResult.success ? (
              <>
                <div>模型：{testResult.model}</div>
                <div>延迟：{testResult.latency?.toFixed(0)}ms</div>
                <div>{testResult.message}</div>
              </>
            ) : (
              <div>错误：{testResult.error}</div>
            )}
          </div>
        </div>
      )}

      {/* 用量警告 */}
      <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded-r-lg">
        <div className="flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <div className="font-bold text-yellow-800">用量提醒</div>
            <div className="text-sm text-yellow-700 mt-1">
              当前用量统计功能正在开发中。即将支持：
              <ul className="list-disc list-inside mt-2 text-xs">
                <li>实时 Token 用量统计</li>
                <li>每日/每周/每月用量报告</li>
                <li>用量警告和自动限流</li>
                <li>成本分析和优化建议</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
