#!/usr/bin/env node

/**
 * OpenClaw 诊断和修复模块
 * 自动检测问题并提供修复方案
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');
const GatewayController = require('./gateway');
const ConfigManager = require('./config');

class Diagnostician {
  constructor() {
    this.homeDir = os.homedir();
    this.configPath = path.join(this.homeDir, '.openclaw', 'openclaw.json');
    this.workspacePath = path.join(this.homeDir, '.openclaw', 'workspace');
    this.gateway = new GatewayController();
    this.config = new ConfigManager();
  }

  /**
   * 执行 shell 命令
   */
  exec(command, options = {}) {
    try {
      return {
        success: true,
        output: execSync(command, { encoding: 'utf-8', ...options })
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        stdout: error.stdout,
        stderr: error.stderr
      };
    }
  }

  /**
   * 执行完整诊断
   */
  fullDiagnose() {
    console.log('🔍 开始诊断 OpenClaw 环境...\n');
    
    const checks = [
      this.checkInstallation(),
      this.checkConfig(),
      this.checkWorkspace(),
      this.checkGateway(),
      this.checkNodeVersion(),
      this.checkPermissions(),
      this.checkNetwork(),
      this.checkSkills()
    ];

    const report = {
      timestamp: new Date().toISOString(),
      checks,
      summary: {
        total: checks.length,
        passed: checks.filter(c => c.status === 'pass').length,
        warnings: checks.filter(c => c.status === 'warning').length,
        errors: checks.filter(c => c.status === 'error').length
      }
    };

    return report;
  }

  /**
   * 检查安装
   */
  checkInstallation() {
    const check = {
      name: 'OpenClaw 安装',
      status: 'pass',
      message: '',
      fix: null
    };

    const result = this.exec('which openclaw');
    if (!result.success) {
      check.status = 'error';
      check.message = 'OpenClaw CLI 未安装';
      check.fix = {
        command: 'npm install -g openclaw',
        description: '使用 npm 全局安装 OpenClaw'
      };
      return check;
    }

    // 获取版本
    const versionResult = this.exec('openclaw --version');
    if (versionResult.success) {
      check.message = versionResult.output.trim().split('\n')[0];
    }

    return check;
  }

  /**
   * 检查配置文件
   */
  checkConfig() {
    const check = {
      name: '配置文件',
      status: 'pass',
      message: '',
      fix: null
    };

    if (!fs.existsSync(this.configPath)) {
      check.status = 'error';
      check.message = '配置文件不存在';
      check.fix = {
        command: 'openclaw configure',
        description: '运行配置向导创建配置文件'
      };
      return check;
    }

    try {
      this.config.load();
      const validation = this.config.validate();
      
      if (!validation.valid) {
        check.status = 'error';
        check.message = '配置验证失败：' + validation.errors.join(', ');
        check.fix = {
          command: 'openclaw configure',
          description: '重新运行配置向导'
        };
        return check;
      }

      if (validation.warnings.length > 0) {
        check.status = 'warning';
        check.message = '配置警告：' + validation.warnings.join(', ');
      } else {
        check.message = '配置正常';
      }
    } catch (error) {
      check.status = 'error';
      check.message = '配置文件损坏：' + error.message;
      check.fix = {
        command: `cp ${this.configPath}.backup ${this.configPath}`,
        description: '从备份恢复配置'
      };
    }

    return check;
  }

  /**
   * 检查 Workspace
   */
  checkWorkspace() {
    const check = {
      name: 'Workspace',
      status: 'pass',
      message: '',
      fix: null
    };

    if (!fs.existsSync(this.workspacePath)) {
      check.status = 'error';
      check.message = 'Workspace 目录不存在';
      check.fix = {
        command: `mkdir -p ${this.workspacePath}`,
        description: '创建 Workspace 目录'
      };
      return check;
    }

    // 检查关键文件
    const requiredFiles = ['AGENTS.md', 'SOUL.md', 'USER.md'];
    const missingFiles = requiredFiles.filter(f => 
      !fs.existsSync(path.join(this.workspacePath, f))
    );

    if (missingFiles.length > 0) {
      check.status = 'warning';
      check.message = `缺少文件：${missingFiles.join(', ')}`;
      check.fix = {
        command: 'openclaw gateway --dev',
        description: '使用 --dev 模式启动以创建默认文件'
      };
      return check;
    }

    check.message = 'Workspace 正常';
    return check;
  }

  /**
   * 检查 Gateway
   */
  checkGateway() {
    const check = {
      name: 'Gateway',
      status: 'pass',
      message: '',
      fix: null
    };

    const status = this.gateway.status();
    
    if (status.running) {
      check.message = `Gateway 运行中 (PID: ${status.pid})`;
      
      if (!status.healthy) {
        check.status = 'warning';
        check.message += ' - 健康检查失败';
        check.fix = {
          command: 'openclaw gateway restart',
          description: '重启 Gateway'
        };
      }
    } else {
      check.message = 'Gateway 未运行';
    }

    return check;
  }

  /**
   * 检查 Node.js 版本
   */
  checkNodeVersion() {
    const check = {
      name: 'Node.js 版本',
      status: 'pass',
      message: '',
      fix: null
    };

    const result = this.exec('node --version');
    if (!result.success) {
      check.status = 'error';
      check.message = 'Node.js 未安装';
      check.fix = {
        command: 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash',
        description: '安装 NVM 和 Node.js'
      };
      return check;
    }

    const version = result.output.trim();
    const majorVersion = parseInt(version.slice(1).split('.')[0]);
    
    check.message = version;

    if (majorVersion < 18) {
      check.status = 'warning';
      check.message += ' (建议升级到 Node.js 18+)';
      check.fix = {
        command: 'nvm install 18 && nvm use 18',
        description: '升级到 Node.js 18'
      };
    }

    return check;
  }

  /**
   * 检查权限
   */
  checkPermissions() {
    const check = {
      name: '文件权限',
      status: 'pass',
      message: '',
      fix: null
    };

    const paths = [
      this.homeDir + '/.openclaw',
      this.workspacePath,
      this.configPath
    ];

    const issues = [];
    for (const p of paths) {
      if (fs.existsSync(p)) {
        try {
          fs.accessSync(p, fs.constants.R_OK | fs.constants.W_OK);
        } catch (error) {
          issues.push(p);
        }
      }
    }

    if (issues.length > 0) {
      check.status = 'error';
      check.message = '以下路径权限不足：' + issues.join(', ');
      check.fix = {
        command: `chmod -R u+rw ${this.homeDir}/.openclaw`,
        description: '修复 OpenClaw 目录权限'
      };
      return check;
    }

    check.message = '权限正常';
    return check;
  }

  /**
   * 检查网络
   */
  checkNetwork() {
    const check = {
      name: '网络连接',
      status: 'pass',
      message: '',
      fix: null
    };

    // 检查是否能访问外网
    const result = this.exec('curl -s --connect-timeout 5 https://www.baidu.com > /dev/null && echo ok');
    if (!result.success || !result.output.includes('ok')) {
      check.status = 'warning';
      check.message = '无法访问外网 (如果使用国内模型服务可忽略)';
      return check;
    }

    // 检查是否能访问模型服务
    const modelCheck = this.exec('curl -s --connect-timeout 5 https://dashscope.aliyuncs.com > /dev/null && echo ok');
    if (!modelCheck.success || !modelCheck.output.includes('ok')) {
      check.status = 'warning';
      check.message = '无法访问阿里云模型服务';
      return check;
    }

    check.message = '网络连接正常';
    return check;
  }

  /**
   * 检查 Skills
   */
  checkSkills() {
    const check = {
      name: 'Skills',
      status: 'pass',
      message: '',
      fix: null
    };

    // 检查 clawhub
    const clawhubResult = this.exec('clawhub --version 2>&1');
    if (!clawhubResult.success) {
      check.status = 'warning';
      check.message = 'ClawHub CLI 不可用，Skills 管理功能受限';
      return check;
    }

    // 检查 skills 目录
    const systemSkillsPath = path.join(this.homeDir, '.nvm', 'versions', 'node', 'v22.22.1', 'lib', 'node_modules', 'openclaw', 'skills');
    if (!fs.existsSync(systemSkillsPath)) {
      check.status = 'warning';
      check.message = '系统 Skills 目录不存在';
      return check;
    }

    const skills = fs.readdirSync(systemSkillsPath);
    check.message = `已安装 ${skills.length} 个系统 Skills`;

    return check;
  }

  /**
   * 打印诊断报告
   */
  printReport(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 OpenClaw 诊断报告');
    console.log('='.repeat(60));
    console.log(`时间：${report.timestamp}`);
    console.log();

    report.checks.forEach((check, i) => {
      const icon = check.status === 'pass' ? '✅' : 
                   check.status === 'warning' ? '⚠️' : '❌';
      console.log(`${icon} ${check.name}`);
      console.log(`   ${check.message}`);
      
      if (check.fix) {
        console.log(`   💡 修复：${check.fix.description}`);
        console.log(`      命令：${check.fix.command}`);
      }
      console.log();
    });

    console.log('='.repeat(60));
    console.log(`总计：${report.summary.total} 项检查`);
    console.log(`✅ 通过：${report.summary.passed}`);
    console.log(`⚠️  警告：${report.summary.warnings}`);
    console.log(`❌ 错误：${report.summary.errors}`);
    console.log('='.repeat(60) + '\n');
  }

  /**
   * 自动修复问题
   */
  async autoFix(report) {
    console.log('\n🔧 开始自动修复...\n');
    
    const fixes = [];
    
    for (const check of report.checks) {
      if (check.status === 'error' && check.fix) {
        console.log(`修复：${check.name}`);
        console.log(`  ${check.fix.description}`);
        
        if (check.fix.command) {
          console.log(`  执行：${check.fix.command}`);
          const result = this.exec(check.fix.command);
          
          if (result.success) {
            console.log('  ✅ 修复成功\n');
            fixes.push({ check: check.name, success: true });
          } else {
            console.log('  ❌ 修复失败\n');
            fixes.push({ check: check.name, success: false, error: result.error });
          }
        }
      }
    }

    return fixes;
  }
}

// 如果直接运行此模块
if (require.main === module) {
  const diagnostician = new Diagnostician();
  const args = process.argv.slice(2);
  const command = args[0] || 'diagnose';

  if (command === 'diagnose') {
    const report = diagnostician.fullDiagnose();
    diagnostician.printReport(report);
  } else if (command === 'fix') {
    const report = diagnostician.fullDiagnose();
    diagnostician.printReport(report);
    diagnostician.autoFix(report);
  }
}

module.exports = Diagnostician;
