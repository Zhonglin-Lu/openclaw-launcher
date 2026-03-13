#!/usr/bin/env node

/**
 * OpenClaw Gateway 控制模块
 * 启动、停止、重启 Gateway，管理 Gateway 进程
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class GatewayController {
  constructor() {
    this.defaultPort = 18789;
    this.pidFile = path.join(os.tmpdir(), 'openclaw-gateway.pid');
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
   * 检查 Gateway 是否正在运行
   */
  isRunning() {
    const result = this.exec('pgrep -f "openclaw.*gateway"');
    return result.success && result.output.trim().length > 0;
  }

  /**
   * 获取 Gateway PID
   */
  getPid() {
    const result = this.exec('pgrep -f "openclaw.*gateway"');
    if (result.success && result.output.trim()) {
      return result.output.trim().split('\n')[0];
    }
    return null;
  }

  /**
   * 检查端口是否被占用
   */
  isPortInUse(port = this.defaultPort) {
    const result = this.exec(`lsof -i :${port} 2>/dev/null || netstat -tlnp 2>/dev/null | grep :${port}`);
    return result.success && result.output.trim().length > 0;
  }

  /**
   * 启动 Gateway
   */
  start(options = {}) {
    const {
      port = this.defaultPort,
      force = false,
      verbose = false,
      background = true
    } = options;

    console.log(`🚀 正在启动 OpenClaw Gateway...`);

    // 1. 检查是否已经在运行
    if (this.isRunning()) {
      const pid = this.getPid();
      console.log(`⚠️  Gateway 已经在运行 (PID: ${pid})`);
      return {
        success: false,
        message: 'Gateway 已经在运行',
        pid
      };
    }

    // 2. 检查端口
    if (this.isPortInUse(port)) {
      if (force) {
        console.log(`⚠️  端口 ${port} 被占用，尝试释放...`);
        this.killByPort(port);
      } else {
        console.log(`❌ 端口 ${port} 被占用，请使用 --force 强制释放或使用 --port 指定其他端口`);
        return {
          success: false,
          message: `端口 ${port} 被占用`
        };
      }
    }

    // 3. 构建启动命令
    let cmd = `openclaw gateway --port ${port}`;
    if (verbose) {
      cmd += ' --verbose';
    }

    // 4. 启动进程
    try {
      if (background) {
        // 后台运行
        const child = spawn(cmd, {
          shell: true,
          detached: true,
          stdio: 'ignore'
        });
        
        child.unref();
        
        // 等待片刻检查是否启动成功
        setTimeout(() => {
          if (this.isRunning()) {
            const pid = this.getPid();
            fs.writeFileSync(this.pidFile, pid);
            console.log(`✅ Gateway 启动成功 (PID: ${pid}, 端口：${port})`);
          }
        }, 2000);

        return {
          success: true,
          message: 'Gateway 启动中...',
          background: true
        };
      } else {
        // 前台运行
        console.log(`📍 启动命令：${cmd}`);
        const result = this.exec(cmd);
        if (result.success) {
          console.log('✅ Gateway 启动成功');
          return {
            success: true,
            message: 'Gateway 启动成功'
          };
        } else {
          console.log('❌ Gateway 启动失败');
          console.log(result.stderr);
          return {
            success: false,
            message: 'Gateway 启动失败',
            error: result.stderr
          };
        }
      }
    } catch (error) {
      console.log(`❌ 启动失败：${error.message}`);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 停止 Gateway
   */
  stop(force = false) {
    console.log('🛑 正在停止 OpenClaw Gateway...');

    const pid = this.getPid();
    if (!pid) {
      console.log('⚠️  Gateway 未运行');
      return {
        success: true,
        message: 'Gateway 未运行'
      };
    }

    try {
      const signal = force ? '-9' : '-15';
      this.exec(`kill ${signal} ${pid}`);
      
      // 等待进程结束
      setTimeout(() => {
        if (!this.isRunning()) {
          if (fs.existsSync(this.pidFile)) {
            fs.unlinkSync(this.pidFile);
          }
          console.log('✅ Gateway 已停止');
        }
      }, 1000);

      return {
        success: true,
        message: 'Gateway 停止中...',
        pid
      };
    } catch (error) {
      console.log(`❌ 停止失败：${error.message}`);
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 重启 Gateway
   */
  restart(options = {}) {
    console.log('🔄 正在重启 OpenClaw Gateway...');
    this.stop(options.force);
    
    // 等待片刻确保进程完全停止
    setTimeout(() => {
      this.start(options);
    }, 2000);

    return {
      success: true,
      message: 'Gateway 重启中...'
    };
  }

  /**
   * 根据端口号杀死进程
   */
  killByPort(port = this.defaultPort) {
    try {
      // 尝试使用 lsof 找到进程
      const lsofResult = this.exec(`lsof -ti :${port}`);
      if (lsofResult.success && lsofResult.output.trim()) {
        const pid = lsofResult.output.trim();
        this.exec(`kill -9 ${pid}`);
        console.log(`✅ 已释放端口 ${port} (PID: ${pid})`);
        return true;
      }
    } catch (error) {
      console.log(`⚠️  无法释放端口 ${port}: ${error.message}`);
    }
    return false;
  }

  /**
   * 获取 Gateway 健康状态
   */
  health() {
    const result = this.exec('openclaw gateway health 2>&1');
    if (result.success) {
      return {
        healthy: true,
        details: result.output
      };
    } else {
      return {
        healthy: false,
        error: result.stderr || result.output
      };
    }
  }

  /**
   * 获取 Gateway 状态摘要
   */
  status() {
    const running = this.isRunning();
    const pid = running ? this.getPid() : null;
    const health = running ? this.health() : null;

    return {
      running,
      pid,
      port: running ? this.defaultPort : null,
      healthy: health?.healthy || false,
      healthDetails: health?.details || null
    };
  }
}

// 如果直接运行此模块
if (require.main === module) {
  const controller = new GatewayController();
  const args = process.argv.slice(2);
  const command = args[0] || 'status';

  switch (command) {
    case 'start':
      controller.start({ force: args.includes('--force') });
      break;
    case 'stop':
      controller.stop(args.includes('--force'));
      break;
    case 'restart':
      controller.restart({ force: args.includes('--force') });
      break;
    case 'health':
      console.log(controller.health());
      break;
    case 'status':
    default:
      console.log('Gateway 状态:', controller.status());
  }
}

module.exports = GatewayController;
