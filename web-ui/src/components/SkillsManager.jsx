import { useState, useEffect } from 'react';

export default function SkillsManager({ addLog }) {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadSkills();
    loadCategories();
  }, []);

  const loadSkills = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedSource !== 'all') params.append('source', selectedSource);
      if (searchQuery) params.append('search', searchQuery);

      const res = await fetch(`http://localhost:3001/api/skills/list?${params}`);
      const result = await res.json();
      if (result.success) {
        setSkills(result.skills);
      }
    } catch (error) {
      console.error('加载 Skills 失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/skills/categories');
      const result = await res.json();
      if (result.success) {
        setCategories(result.categories);
      }
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    loadSkills();
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setLoading(true);
    loadSkillsWithFilters(category, selectedSource, searchQuery);
  };

  const handleSourceChange = (source) => {
    setSelectedSource(source);
    setLoading(true);
    loadSkillsWithFilters(selectedCategory, source, searchQuery);
  };

  const loadSkillsWithFilters = async (category, source, search) => {
    try {
      const params = new URLSearchParams();
      if (category !== 'all') params.append('category', category);
      if (source !== 'all') params.append('source', source);
      if (search) params.append('search', search);

      const res = await fetch(`http://localhost:3001/api/skills/list?${params}`);
      const result = await res.json();
      if (result.success) {
        setSkills(result.skills);
      }
    } catch (error) {
      console.error('加载 Skills 失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceColor = (source) => {
    if (source === 'system') return 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white';
    if (source === 'workspace') return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
    if (source === 'extra') return 'bg-gradient-to-r from-green-500 to-emerald-500 text-white';
    return 'bg-gray-100 text-gray-700';
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

  if (loading) {
    return (
      <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/30">
        <div className="text-center py-20">
          <div className="relative inline-block">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500/30 border-t-purple-500"></div>
            <div className="absolute inset-0 flex items-center justify-center text-xl">🧩</div>
          </div>
          <div className="text-gray-600 mt-6 font-semibold text-lg">正在加载 Skills...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-3xl p-8 shadow-2xl border border-white/30 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🧩</span>
          <h2 className="text-3xl font-black text-gray-800">Skills 管理中心</h2>
        </div>
        <div className="flex gap-2 glass p-1.5 rounded-xl">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              viewMode === 'grid' 
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg' 
                : 'bg-white/50 text-gray-600 hover:bg-white/70'
            }`}
          >
            网格
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-bold transition-all ${
              viewMode === 'list' 
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg' 
                : 'bg-white/50 text-gray-600 hover:bg-white/70'
            }`}
          >
            列表
          </button>
        </div>
      </div>

      {/* 筛选器 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="md:col-span-2 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="🔍 搜索技能名称、描述或标签..."
            className="w-full px-5 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all font-medium"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => handleCategoryChange(e.target.value)}
          className="px-5 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all font-medium cursor-pointer"
        >
          <option value="all">📂 全部分类</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>
              {getCategoryIcon(cat.id)} {cat.name.replace(/📚|🤖|💼|💬|🎵|🛠️|💻|🌤️|🐧|📋/g, '').trim()} ({cat.count})
            </option>
          ))}
        </select>

        <select
          value={selectedSource}
          onChange={(e) => handleSourceChange(e.target.value)}
          className="px-5 py-4 bg-white/80 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:border-purple-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 transition-all font-medium cursor-pointer"
        >
          <option value="all">📦 全部来源</option>
          <option value="system">📦 系统 Skills</option>
          <option value="workspace">💼 工作区</option>
          <option value="extra">🔌 扩展</option>
        </select>
      </div>

      {/* 分类标签 */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => handleCategoryChange('all')}
          className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all card-hover ${
            selectedCategory === 'all'
              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg scale-105'
              : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md'
          }`}
        >
          全部 ({skills.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all card-hover ${
              selectedCategory === cat.id
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg scale-105'
                : 'bg-white/80 text-gray-600 hover:bg-white hover:shadow-md'
            }`}
          >
            {getCategoryIcon(cat.id)} {cat.name.replace(/📚|🤖|💼|💬|🎵|🛠️|💻|🌤️|🐧|📋/g, '').trim()} ({cat.count})
          </button>
        ))}
      </div>

      {/* Skills 列表 */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {skills.map((skill, index) => (
            <SkillCard key={index} skill={skill} getSourceColor={getSourceColor} />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {skills.map((skill, index) => (
            <SkillListItem key={index} skill={skill} getSourceColor={getSourceColor} />
          ))}
        </div>
      )}

      {/* 空状态 */}
      {skills.length === 0 && !loading && (
        <div className="text-center py-20">
          <div className="text-7xl mb-6">🔍</div>
          <h3 className="text-2xl font-black text-gray-700 mb-3">未找到匹配的 Skills</h3>
          <p className="text-gray-500 font-medium">尝试其他搜索词或分类</p>
        </div>
      )}
    </div>
  );
}

// 网格卡片组件
function SkillCard({ skill, getSourceColor }) {
  return (
    <div className="group relative bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-200/50 hover:border-purple-400/50 hover:shadow-xl transition-all duration-300 card-hover cursor-pointer overflow-hidden">
      {/* 背景光晕 */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 rounded-full blur-2xl group-hover:opacity-100 opacity-0 transition-opacity"></div>
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <h3 className="font-black text-xl text-gray-800 group-hover:text-purple-700 transition-colors line-clamp-1">
            {skill.name}
          </h3>
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getSourceColor(skill.source)}`}>
            {skill.source === 'system' ? '📦 系统' : skill.source === 'workspace' ? '💼 工作区' : '🔌 扩展'}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 font-medium leading-relaxed">
          {skill.description}
        </p>
        
        <div className="flex flex-wrap gap-1.5 mb-4">
          {skill.tags.slice(0, 4).map((tag, i) => (
            <span key={i} className="px-2.5 py-1 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 rounded-full text-xs font-semibold border border-gray-200/50">
              #{tag}
            </span>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full">
            {skill.categoryName}
          </span>
          <span className="group-hover:text-purple-600 transition-colors flex items-center gap-1">
            详情 <span className="group-hover:translate-x-1 transition-transform">→</span>
          </span>
        </div>
      </div>
    </div>
  );
}

// 列表项组件
function SkillListItem({ skill, getSourceColor }) {
  return (
    <div className="group bg-gradient-to-r from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-200/50 hover:border-purple-400/50 hover:shadow-lg transition-all duration-300 card-hover cursor-pointer">
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-black text-xl text-gray-800 group-hover:text-purple-700 transition-colors">
              {skill.name}
            </h3>
            <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getSourceColor(skill.source)}`}>
              {skill.source === 'system' ? '📦 系统' : skill.source === 'workspace' ? '💼 工作区' : '🔌 扩展'}
            </span>
            <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-xs font-bold">
              {skill.categoryName}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 font-medium leading-relaxed">
            {skill.description}
          </p>
          
          <div className="flex flex-wrap gap-1.5">
            {skill.tags.map((tag, i) => (
              <span key={i} className="px-2.5 py-1 bg-gradient-to-r from-gray-100 to-gray-50 text-gray-600 rounded-full text-xs font-semibold border border-gray-200/50">
                #{tag}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex items-center">
          <button className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-xl text-sm font-bold btn-hover shadow-lg shadow-purple-500/30">
            查看详情
          </button>
        </div>
      </div>
    </div>
  );
}
