#!/usr/bin/env node

/**
 * OpenClaw 检测模块
 * 检测 OpenClaw 安装状态、Gateway 运行状态、配置完整性
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class OpenClawDetector {
  constructor() {
    this.homeDir = os.homedir();
    this.defaultInstallPath = path.join(this.homeDir, '.nvm', 'versions', 'node');
    this.defaultConfigPath = path.join(this.homeDir, '.openclaw', 'openclaw.json');
    this.defaultWorkspacePath = path.join(this.homeDir, '.openclaw', 'workspace');
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
   * 检测 OpenClaw 是否已安装
   */
  detectInstallation() {
    const result = {
      installed: false,
      version: null,
      installPath: null,
      configPath: null,
      workspacePath: null,
      issues: []
    };

    // 1. 检查 openclaw 命令是否可用
    const whichResult = this.exec('which openclaw');
    if (!whichResult.success) {
      result.issues.push('OpenClaw CLI 未安装或未添加到 PATH');
      return result;
    }

    result.installed = true;
    result.installPath = whichResult.output.trim();

    // 2. 获取版本号
    const versionResult = this.exec('openclaw --version');
    if (versionResult.success) {
      result.version = versionResult.output.trim().split('\n')[0];
    }

    // 3. 检查配置文件
    if (fs.existsSync(this.defaultConfigPath)) {
      result.configPath = this.defaultConfigPath;
    } else {
      result.issues.push('配置文件不存在：' + this.defaultConfigPath);
    }

    // 4. 检查 workspace
    if (fs.existsSync(this.defaultWorkspacePath)) {
      result.workspacePath = this.defaultWorkspacePath;
      // 检查关键文件
      const keyFiles = ['AGENTS.md', 'SOUL.md', 'USER.md'];
      const missingFiles = keyFiles.filter(f => 
        !fs.existsSync(path.join(this.defaultWorkspacePath, f))
      );
      if (missingFiles.length > 0) {
        result.issues.push(`Workspace 缺少关键文件：${missingFiles.join(', ')}`);
      }
    } else {
      result.issues.push('Workspace 目录不存在：' + this.defaultWorkspacePath);
    }

    return result;
  }

  /**
   * 检测 Gateway 运行状态
   */
  detectGatewayStatus() {
    const result = {
      running: false,
      pid: null,
      port: null,
      health: null,
      issues: []
    };

    // 1. 检查是否有 Gateway 进程
    const psResult = this.exec('pgrep -f "openclaw.*gateway"');
    if (psResult.success && psResult.output.trim()) {
      result.running = true;
      result.pid = psResult.output.trim().split('\n')[0];
    }

    // 2. 检查端口占用 (默认端口 18789)
    const portCheck = this.exec('lsof -i :18789 2>/dev/null || netstat -tlnp 2>/dev/null | grep 18789');
    if (portCheck.success && portCheck.output.trim()) {
      result.port = 18789;
    }

    // 3. 健康检查
    if (result.running) {
      const healthResult = this.exec('openclaw gateway health 2>&1');
      if (healthResult.success) {
        result.health = healthResult.output;
      } else {
        result.issues.push('Gateway 健康检查失败');
      }
    }

    return result;
  }

  /**
   * 检测 Skills 状态
   */
  detectSkillsStatus() {
    const result = {
      totalSkills: 0,
      installedSkills: [],
      skillsMarketReady: false,
      issues: []
    };

    // 1. 检查系统 skills 目录
    const systemSkillsPath = path.join(this.defaultInstallPath, '..', 'openclaw', 'skills');
    if (fs.existsSync(systemSkillsPath)) {
      try {
        const skills = fs.readdirSync(systemSkillsPath);
        result.installedSkills.push(...skills.map(name => ({
          name,
          source: 'system',
          path: path.join(systemSkillsPath, name)
        })));
      } catch (e) {
        result.issues.push('无法读取系统 Skills 目录');
      }
    }

    // 2. 检查 workspace skills 目录
    const workspaceSkillsPath = path.join(this.defaultWorkspacePath, 'skills');
    if (fs.existsSync(workspaceSkillsPath)) {
      try {
        const skills = fs.readdirSync(workspaceSkillsPath);
        result.installedSkills.push(...skills.map(name => ({
          name,
          source: 'workspace',
          path: path.join(workspaceSkillsPath, name)
        })));
      } catch (e) {
        result.issues.push('无法读取 Workspace Skills 目录');
      }
    }

    result.totalSkills = result.installedSkills.length;

    // 3. 检查 clawhub 是否可用
    const clawhubResult = this.exec('clawhub --version 2>&1');
    if (clawhubResult.success) {
      result.skillsMarketReady = true;
    } else {
      result.issues.push('ClawHub CLI 不可用，Skills 市场功能受限');
    }

    return result;
  }

  /**
   * 执行完整检测
   */
  fullDetect() {
    console.log('🔍 开始检测 OpenClaw 环境...\n');
    
    const installation = this.detectInstallation();
    const gateway = this.detectGatewayStatus();
    const skills = this.detectSkillsStatus();

    const report = {
      timestamp: new Date().toISOString(),
      installation,
      gateway,
      skills,
      summary: {
        ready: installation.installed && !installation.issues.length,
        issuesCount: installation.issues.length + gateway.issues.length + skills.issues.length,
        canStart: installation.installed && !gateway.running
      }
    };

    return report;
  }

  /**
   * 打印检测报告
   */
  printReport(report) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 OpenClaw 环境检测报告');
    console.log('='.repeat(60));

    // 安装状态
    console.log('\n📦 安装状态:');
    if (report.installation.installed) {
      console.log(`   ✅ 已安装：${report.installation.version}`);
      console.log(`   📍 路径：${report.installation.installPath}`);
    } else {
      console.log('   ❌ 未安装');
    }

    // 配置状态
    console.log('\n⚙️  配置状态:');
    if (report.installation.configPath) {
      console.log(`   ✅ 配置文件：${report.installation.configPath}`);
    } else {
      console.log('   ❌ 配置文件缺失');
    }

    if (report.installation.workspacePath) {
      console.log(`   ✅ Workspace: ${report.installation.workspacePath}`);
    } else {
      console.log('   ❌ Workspace 缺失');
    }

    // Gateway 状态
    console.log('\n🚀 Gateway 状态:');
    if (report.gateway.running) {
      console.log(`   ✅ 运行中 (PID: ${report.gateway.pid})`);
    } else {
      console.log('   ⏸️  未运行');
    }

    // Skills 状态
    console.log('\n🧩 Skills 状态:');
    console.log(`   📚 已安装：${report.skills.totalSkills} 个`);
    if (report.skills.skillsMarketReady) {
      console.log('   ✅ Skills 市场可用');
    } else {
      console.log('   ⚠️  Skills 市场不可用');
    }

    // 问题汇总
    const allIssues = [
      ...report.installation.issues,
      ...report.gateway.issues,
      ...report.skills.issues
    ];

    if (allIssues.length > 0) {
      console.log('\n⚠️  发现的问题:');
      allIssues.forEach((issue, i) => {
        console.log(`   ${i + 1}. ${issue}`);
      });
    } else {
      console.log('\n✅ 未发现问题');
    }

    console.log('\n' + '='.repeat(60) + '\n');
  }
}

// 如果直接运行此模块
if (require.main === module) {
  const detector = new OpenClawDetector();
  const report = detector.fullDetect();
  detector.printReport(report);
}

module.exports = OpenClawDetector;
