import { useState } from 'react';
import { installSkill, searchSkills } from '../api';

export default function SkillsList({ skills = [] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [installing, setInstalling] = useState(null);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const result = await searchSkills(searchQuery);
      if (result.success) {
        setSearchResults(result.results);
      }
    } catch (error) {
      console.error('搜索失败:', error);
    } finally {
      setSearching(false);
    }
  };

  const handleInstall = async (skillName) => {
    setInstalling(skillName);
    try {
      const result = await installSkill(skillName);
      alert(result.success ? `安装成功！` : `安装失败：${result.error}`);
    } catch (error) {
      alert(`安装失败：${error.message}`);
    } finally {
      setInstalling(null);
    }
  };

  // 按来源分组
  const systemSkills = skills.filter(s => s.source === 'system');
  const workspaceSkills = skills.filter(s => s.source === 'workspace');

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">🧩 Skills 管理</h2>

      {/* 统计信息 */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-blue-600">{skills.length}</div>
          <div className="text-sm text-gray-600 mt-1">总计</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">{systemSkills.length}</div>
          <div className="text-sm text-gray-600 mt-1">系统 Skills</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-600">{workspaceSkills.length}</div>
          <div className="text-sm text-gray-600 mt-1">Workspace</div>
        </div>
      </div>

      {/* 系统 Skills */}
      {systemSkills.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span>📦</span> 系统 Skills ({systemSkills.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {systemSkills.map((skill, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                  {skill.name}
                </div>
                <div className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                  <span>📦</span> 系统
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workspace Skills */}
      {workspaceSkills.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <span>💼</span> Workspace Skills ({workspaceSkills.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {workspaceSkills.map((skill, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-200 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="font-bold text-gray-800 group-hover:text-purple-700 transition-colors">
                  {skill.name}
                </div>
                <div className="text-xs text-purple-600 mt-2 flex items-center gap-1">
                  <span>💼</span> Workspace
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 搜索 Skills */}
      <div className="border-t pt-8">
        <h3 className="text-xl font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <span>🔍</span> 搜索 Skills
        </h3>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="输入技能名称，如：coding, frontend, backend, python..."
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
          />
          <button
            onClick={handleSearch}
            disabled={searching}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {searching ? '🔄 搜索中...' : '🔍 搜索'}
          </button>
        </div>

        {/* 搜索结果 */}
        {searchResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((result, index) => {
              const skillName = result.split(/\s+/)[0];
              return (
                <div
                  key={index}
                  className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all"
                >
                  <div className="font-bold text-gray-800">{skillName || result}</div>
                  <button
                    onClick={() => handleInstall(skillName)}
                    disabled={installing === skillName}
                    className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all disabled:opacity-50 w-full"
                  >
                    {installing === skillName ? '⏳ 安装中...' : '⬇️ 安装'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
