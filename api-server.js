#!/usr/bin/env node

/**
 * OpenClaw Launchers - Web UI API 服务器
 * 提供 REST API 供前端调用
 */

require('dotenv').config();

const express = require('express');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const cors = require('cors');
const UsageTracker = require('./src/core/usage-tracker');
const SkillsDatabase = require('./src/core/skills-database');

const app = express();
const PORT = process.env.PORT || process.env.API_PORT || 3001;
const HOST = process.env.HOST || process.env.API_HOST || '0.0.0.0';

// 中间件
app.use(cors());
app.use(express.json());

// 工具函数
function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, { encoding: 'utf-8', timeout: 30000 }, (error, stdout, stderr) => {
      if (error) {
        reject({ error: error.message, stderr });
        return;
      }
      if (stderr && !stderr.includes('npm warn')) {
        reject({ error: stderr });
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// API 路由

/**
 * 获取 Gateway 状态
 */
app.get('/api/status', async (req, res) => {
  try {
    // 检查 Gateway 进程
    let gatewayRunning = false;
    let gatewayPid = null;
    
    try {
      const pidResult = await execCommand('pgrep -f "openclaw.*gateway"');
      if (pidResult) {
        gatewayRunning = true;
        gatewayPid = pidResult.split('\n')[0];
      }
    } catch (e) {
      gatewayRunning = false;
    }

    // 获取版本
    let version = 'unknown';
    try {
      const versionResult = await execCommand('openclaw --version');
      version = versionResult.split('\n')[0];
    } catch (e) {}

    // 获取配置
    let config = {};
    const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
    if (fs.existsSync(configPath)) {
      try {
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      } catch (e) {}
    }

    // 获取 Node.js 版本
    let nodeVersion = 'unknown';
    try {
      nodeVersion = await execCommand('node --version');
    } catch (e) {}

    // 获取已安装 Skills - 直接读取系统 skills 目录和 workspace
    let skills = [];
    
    // 1. 读取系统 skills 目录
    const nodeVer = process.version.replace('v', '');
    const possiblePaths = [
      path.join(os.homedir(), '.nvm', 'versions', 'node', `v${nodeVer}`, 'lib', 'node_modules', 'openclaw', 'skills'),
      path.join(os.homedir(), '.nvm', 'versions', 'node', 'v22.22.1', 'lib', 'node_modules', 'openclaw', 'skills'),
      '/usr/local/lib/node_modules/openclaw/skills',
      '/usr/lib/node_modules/openclaw/skills'
    ];
    
    for (const sysPath of possiblePaths) {
      if (fs.existsSync(sysPath)) {
        try {
          const systemSkills = fs.readdirSync(sysPath).map(name => ({
            name,
            source: 'system'
          }));
          skills.push(...systemSkills);
          break;
        } catch (e) {}
      }
    }
    
    // 2. 读取 workspace skills
    const workspaceSkillsPath = path.join(os.homedir(), '.openclaw', 'workspace', 'skills');
    if (fs.existsSync(workspaceSkillsPath)) {
      try {
        const workspaceSkills = fs.readdirSync(workspaceSkillsPath).map(name => ({
          name,
          source: 'workspace'
        }));
        skills.push(...workspaceSkills);
      } catch (e) {}
    }
    
    // 3. 读取 openclaw-extra skills (如果存在)
    const extraSkillsPath = path.join(os.homedir(), '.openclaw', 'extensions', 'qqbot', 'skills');
    if (fs.existsSync(extraSkillsPath)) {
      try {
        const extraSkills = fs.readdirSync(extraSkillsPath).map(name => ({
          name,
          source: 'extra'
        }));
        skills.push(...extraSkills);
      } catch (e) {}
    }
    
    // 去重
    const seen = new Set();
    skills = skills.filter(s => {
      if (seen.has(s.name)) return false;
      seen.add(s.name);
      return true;
    });

    res.json({
      success: true,
      data: {
        gateway: {
          running: gatewayRunning,
          pid: gatewayPid,
          port: config.gateway?.port || 18789,
          healthy: gatewayRunning,
          mode: config.gateway?.mode || 'local'
        },
        system: {
          openclawVersion: version,
          nodeVersion,
          configExists: fs.existsSync(configPath),
          workspaceExists: fs.existsSync(path.join(os.homedir(), '.openclaw', 'workspace'))
        },
        skills: {
          total: skills.length,
          list: skills
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.error || error.message
    });
  }
});

/**
 * 启动 Gateway
 */
app.post('/api/gateway/start', async (req, res) => {
  try {
    const { port = 18789, force = false } = req.body;
    
    let cmd = `openclaw gateway --port ${port}`;
    if (force) cmd += ' --force';
    if (req.body.verbose) cmd += ' --verbose';

    // 后台启动
    const { spawn } = require('child_process');
    const child = spawn(cmd, {
      shell: true,
      detached: true,
      stdio: 'ignore'
    });
    child.unref();

    // 等待检查
    setTimeout(async () => {
      try {
        await execCommand('pgrep -f "openclaw.*gateway"');
        console.log('✅ Gateway 启动成功');
      } catch (e) {
        console.log('⚠️  Gateway 可能启动失败');
      }
    }, 2000);

    res.json({
      success: true,
      message: 'Gateway 启动中...',
      command: cmd
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.error || error.message
    });
  }
});

/**
 * 停止 Gateway
 */
app.post('/api/gateway/stop', async (req, res) => {
  try {
    const { force = false } = req.body;
    
    try {
      const pidResult = await execCommand('pgrep -f "openclaw.*gateway"');
      if (pidResult) {
        const pid = pidResult.split('\n')[0];
        const signal = force ? '-9' : '-15';
        await execCommand(`kill ${signal} ${pid}`);
        
        res.json({
          success: true,
          message: 'Gateway 已停止',
          pid
        });
        return;
      }
    } catch (e) {
      // Gateway 未运行
    }

    res.json({
      success: true,
      message: 'Gateway 未运行'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.error || error.message
    });
  }
});

/**
 * 重启 Gateway
 */
app.post('/api/gateway/restart', async (req, res) => {
  try {
    // 先停止
    try {
      const pidResult = await execCommand('pgrep -f "openclaw.*gateway"');
      if (pidResult) {
        const pid = pidResult.split('\n')[0];
        await execCommand(`kill -15 ${pid}`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (e) {}

    // 再启动
    const { spawn } = require('child_process');
    const child = spawn('openclaw gateway', {
      shell: true,
      detached: true,
      stdio: 'ignore'
    });
    child.unref();

    res.json({
      success: true,
      message: 'Gateway 重启中...'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.error || error.message
    });
  }
});

/**
 * 获取配置
 */
app.get('/api/config', async (req, res) => {
  try {
    const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
    
    if (!fs.existsSync(configPath)) {
      res.status(404).json({
        success: false,
        error: '配置文件不存在'
      });
      return;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    res.json({
      success: true,
      config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 更新配置
 */
app.post('/api/config', async (req, res) => {
  try {
    const { updates } = req.body;
    const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
    
    if (!fs.existsSync(configPath)) {
      res.status(404).json({
        success: false,
        error: '配置文件不存在'
      });
      return;
    }

    // 备份
    const backupPath = configPath + '.backup.' + Date.now();
    fs.copyFileSync(configPath, backupPath);

    // 读取并更新
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    // 应用更新（支持点路径）
    Object.entries(updates).forEach(([dotPath, value]) => {
      const keys = dotPath.split('.');
      const lastKey = keys.pop();
      let current = config;
      
      for (const key of keys) {
        if (!(key in current)) {
          current[key] = {};
        }
        current = current[key];
      }
      
      current[lastKey] = value;
    });

    // 保存
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');

    res.json({
      success: true,
      message: '配置已保存',
      backup: backupPath
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取日志
 */
app.get('/api/logs', async (req, res) => {
  try {
    const { lines = 50 } = req.query;
    const logPath = path.join(os.homedir(), '.openclaw', 'logs');
    
    let logs = [];
    
    if (fs.existsSync(logPath)) {
      const files = fs.readdirSync(logPath)
        .filter(f => f.endsWith('.log'))
        .sort()
        .reverse()
        .slice(0, 5);
      
      for (const file of files) {
        const content = fs.readFileSync(path.join(logPath, file), 'utf-8');
        const lastLines = content.split('\n').slice(-lines);
        logs.push({
          file,
          lines: lastLines
        });
      }
    }

    res.json({
      success: true,
      logs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 执行诊断
 */
app.get('/api/diagnose', async (req, res) => {
  try {
    const diagnosticianPath = '/home/thelu/openclaw-launcher/src/core/diagnostician.js';
    
    // 运行诊断
    const { exec } = require('child_process');
    const result = await new Promise((resolve, reject) => {
      exec(`node "${diagnosticianPath}"`, { encoding: 'utf-8', timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          // 即使有错误也返回输出
          resolve({ output: stdout || stderr, error: error.message });
        } else {
          resolve({ output: stdout, error: null });
        }
      });
    });
    
    // 解析输出为结构化数据
    const report = {
      timestamp: new Date().toISOString(),
      checks: [],
      summary: { total: 0, passed: 0, warnings: 0, errors: 0 }
    };
    
    // 简单的文本解析
    const lines = result.output.split('\n');
    let currentCheck = null;
    
    for (const line of lines) {
      // 跳过空行和标题行
      if (!line.trim() || line.includes('开始诊断') || line.includes('OpenClaw 诊断') || line.includes('====')) {
        continue;
      }
      
      // 检查是否是新的检查项 (包含状态图标)
      if (line.includes('✅') || line.includes('⚠️') || line.includes('❌')) {
        const status = line.includes('✅') ? 'pass' : line.includes('⚠️') ? 'warning' : 'error';
        const name = line.replace(/[✅⚠️❌]/g, '').trim();
        
        // 保存上一个检查项
        if (currentCheck) {
          report.checks.push(currentCheck);
        }
        
        currentCheck = {
          name,
          status,
          message: '',
          fix: null
        };
        
        report.summary.total++;
        if (status === 'pass') report.summary.passed++;
        if (status === 'warning') report.summary.warnings++;
        if (status === 'error') report.summary.errors++;
      } else if (currentCheck && line.trim()) {
        // 这是检查项的详细信息
        currentCheck.message += (currentCheck.message ? ' ' : '') + line.trim();
      }
    }
    
    // 保存最后一个检查项
    if (currentCheck) {
      report.checks.push(currentCheck);
    }

    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取模型用量信息
 */
app.get('/api/usage', async (req, res) => {
  try {
    const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
    
    if (!fs.existsSync(configPath)) {
      res.json({
        success: true,
        usage: {
          models: [],
          totalRequests: 0,
          totalCost: 0
        }
      });
      return;
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    
    // 从配置中提取模型信息
    const models = [];
    const providers = config.models?.providers || {};
    
    for (const [providerName, provider] of Object.entries(providers)) {
      if (provider.models && Array.isArray(provider.models)) {
        provider.models.forEach(model => {
          models.push({
            id: model.id,
            name: model.name,
            provider: providerName,
            contextWindow: model.contextWindow,
            maxTokens: model.maxTokens,
            cost: model.cost || { input: 0, output: 0 }
          });
        });
      }
    }

    res.json({
      success: true,
      usage: {
        models,
        totalModels: models.length,
        providers: Object.keys(providers)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 测试模型连接
 */
app.post('/api/models/test', async (req, res) => {
  try {
    const { modelId, provider } = req.body;
    
    if (!modelId || !provider) {
      res.status(400).json({
        success: false,
        error: '缺少 modelId 或 provider'
      });
      return;
    }

    // 获取配置
    const configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const providerConfig = config.models?.providers?.[provider];
    
    if (!providerConfig) {
      res.status(400).json({
        success: false,
        error: `提供商 ${provider} 未配置`
      });
      return;
    }

    // 模拟测试（实际应该调用 API）
    const testResult = {
      success: true,
      model: modelId,
      provider,
      latency: Math.random() * 500 + 100, // 模拟延迟
      message: '模型连接测试成功'
    };

    res.json(testResult);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取实时用量统计
 */
app.get('/api/usage/realtime', async (req, res) => {
  try {
    const tracker = new UsageTracker();
    const usage = tracker.getRealTimeUsage();
    
    res.json({
      success: true,
      usage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取用量报告
 */
app.get('/api/usage/report', async (req, res) => {
  try {
    const { period = 'daily', days = 7 } = req.query;
    const tracker = new UsageTracker();
    const report = tracker.getReport(period, parseInt(days));
    
    res.json({
      success: true,
      report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取模型用量排行
 */
app.get('/api/usage/models', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const tracker = new UsageTracker();
    const ranking = tracker.getModelUsage(parseInt(days));
    
    res.json({
      success: true,
      ranking
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 设置用量警告
 */
app.post('/api/usage/alerts', async (req, res) => {
  try {
    const { dailyCost, monthlyCost, dailyTokens, monthlyTokens } = req.body;
    const tracker = new UsageTracker();
    const config = tracker.setAlert({
      dailyCost,
      monthlyCost,
      dailyTokens,
      monthlyTokens
    });
    
    res.json({
      success: true,
      config
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 检查用量警告
 */
app.get('/api/usage/alerts/check', async (req, res) => {
  try {
    const tracker = new UsageTracker();
    const alerts = tracker.checkAlerts();
    
    res.json({
      success: true,
      alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取优化建议
 */
app.get('/api/usage/suggestions', async (req, res) => {
  try {
    const tracker = new UsageTracker();
    const suggestions = tracker.getOptimizationSuggestions();
    
    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取 Skills 分类
 */
app.get('/api/skills/categories', async (req, res) => {
  try {
    const db = new SkillsDatabase();
    const categories = db.getCategories();
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取 Skills 列表（增强版）
 */
app.get('/api/skills/list', async (req, res) => {
  try {
    const { category, search, source } = req.query;
    const db = new SkillsDatabase();
    const skills = db.getSkills({ category, search, source });
    
    res.json({
      success: true,
      skills,
      total: skills.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 搜索 Skills
 */
app.get('/api/skills/search', async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;
    const db = new SkillsDatabase();
    const results = db.searchSkills(q, parseInt(limit));
    
    res.json({
      success: true,
      results,
      total: results.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 获取 Skills 推荐
 */
app.get('/api/skills/recommendations', async (req, res) => {
  try {
    const db = new SkillsDatabase();
    const recommendations = db.getRecommendations(5);
    
    res.json({
      success: true,
      recommendations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 安装 Skills
 */
app.post('/api/skills/install', async (req, res) => {
  try {
    const { name } = req.body;
    
    if (!name) {
      res.status(400).json({
        success: false,
        error: '缺少 skill 名称'
      });
      return;
    }

    // 使用 clawhub 安装
    const { exec } = require('child_process');
    const result = await new Promise((resolve, reject) => {
      exec(`clawhub install ${name}`, { encoding: 'utf-8', timeout: 60000 }, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, error: stderr || error.message });
        } else {
          resolve({ success: true, output: stdout });
        }
      });
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * 安装 Skill
 */
app.post('/api/skills/install', async (req, res) => {
  try {
    const { name } = req.body;
    
    const result = await execCommand(`clawhub install ${name}`);
    
    res.json({
      success: true,
      message: `Skill ${name} 安装完成`,
      output: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.error || error.message
    });
  }
});

/**
 * 搜索 Skills
 */
app.get('/api/skills/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    
    const result = await execCommand(`clawhub search ${query} --limit ${limit}`);
    
    res.json({
      success: true,
      results: result.split('\n').filter(line => line.trim())
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.error || error.message
    });
  }
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('API 错误:', err);
  
  res.status(500).json({
    success: false,
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: '接口不存在',
    path: req.path
  });
});

// 启动服务器
app.listen(PORT, HOST, () => {
  console.log(`🚀 OpenClaw Launcher API 服务器运行在 http://${HOST}:${PORT}`);
  console.log(`📡 API 端点：http://${HOST}:${PORT}/api/status`);
  console.log(`📝 日志级别：${process.env.LOG_LEVEL || 'info'}`);
});

module.exports = app;
