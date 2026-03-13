#!/usr/bin/env node

/**
 * Skills 数据库和分类管理
 * 提供 Skills 详细信息、分类、搜索功能
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class SkillsDatabase {
  constructor() {
    this.skillsData = this.loadSkillsData();
  }

  /**
   * 加载 Skills 数据
   */
  loadSkillsData() {
    return {
      // AI/ML 类
      'coding-agent': {
        name: 'Coding Agent',
        category: 'ai-ml',
        categoryName: '🤖 AI/ML',
        description: '代码开发助手，支持 Codex、Claude Code 等编程 AI',
        tags: ['编程', '代码', '开发', 'AI'],
        version: '1.0.0',
        source: 'system'
      },
      'github': {
        name: 'GitHub',
        category: 'ai-ml',
        categoryName: '🤖 AI/ML',
        description: 'GitHub 操作工具，支持 Issue、PR、仓库管理',
        tags: ['GitHub', '版本控制', '协作'],
        version: '1.0.0',
        source: 'system'
      },
      'gemini': {
        name: 'Gemini',
        category: 'ai-ml',
        categoryName: '🤖 AI/ML',
        description: 'Google Gemini AI 集成',
        tags: ['AI', 'Google', '对话'],
        version: '1.0.0',
        source: 'system'
      },
      'openai-image-gen': {
        name: 'OpenAI Image Gen',
        category: 'ai-ml',
        categoryName: '🤖 AI/ML',
        description: 'OpenAI DALL-E 图像生成',
        tags: ['AI', '图像', '生成', 'DALL-E'],
        version: '1.0.0',
        source: 'system'
      },
      'openai-whisper': {
        name: 'OpenAI Whisper',
        category: 'ai-ml',
        categoryName: '🤖 AI/ML',
        description: 'OpenAI Whisper 语音识别',
        tags: ['AI', '语音', '转文字', 'Whisper'],
        version: '1.0.0',
        source: 'system'
      },
      'openai-whisper-api': {
        name: 'OpenAI Whisper API',
        category: 'ai-ml',
        categoryName: '🤖 AI/ML',
        description: 'OpenAI Whisper API 语音识别',
        tags: ['AI', '语音', 'API'],
        version: '1.0.0',
        source: 'system'
      },
      'sag': {
        name: 'SAG (ElevenLabs TTS)',
        category: 'ai-ml',
        categoryName: '🤖 AI/ML',
        description: 'ElevenLabs 语音合成，支持多种声音',
        tags: ['AI', '语音合成', 'TTS', 'ElevenLabs'],
        version: '1.0.0',
        source: 'system'
      },
      'sherpa-onnx-tts': {
        name: 'Sherpa ONNX TTS',
        category: 'ai-ml',
        categoryName: '🤖 AI/ML',
        description: 'Sherpa ONNX 离线语音合成',
        tags: ['AI', '语音合成', '离线', 'TTS'],
        version: '1.0.0',
        source: 'system'
      },
      
      // 办公自动化类
      'office-automation': {
        name: 'Office Automation',
        category: 'office',
        categoryName: '💼 办公自动化',
        description: 'Word 和 Excel 文件自动化处理，支持批量处理、模板填充',
        tags: ['Office', 'Word', 'Excel', '自动化', '文档'],
        version: '1.0.0',
        source: 'workspace'
      },
      'notion': {
        name: 'Notion',
        category: 'office',
        categoryName: '💼 办公自动化',
        description: 'Notion 笔记管理集成',
        tags: ['Notion', '笔记', '文档'],
        version: '1.0.0',
        source: 'system'
      },
      'obsidian': {
        name: 'Obsidian',
        category: 'office',
        categoryName: '💼 办公自动化',
        description: 'Obsidian Markdown 笔记管理',
        tags: ['Obsidian', 'Markdown', '笔记'],
        version: '1.0.0',
        source: 'system'
      },
      'bear-notes': {
        name: 'Bear Notes',
        category: 'office',
        categoryName: '💼 办公自动化',
        description: 'Bear 笔记应用集成 (macOS)',
        tags: ['Bear', '笔记', 'macOS'],
        version: '1.0.0',
        source: 'system'
      },
      'apple-notes': {
        name: 'Apple Notes',
        category: 'office',
        categoryName: '💼 办公自动化',
        description: 'Apple 备忘录管理 (macOS)',
        tags: ['Apple', '备忘录', 'macOS'],
        version: '1.0.0',
        source: 'system'
      },
      'apple-reminders': {
        name: 'Apple Reminders',
        category: 'office',
        categoryName: '💼 办公自动化',
        description: 'Apple 提醒事项管理 (macOS)',
        tags: ['Apple', '提醒', 'macOS', '待办'],
        version: '1.0.0',
        source: 'system'
      },
      'things-mac': {
        name: 'Things (Mac)',
        category: 'office',
        categoryName: '💼 办公自动化',
        description: 'Things 3 任务管理 (macOS)',
        tags: ['Things', '任务管理', 'macOS', 'GTD'],
        version: '1.0.0',
        source: 'system'
      },
      'trello': {
        name: 'Trello',
        category: 'office',
        categoryName: '💼 办公自动化',
        description: 'Trello 看板管理',
        tags: ['Trello', '看板', '项目管理'],
        version: '1.0.0',
        source: 'system'
      },
      
      // 通讯社交类
      'discord': {
        name: 'Discord',
        category: 'communication',
        categoryName: '💬 通讯社交',
        description: 'Discord 消息管理和机器人控制',
        tags: ['Discord', '聊天', '机器人'],
        version: '1.0.0',
        source: 'system'
      },
      'slack': {
        name: 'Slack',
        category: 'communication',
        categoryName: '💬 通讯社交',
        description: 'Slack 团队协作工具集成',
        tags: ['Slack', '团队协作', '聊天'],
        version: '1.0.0',
        source: 'system'
      },
      'telegram': {
        name: 'Telegram',
        category: 'communication',
        categoryName: '💬 通讯社交',
        description: 'Telegram 消息收发',
        tags: ['Telegram', '聊天', '消息'],
        version: '1.0.0',
        source: 'system'
      },
      'whatsapp': {
        name: 'WhatsApp',
        category: 'communication',
        categoryName: '💬 通讯社交',
        description: 'WhatsApp 消息收发',
        tags: ['WhatsApp', '聊天', '消息'],
        version: '1.0.0',
        source: 'system'
      },
      'wechat': {
        name: 'WeChat',
        category: 'communication',
        categoryName: '💬 通讯社交',
        description: '微信消息集成',
        tags: ['微信', '聊天', '消息'],
        version: '1.0.0',
        source: 'system'
      },
      'imsg': {
        name: 'iMessage',
        category: 'communication',
        categoryName: '💬 通讯社交',
        description: 'Apple iMessage 集成 (macOS)',
        tags: ['iMessage', 'Apple', 'macOS'],
        version: '1.0.0',
        source: 'system'
      },
      'bluebubbles': {
        name: 'BlueBubbles',
        category: 'communication',
        categoryName: '💬 通讯社交',
        description: 'BlueBubbles iMessage 服务器集成',
        tags: ['BlueBubbles', 'iMessage', '服务器'],
        version: '1.0.0',
        source: 'system'
      },
      
      // 媒体娱乐类
      'spotify-player': {
        name: 'Spotify Player',
        category: 'media',
        categoryName: '🎵 媒体娱乐',
        description: 'Spotify 音乐播放控制',
        tags: ['Spotify', '音乐', '播放'],
        version: '1.0.0',
        source: 'system'
      },
      'sonoscli': {
        name: 'Sonos CLI',
        category: 'media',
        categoryName: '🎵 媒体娱乐',
        description: 'Sonos 音响系统控制',
        tags: ['Sonos', '音响', '音乐'],
        version: '1.0.0',
        source: 'system'
      },
      'songsee': {
        name: 'SongSee',
        category: 'media',
        categoryName: '🎵 媒体娱乐',
        description: '歌词搜索和显示',
        tags: ['歌词', '音乐', '搜索'],
        version: '1.0.0',
        source: 'system'
      },
      'video-frames': {
        name: 'Video Frames',
        category: 'media',
        categoryName: '🎵 媒体娱乐',
        description: '视频帧提取和处理',
        tags: ['视频', '帧', '提取'],
        version: '1.0.0',
        source: 'system'
      },
      'openai-image-gen': {
        name: 'OpenAI Image Gen',
        category: 'media',
        categoryName: '🎵 媒体娱乐',
        description: 'DALL-E 图像生成',
        tags: ['AI', '图像', '生成'],
        version: '1.0.0',
        source: 'system'
      },
      'gifgrep': {
        name: 'GIFGrep',
        category: 'media',
        categoryName: '🎵 媒体娱乐',
        description: 'GIF 搜索和管理',
        tags: ['GIF', '搜索', '图片'],
        version: '1.0.0',
        source: 'system'
      },
      
      // 系统工具类
      'healthcheck': {
        name: 'Health Check',
        category: 'system',
        categoryName: '🛠️ 系统工具',
        description: '系统健康检查和安全审计',
        tags: ['健康检查', '安全', '审计', '系统'],
        version: '1.0.0',
        source: 'system'
      },
      'tmux': {
        name: 'Tmux',
        category: 'system',
        categoryName: '🛠️ 系统工具',
        description: 'Tmux 终端会话管理',
        tags: ['Tmux', '终端', '会话管理'],
        version: '1.0.0',
        source: 'system'
      },
      '1password': {
        name: '1Password',
        category: 'system',
        categoryName: '🛠️ 系统工具',
        description: '1Password 密码管理器集成',
        tags: ['1Password', '密码', '安全'],
        version: '1.0.0',
        source: 'system'
      },
      'blucli': {
        name: 'BluCLI',
        category: 'system',
        categoryName: '🛠️ 系统工具',
        description: 'BluOS 音响系统 CLI 控制',
        tags: ['BluOS', '音响', 'CLI'],
        version: '1.0.0',
        source: 'system'
      },
      'openhue': {
        name: 'OpenHue',
        category: 'system',
        categoryName: '🛠️ 系统工具',
        description: 'Philips Hue 智能灯控制',
        tags: ['Hue', '智能灯', '家居'],
        version: '1.0.0',
        source: 'system'
      },
      'camsnap': {
        name: 'CamSnap',
        category: 'system',
        categoryName: '🛠️ 系统工具',
        description: 'RTSP/ONVIF 摄像头截图',
        tags: ['摄像头', '截图', '监控'],
        version: '1.0.0',
        source: 'system'
      },
      'voice-call': {
        name: 'Voice Call',
        category: 'system',
        categoryName: '🛠️ 系统工具',
        description: '语音通话功能',
        tags: ['语音', '通话'],
        version: '1.0.0',
        source: 'system'
      },
      
      // 学术科研类
      'academic-paper-writing': {
        name: 'Academic Paper Writing',
        category: 'academic',
        categoryName: '📚 学术科研',
        description: 'CCF-A 级别学术论文写作规范，包括论文结构、写作风格、创新点包装',
        tags: ['论文', '写作', '学术', '科研'],
        version: '1.0.0',
        source: 'workspace'
      },
      'academic-figure-design': {
        name: 'Academic Figure Design',
        category: 'academic',
        categoryName: '📚 学术科研',
        description: '学术论文图表设计与绘制，包括图表类型选择、配色方案、工具使用',
        tags: ['图表', '设计', '学术', '可视化'],
        version: '1.0.0',
        source: 'workspace'
      },
      'plot': {
        name: 'Plot (pywayne-plot)',
        category: 'academic',
        categoryName: '📚 学术科研',
        description: '增强光谱可视化工具，支持频谱图、时频分析，适用于 IMU、生理信号等',
        tags: ['可视化', '光谱', '图表', 'Python'],
        version: '1.0.0',
        source: 'workspace'
      },
      'memory-manager': {
        name: 'Memory Manager',
        category: 'academic',
        categoryName: '📚 学术科研',
        description: '轻量级 SQLite 记忆管理系统，支持关键词匹配和重要性排序',
        tags: ['记忆', 'SQLite', '管理'],
        version: '1.0.0',
        source: 'workspace'
      },
      
      // 开发工具类
      'gh-issues': {
        name: 'GitHub Issues',
        category: 'dev',
        categoryName: '💻 开发工具',
        description: 'GitHub Issue 管理工具',
        tags: ['GitHub', 'Issue', 'Bug 追踪'],
        version: '1.0.0',
        source: 'system'
      },
      'skill-creator': {
        name: 'Skill Creator',
        category: 'dev',
        categoryName: '💻 开发工具',
        description: '创建、编辑、审核 AgentSkills 的工具',
        tags: ['Skill', '开发', '创建'],
        version: '1.0.0',
        source: 'system'
      },
      'clawhub': {
        name: 'ClawHub',
        category: 'dev',
        categoryName: '💻 开发工具',
        description: 'ClawHub CLI 工具，搜索、安装、更新、发布 skills',
        tags: ['ClawHub', 'Skills', '包管理'],
        version: '1.0.0',
        source: 'system'
      },
      'canvas': {
        name: 'Canvas',
        category: 'dev',
        categoryName: '💻 开发工具',
        description: 'Canvas UI 控制和渲染',
        tags: ['Canvas', 'UI', '渲染'],
        version: '1.0.0',
        source: 'system'
      },
      
      // 生活服务类
      'weather': {
        name: 'Weather',
        category: 'lifestyle',
        categoryName: '🌤️ 生活服务',
        description: '天气预报，支持 wttr.in 和 Open-Meteo',
        tags: ['天气', '预报', '生活'],
        version: '1.0.0',
        source: 'system'
      },
      'goplaces': {
        name: 'GoPlaces',
        category: 'lifestyle',
        categoryName: '🌤️ 生活服务',
        description: '地点搜索和导航',
        tags: ['地点', '导航', '地图'],
        version: '1.0.0',
        source: 'system'
      },
      'himalaya': {
        name: 'Himalaya',
        category: 'lifestyle',
        categoryName: '🌤️ 生活服务',
        description: '喜马拉雅音频内容集成',
        tags: ['喜马拉雅', '音频', '播客'],
        version: '1.0.0',
        source: 'system'
      },
      'blogwatcher': {
        name: 'BlogWatcher',
        category: 'lifestyle',
        categoryName: '🌤️ 生活服务',
        description: '博客和 RSS 订阅监控',
        tags: ['博客', 'RSS', '监控'],
        version: '1.0.0',
        source: 'system'
      },
      
      // QQBot 扩展
      'qqbot-cron': {
        name: 'QQBot Cron',
        category: 'qqbot',
        categoryName: '🐧 QQBot',
        description: 'QQBot 定时提醒技能，支持一次性和周期性提醒',
        tags: ['QQ', '定时', '提醒', 'Cron'],
        version: '1.0.0',
        source: 'extra'
      },
      'qqbot-media': {
        name: 'QQBot Media',
        category: 'qqbot',
        categoryName: '🐧 QQBot',
        description: 'QQBot 图片/语音/视频/文件收发能力',
        tags: ['QQ', '媒体', '图片', '文件'],
        version: '1.0.0',
        source: 'extra'
      },
      
      // 其他工具
      'session-logs': {
        name: 'Session Logs',
        category: 'other',
        categoryName: '📋 其他工具',
        description: '会话日志管理',
        tags: ['日志', '会话', '记录'],
        version: '1.0.0',
        source: 'system'
      },
      'model-usage': {
        name: 'Model Usage',
        category: 'other',
        categoryName: '📋 其他工具',
        description: '模型用量统计',
        tags: ['模型', '用量', '统计'],
        version: '1.0.0',
        source: 'system'
      },
      'nano-pdf': {
        name: 'Nano PDF',
        category: 'other',
        categoryName: '📋 其他工具',
        description: 'PDF 自然语言编辑工具',
        tags: ['PDF', '编辑', 'AI'],
        version: '1.0.0',
        source: 'system'
      },
      'peekaboo': {
        name: 'Peekaboo',
        category: 'other',
        categoryName: '📋 其他工具',
        description: '屏幕截图和标注工具',
        tags: ['截图', '标注', '屏幕'],
        version: '1.0.0',
        source: 'system'
      },
      'xurl': {
        name: 'XURL',
        category: 'other',
        categoryName: '📋 其他工具',
        description: 'URL 短链接生成和管理',
        tags: ['URL', '短链接', '工具'],
        version: '1.0.0',
        source: 'system'
      },
      'oracle': {
        name: 'Oracle',
        category: 'other',
        categoryName: '📋 其他工具',
        description: 'Oracle 数据库集成',
        tags: ['Oracle', '数据库'],
        version: '1.0.0',
        source: 'system'
      },
      'ordercli': {
        name: 'OrderCLI',
        category: 'other',
        categoryName: '📋 其他工具',
        description: '订单管理 CLI 工具',
        tags: ['订单', 'CLI', '管理'],
        version: '1.0.0',
        source: 'system'
      },
      'mcporter': {
        name: 'McPorter',
        category: 'other',
        categoryName: '📋 其他工具',
        description: 'Minecraft 服务器管理工具',
        tags: ['Minecraft', '游戏', '服务器'],
        version: '1.0.0',
        source: 'system'
      },
      'gog': {
        name: 'GOG',
        category: 'other',
        categoryName: '📋 其他工具',
        description: 'GOG 游戏平台集成',
        tags: ['GOG', '游戏', '平台'],
        version: '1.0.0',
        source: 'system'
      },
      'wacli': {
        name: 'WaCLI',
        category: 'other',
        categoryName: '📋 其他工具',
        description: 'WhatsApp CLI 工具',
        tags: ['WhatsApp', 'CLI'],
        version: '1.0.0',
        source: 'system'
      }
    };
  }

  /**
   * 获取所有分类
   */
  getCategories() {
    const categories = {};
    Object.values(this.skillsData).forEach(skill => {
      if (!categories[skill.category]) {
        categories[skill.category] = {
          id: skill.category,
          name: skill.categoryName,
          count: 0
        };
      }
      categories[skill.category].count++;
    });
    return Object.values(categories);
  }

  /**
   * 获取技能列表（支持分类过滤和搜索）
   */
  getSkills(options = {}) {
    const { category, search, source } = options;
    let skills = Object.values(this.skillsData);

    // 分类过滤
    if (category && category !== 'all') {
      skills = skills.filter(s => s.category === category);
    }

    // 来源过滤
    if (source && source !== 'all') {
      skills = skills.filter(s => s.source === source);
    }

    // 搜索
    if (search) {
      const searchLower = search.toLowerCase();
      skills = skills.filter(s => 
        s.name.toLowerCase().includes(searchLower) ||
        s.description.toLowerCase().includes(searchLower) ||
        s.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return skills;
  }

  /**
   * 获取单个技能详情
   */
  getSkillDetail(skillId) {
    return this.skillsData[skillId] || null;
  }

  /**
   * 搜索技能
   */
  searchSkills(query, limit = 20) {
    const queryLower = query.toLowerCase();
    const results = Object.values(this.skillsData).filter(skill => 
      skill.name.toLowerCase().includes(queryLower) ||
      skill.description.toLowerCase().includes(queryLower) ||
      skill.tags.some(tag => tag.toLowerCase().includes(queryLower))
    );

    return results.slice(0, limit);
  }

  /**
   * 获取推荐技能
   */
  getRecommendations(limit = 5) {
    // 按分类推荐
    const categories = this.getCategories();
    const recommendations = [];

    for (const category of categories.slice(0, limit)) {
      const categorySkills = Object.values(this.skillsData)
        .filter(s => s.category === category)
        .slice(0, 1);
      recommendations.push(...categorySkills);
    }

    return recommendations;
  }
}

// 如果直接运行
if (require.main === module) {
  const db = new SkillsDatabase();
  
  console.log('📚 Skills 分类:');
  const categories = db.getCategories();
  categories.forEach(c => {
    console.log(`  ${c.name}: ${c.count} 个`);
  });
  
  console.log('\n🔍 搜索 "编程":');
  const results = db.searchSkills('编程');
  results.forEach(s => {
    console.log(`  - ${s.name}: ${s.description}`);
  });
  
  console.log('\n📋 所有技能:');
  const skills = db.getSkills();
  console.log(`共 ${skills.length} 个技能`);
}

module.exports = SkillsDatabase;
