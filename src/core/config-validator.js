#!/usr/bin/env node

/**
 * OpenClaw 配置验证工具
 * 验证配置文件的完整性和有效性
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class ConfigValidator {
  constructor() {
    this.configPath = process.env.OPENCLAW_CONFIG_PATH || 
                      path.join(os.homedir(), '.openclaw', 'openclaw.json');
  }

  /**
   * 默认配置模板
   */
  get DEFAULT_CONFIG() {
    return {
      gateway: {
        mode: 'local',
        port: 18789,
        auth: {
          mode: 'token',
          token: ''
        }
      },
      models: {
        providers: {}
      },
      channels: {},
      agents: {
        defaults: {
          model: {
            primary: ''
          }
        }
      },
      plugins: {
        installs: {}
      }
    };
  }

  /**
   * 验证配置
   */
  validate(config) {
    const errors = [];
    const warnings = [];

    // 1. 验证 Gateway 配置
    if (config.gateway) {
      if (config.gateway.port && (config.gateway.port < 1024 || config.gateway.port > 65535)) {
        errors.push('Gateway 端口必须在 1024-65535 之间');
      }

      if (config.gateway.auth?.mode === 'token' && !config.gateway.auth.token) {
        warnings.push('Gateway 使用 Token 认证但未设置 token，将自动生成');
      }
    }

    // 2. 验证模型配置
    if (config.models?.providers) {
      for (const [name, provider] of Object.entries(config.models.providers)) {
        if (!provider.baseUrl) {
          warnings.push(`模型提供商 "${name}" 未配置 baseUrl`);
        }
        if (!provider.apiKey) {
          warnings.push(`模型提供商 "${name}" 未配置 apiKey`);
        }
      }
    }

    // 3. 验证通道配置
    if (config.channels) {
      for (const [channel, channelConfig] of Object.entries(config.channels)) {
        if (channelConfig.enabled) {
          if (!channelConfig.appId && !channelConfig.clientSecret) {
            warnings.push(`通道 "${channel}" 已启用但可能缺少必要配置`);
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      passed: errors.length === 0,
      errorCount: errors.length,
      warningCount: warnings.length
    };
  }

  /**
   * 检查配置文件
   */
  check() {
    const result = {
      exists: false,
      valid: false,
      readable: false,
      errors: []
    };

    // 检查文件是否存在
    if (!fs.existsSync(this.configPath)) {
      result.errors.push(`配置文件不存在：${this.configPath}`);
      return result;
    }

    result.exists = true;

    // 检查是否可读
    try {
      fs.accessSync(this.configPath, fs.constants.R_OK);
      result.readable = true;
    } catch (e) {
      result.errors.push(`配置文件不可读：${this.configPath}`);
      return result;
    }

    // 检查是否可写
    try {
      fs.accessSync(this.configPath, fs.constants.W_OK);
      result.writable = true;
    } catch (e) {
      result.errors.push(`配置文件不可写：${this.configPath}`);
    }

    // 尝试解析 JSON
    try {
      const content = fs.readFileSync(this.configPath, 'utf-8');
      const config = JSON.parse(content);
      result.valid = true;

      // 验证配置内容
      const validation = this.validate(config);
      result.validation = validation;
      result.errors.push(...validation.errors);
    } catch (e) {
      result.errors.push(`配置文件格式错误：${e.message}`);
    }

    return result;
  }

  /**
   * 创建默认配置
   */
  createDefault() {
    const configDir = path.dirname(this.configPath);
    
    // 创建目录
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    // 写入默认配置
    fs.writeFileSync(
      this.configPath,
      JSON.stringify(this.DEFAULT_CONFIG, null, 2),
      'utf-8'
    );

    return {
      success: true,
      path: this.configPath
    };
  }

  /**
   * 备份配置
   */
  backup() {
    if (!fs.existsSync(this.configPath)) {
      return {
        success: false,
        error: '配置文件不存在'
      };
    }

    const timestamp = Date.now();
    const backupPath = `${this.configPath}.backup.${timestamp}`;
    
    try {
      fs.copyFileSync(this.configPath, backupPath);
      return {
        success: true,
        path: backupPath
      };
    } catch (e) {
      return {
        success: false,
        error: e.message
      };
    }
  }

  /**
   * 打印验证报告
   */
  printReport(result) {
    const chalk = require('chalk');
    const boxen = require('boxen');

    const lines = [];
    
    lines.push(chalk.bold('📋 配置验证报告'));
    lines.push('');
    lines.push(`配置文件：${this.configPath}`);
    lines.push('');

    if (result.exists) {
      lines.push(chalk.green('✅') + ' 文件存在');
    } else {
      lines.push(chalk.red('❌') + ' 文件不存在');
    }

    if (result.readable) {
      lines.push(chalk.green('✅') + ' 文件可读');
    } else {
      lines.push(chalk.red('❌') + ' 文件不可读');
    }

    if (result.writable) {
      lines.push(chalk.green('✅') + ' 文件可写');
    } else {
      lines.push(chalk.yellow('⚠️') + ' 文件不可写');
    }

    if (result.valid) {
      lines.push(chalk.green('✅') + ' JSON 格式正确');
    } else {
      lines.push(chalk.red('❌') + ' JSON 格式错误');
    }

    if (result.validation) {
      if (result.validation.valid) {
        lines.push(chalk.green('✅') + ' 配置验证通过');
      } else {
        lines.push(chalk.red('❌') + ' 配置验证失败');
      }

      if (result.validation.errors.length > 0) {
        lines.push('');
        lines.push(chalk.bold.red('错误:'));
        result.validation.errors.forEach(err => {
          lines.push(chalk.red('  • ') + err);
        });
      }

      if (result.validation.warnings.length > 0) {
        lines.push('');
        lines.push(chalk.bold.yellow('警告:'));
        result.validation.warnings.forEach(warn => {
          lines.push(chalk.yellow('  • ') + warn);
        });
      }
    }

    if (result.errors.length > 0 && !result.valid) {
      lines.push('');
      lines.push(chalk.bold.red('详细错误:'));
      result.errors.forEach(err => {
        lines.push(chalk.red('  • ') + err);
      });
    }

    console.log(boxen(lines.join('\n'), {
      padding: 1,
      borderColor: result.valid ? 'green' : 'red',
      borderStyle: 'round'
    }));
  }
}

// CLI 命令
if (require.main === module) {
  const validator = new ConfigValidator();
  const result = validator.check();
  validator.printReport(result);
  
  process.exit(result.valid && result.validation?.valid ? 0 : 1);
}

module.exports = ConfigValidator;
