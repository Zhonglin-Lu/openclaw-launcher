import { useState, useEffect } from 'react';

export default function SkillsMarket({ addLog }) {
  const [recommendedSkills, setRecommendedSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [installing, setInstalling] = useState(null);
  const [installedSkills, setInstalledSkills] = useState([]);

  useEffect(() => {
    loadMarketData();
    loadInstalledSkills();
  }, []);

  const loadMarketData = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/skills/list');
      const result = await res.json();
      if (result.success) {
        setAllSkills(result.skills);
        setRecommendedSkills(result.skills.slice(0, 12));
      }

      const catRes = await fetch('http://localhost:3001/api/skills/categories');
      const catResult = await catRes.json();
      if (catResult.success) {
        setCategories(catResult.categories);
      }
    } catch (error) {
      console.error('加载市场数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInstalledSkills = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/status');
      const result = await res.json();
      if (result.success) {
        setInstalledSkills(result.data.skills.list.map(s => s.name));
      }
    } catch (error) {
      console.error('加载已安装 Skills 失败:', error);
    }
  };

  const handleInstall = async (skillName) => {
    setInstalling(skillName);
    addLog(`正在安装 ${skillName}...`);
    
    try {
      const res = await fetch('http://localhost:3001/api/skills/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: skillName })
      });
      const result = await res.json();
      
      if (result.success) {
        addLog(`✅ ${skillName} 安装成功`);
        loadInstalledSkills();
      } else {
        addLog(`❌ ${skillName} 安装失败：${result.error}`);
      }
    } catch (error) {
      addLog(`❌ ${skillName} 安装失败：${error.message}`);
    } finally {
      setInstalling(null);
    }
  };

  const getCategoryIcon = (categoryId) => {
    const icons = {
      'ai-ml': '🤖',
      'office': '💼',
      'communication': '💬',
      'media': '🎵',
      'system': '🛠️',
      'academic': '📚',
      'dev': '💻',
      'lifestyle': '🌤️',
      'qqbot': '🐧',
      'other': '📋'
    };
    return icons[categoryId] || '📦';
  };

  const filteredSkills = selectedCategory === 'all' 
    ? allSkills 
    : allSkills.filter(s => s.category === selectedCategory);

  if (loading) {
    return (
      <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/30">
        <div className="text-center py-20">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500"></div>
            <div className="absolute inset-0 flex items-center justify-center text-xl">🏪</div>
          </div>
          <div className="text-gray-600 mt-6 font-semibold text-lg">正在加载 Skills 市场...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* 头部统计 */}
      <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/30 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 gradient-animate">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-white mb-2">🏪 Skills 市场</h2>
            <p className="text-white/80 font-medium">
              浏览和安装 {allSkills.length} 个可用 Skills，增强你的 OpenClaw 能力
            </p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-4xl font-black text-white mb-1">{installedSkills.length}</div>
              <div className="text-white/70 text-sm font-semibold">已安装</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-white mb-1">{allSkills.length}</div>
              <div className="text-white/70 text-sm font-semibold">可用</div>
            </div>
          </div>
        </div>
      </div>

      {/* 分类筛选 */}
      <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/30">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">📂</span>
          <h3 className="text-2xl font-black text-gray-800">分类浏览</h3>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-6 py-3 rounded-full font-bold text-sm transition-all card-hover ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md'
            }`}
          >
            全部 ({allSkills.length})
          </button>
          {categories.map(cat => {
            const count = allSkills.filter(s => s.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-6 py-3 rounded-full font-bold text-sm transition-all card-hover ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg scale-105'
                    : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md'
                }`}
              >
                {getCategoryIcon(cat.id)} {cat.name.replace(/📚|🤖|💼|💬|🎵|🛠️|💻|🌤️|🐧|📋/g, '').trim()} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 推荐 Skills */}
      {selectedCategory === 'all' && (
        <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/30">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">⭐</span>
            <h3 className="text-2xl font-black text-gray-800">推荐 Skills</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recommendedSkills.slice(0, 6).map((skill, index) => (
              <SkillCard
                key={index}
                skill={skill}
                isInstalled={installedSkills.includes(skill.name)}
                onInstall={handleInstall}
                installing={installing === skill.name}
                getCategoryIcon={getCategoryIcon}
              />
            ))}
          </div>
        </div>
      )}

      {/* 所有 Skills */}
      <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/30">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">📦</span>
          <h3 className="text-2xl font-black text-gray-800">
            {selectedCategory === 'all' ? '全部 Skills' : getCategoryIcon(selectedCategory) + ' ' + selectedCategory}
          </h3>
        </div>
        {filteredSkills.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-6">😕</div>
            <h4 className="text-2xl font-black text-gray-700 mb-3">该分类下暂无 Skills</h4>
            <p className="text-gray-500 font-medium">试试其他分类吧</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSkills.map((skill, index) => (
              <SkillCard
                key={index}
                skill={skill}
                isInstalled={installedSkills.includes(skill.name)}
                onInstall={handleInstall}
                installing={installing === skill.name}
                getCategoryIcon={getCategoryIcon}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Skills 卡片组件
function SkillCard({ skill, isInstalled, onInstall, installing, getCategoryIcon }) {
  return (
    <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-200/50 hover:border-purple-400/50 hover:shadow-xl transition-all duration-300 card-hover overflow-hidden">
      {/* 背景光晕 */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-2xl group-hover:opacity-100 opacity-0 transition-opacity"></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h4 className="font-black text-xl text-gray-800 mb-2 group-hover:text-purple-700 transition-colors line-clamp-1">
              {skill.name}
            </h4>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-bold">
                {getCategoryIcon(skill.category)} {skill.categoryName.replace(/[^a-zA-Z\u4e00-\u9fa5]/g, '').slice(0, 6)}
              </span>
              <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                skill.source === 'system' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white' :
                skill.source === 'workspace' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' :
                'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
              }`}>
                {skill.source}
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 font-medium leading-relaxed">
          {skill.description}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mb-5">
          {skill.tags.slice(0, 3).map((tag, i) => (
            <span key={i} className="px-2.5 py-1 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 rounded-full text-xs font-semibold border border-gray-200/50">
              #{tag}
            </span>
          ))}
        </div>
        
        <button
          onClick={() => onInstall(skill.name)}
          disabled={isInstalled || installing}
          className={`w-full py-3.5 rounded-xl font-bold transition-all btn-hover ${
            isInstalled
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : installing
              ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white animate-pulse shadow-lg'
              : 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40'
          }`}
        >
          {isInstalled ? '✅ 已安装' : installing ? '⏳ 安装中...' : '⬇️ 一键安装'}
        </button>
      </div>
    </div>
  );
}
