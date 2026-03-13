#!/usr/bin/env node

/**
 * OpenClaw 配置管理模块
 * 读取、修改、验证 OpenClaw 配置文件
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class ConfigManager {
  constructor() {
    this.configPath = path.join(os.homedir(), '.openclaw', 'openclaw.json');
    this.schemaPath = null; // 可以从 OpenClaw 安装目录获取
    this.config = null;
  }

  /**
   * 读取配置文件
   */
  load() {
    if (!fs.existsSync(this.configPath)) {
      throw new Error(`配置文件不存在：${this.configPath}`);
    }

    try {
      const content = fs.readFileSync(this.configPath, 'utf-8');
      this.config = JSON.parse(content);
      return this.config;
    } catch (error) {
      throw new Error(`读取配置文件失败：${error.message}`);
    }
  }

  /**
   * 保存配置文件
   */
  save() {
    if (!this.config) {
      throw new Error('没有可保存的配置');
    }

    try {
      // 备份原配置
      if (fs.existsSync(this.configPath)) {
        const backupPath = this.configPath + '.backup.' + Date.now();
        fs.copyFileSync(this.configPath, backupPath);
        console.log(`📦 配置已备份：${backupPath}`);
      }

      // 保存新配置
      fs.writeFileSync(this.configPath, JSON.stringify(this.config, null, 2), 'utf-8');
      console.log('✅ 配置已保存');
      return true;
    } catch (error) {
      throw new Error(`保存配置文件失败：${error.message}`);
    }
  }

  /**
   * 获取配置值 (支持点路径)
   */
  get(dotPath, defaultValue = undefined) {
    if (!this.config) {
      this.load();
    }

    const keys = dotPath.split('.');
    let value = this.config;

    for (const key of keys) {
      if (value === undefined || value === null) {
        return defaultValue;
      }
      value = value[key];
    }

    return value !== undefined ? value : defaultValue;
  }

  /**
   * 设置配置值 (支持点路径)
   */
  set(dotPath, value) {
    if (!this.config) {
      this.load();
    }

    const keys = dotPath.split('.');
    const lastKey = keys.pop();
    let current = this.config;

    for (const key of keys) {
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }

    current[lastKey] = value;
    return true;
  }

  /**
   * 删除配置值
   */
  unset(dotPath) {
    if (!this.config) {
      this.load();
    }

    const keys = dotPath.split('.');
    const lastKey = keys.pop();
    let current = this.config;

    for (const key of keys) {
      if (!(key in current)) {
        return false;
      }
      current = current[key];
    }

    if (lastKey in current) {
      delete current[lastKey];
      return true;
    }

    return false;
  }

  /**
   * 验证配置
   */
  validate() {
    if (!this.config) {
      this.load();
    }

    const errors = [];
    const warnings = [];

    // 检查必需字段
    if (!this.config.models || !this.config.models.providers) {
      errors.push('缺少模型配置 (models.providers)');
    }

    if (!this.config.gateway) {
      errors.push('缺少 Gateway 配置 (gateway)');
    }

    // 检查 Gateway 配置
    if (this.config.gateway) {
      if (!['local', 'remote'].includes(this.config.gateway.mode)) {
        warnings.push('Gateway mode 应该是 "local" 或 "remote"');
      }

      if (this.config.gateway.auth && !this.config.gateway.auth.mode) {
        warnings.push('Gateway auth 配置不完整');
      }
    }

    // 检查模型配置
    if (this.config.models?.providers) {
      for (const [providerName, provider] of Object.entries(this.config.models.providers)) {
        if (!provider.apiKey && !provider.baseUrl) {
          warnings.push(`模型提供商 ${providerName} 缺少 apiKey 或 baseUrl`);
        }
      }
    }

    // 检查 agents 配置
    if (!this.config.agents?.defaults?.model?.primary) {
      warnings.push('未设置默认模型 (agents.defaults.model.primary)');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * 获取配置摘要
   */
  getSummary() {
    if (!this.config) {
      this.load();
    }

    return {
      configPath: this.configPath,
      lastModified: fs.statSync(this.configPath).mtime,
      gateway: {
        mode: this.get('gateway.mode'),
        auth: this.get('gateway.auth.mode'),
        port: this.get('gateway.port', 18789)
      },
      models: {
        providers: Object.keys(this.get('models.providers', {})),
        defaultModel: this.get('agents.defaults.model.primary')
      },
      channels: {
        enabled: Object.keys(this.get('channels', {})).filter(
          key => this.get(`channels.${key}.enabled`)
        )
      },
      plugins: {
        installed: Object.keys(this.get('plugins.installs', {}))
      }
    };
  }

  /**
   * 快速配置向导 - 模型配置
   */
  configureModel(provider, apiKey, baseUrl = null) {
    if (!this.config) {
      this.load();
    }

    if (!this.config.models.providers[provider]) {
      this.config.models.providers[provider] = {};
    }

    if (apiKey) {
      this.config.models.providers[provider].apiKey = apiKey;
    }

    if (baseUrl) {
      this.config.models.providers[provider].baseUrl = baseUrl;
    }

    return true;
  }

  /**
   * 快速配置向导 - Gateway 配置
   */
  configureGateway(mode = 'local', authMode = 'token', port = 18789) {
    if (!this.config) {
      this.load();
    }

    this.config.gateway = {
      mode,
      auth: {
        mode: authMode
      },
      port
    };

    return true;
  }

  /**
   * 快速配置向导 - 通道配置
   */
  configureChannel(channelName, config) {
    if (!this.config) {
      this.load();
    }

    if (!this.config.channels) {
      this.config.channels = {};
    }

    this.config.channels[channelName] = {
      ...this.config.channels[channelName],
      ...config,
      enabled: true
    };

    return true;
  }

  /**
   * 重置配置到默认值
   */
  reset(section = null) {
    if (!this.config) {
      this.load();
    }

    if (section) {
      // 重置特定部分
      if (section === 'gateway') {
        this.config.gateway = {
          mode: 'local',
          auth: { mode: 'token' }
        };
      } else if (section === 'models') {
        this.config.models = {
          mode: 'merge',
          providers: {}
        };
      } else if (section === 'channels') {
        this.config.channels = {};
      }
    } else {
      // 重置全部
      this.config = {
        meta: {
          lastTouchedVersion: 'unknown',
          lastTouchedAt: new Date().toISOString()
        },
        models: {
          mode: 'merge',
          providers: {}
        },
        agents: {
          defaults: {
            model: { primary: null },
            compaction: { mode: 'safeguard' }
          }
        },
        gateway: {
          mode: 'local',
          auth: { mode: 'token' }
        }
      };
    }

    return true;
  }
}

// 如果直接运行此模块
if (require.main === module) {
  const manager = new ConfigManager();
  const args = process.argv.slice(2);
  const command = args[0] || 'summary';

  try {
    switch (command) {
      case 'load':
        console.log('配置已加载');
        break;
      case 'save':
        manager.save();
        break;
      case 'validate':
        const validation = manager.validate();
        console.log('验证结果:', validation);
        break;
      case 'summary':
        console.log('配置摘要:', manager.getSummary());
        break;
      case 'get':
        if (args[1]) {
          console.log(`${args[1]} =`, manager.get(args[1]));
        } else {
          console.log('用法：config.js get <dotPath>');
        }
        break;
      case 'set':
        if (args[1] && args[2]) {
          manager.set(args[1], args[2]);
          manager.save();
        } else {
          console.log('用法：config.js set <dotPath> <value>');
        }
        break;
      default:
        console.log('用法：config.js [load|save|validate|summary|get|set]');
    }
  } catch (error) {
    console.error('错误:', error.message);
    process.exit(1);
  }
}

module.exports = ConfigManager;
