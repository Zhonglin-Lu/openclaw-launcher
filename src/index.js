#!/usr/bin/env node

/**
 * OpenClaw 启动器 - 主入口
 * 一键启动、图形化配置、自动诊断、Skills 市场
 */

const { program } = require('commander');
const chalk = require('chalk');
const boxen = require('boxen');
const OpenClawDetector = require('./core/detector');
const GatewayController = require('./core/gateway');
const ConfigManager = require('./core/config');
const Diagnostician = require('./core/diagnostician');

const VERSION = '1.0.0';

// 欢迎横幅
function showBanner() {
  const banner = boxen(
    chalk.green.bold('🦞 OpenClaw 启动器 v' + VERSION) + '\n\n' +
    chalk.cyan('让 OpenClaw 更易用 - 一键启动 | 图形配置 | 自动诊断 | Skills 市场'),
    {
      padding: 1,
      borderColor: 'green',
      borderStyle: 'round'
    }
  );
  console.log(banner);
  console.log();
}

// 主菜单
async function showMainMenu() {
  console.log(chalk.bold('\n请选择操作：\n'));
  console.log('  1. 启动 OpenClaw Gateway');
  console.log('  2. 停止 OpenClaw Gateway');
  console.log('  3. 重启 OpenClaw Gateway');
  console.log('  4. 查看状态');
  console.log('  5. 环境检测');
  console.log('  6. 诊断和修复');
  console.log('  7. 配置管理');
  console.log('  8. Skills 管理');
  console.log('  0. 退出');
  console.log();
}

// 主程序
program
  .name('openclaw-launcher')
  .description('OpenClaw 启动器 - 让 OpenClaw 更易用')
  .version(VERSION);

program
  .command('start')
  .description('启动 OpenClaw Gateway')
  .option('-f, --force', '强制启动（释放端口）')
  .option('-p, --port <port>', '指定端口', '18789')
  .option('-v, --verbose', '详细输出')
  .action((options) => {
    showBanner();
    const controller = new GatewayController();
    const result = controller.start({
      port: options.port,
      force: options.force,
      verbose: options.verbose
    });
    
    if (result.success) {
      console.log(chalk.green('✅ ' + result.message));
    } else {
      console.log(chalk.red('❌ ' + result.message));
    }
  });

program
  .command('stop')
  .description('停止 OpenClaw Gateway')
  .option('-f, --force', '强制停止')
  .action((options) => {
    showBanner();
    const controller = new GatewayController();
    const result = controller.stop(options.force);
    
    if (result.success) {
      console.log(chalk.green('✅ ' + result.message));
    } else {
      console.log(chalk.red('❌ ' + result.message));
    }
  });

program
  .command('restart')
  .description('重启 OpenClaw Gateway')
  .option('-f, --force', '强制重启')
  .option('-p, --port <port>', '指定端口', '18789')
  .action((options) => {
    showBanner();
    const controller = new GatewayController();
    const result = controller.restart({
      port: options.port,
      force: options.force
    });
    
    console.log(chalk.cyan('🔄 ' + result.message));
  });

program
  .command('status')
  .description('查看 OpenClaw 状态')
  .action(() => {
    showBanner();
    const detector = new OpenClawDetector();
    const report = detector.fullDetect();
    detector.printReport(report);
  });

program
  .command('detect')
  .description('检测 OpenClaw 环境')
  .action(() => {
    showBanner();
    const detector = new OpenClawDetector();
    const report = detector.fullDetect();
    detector.printReport(report);
  });

program
  .command('diagnose')
  .description('诊断 OpenClaw 问题')
  .option('-f, --fix', '自动修复问题')
  .action((options) => {
    showBanner();
    const diagnostician = new Diagnostician();
    const report = diagnostician.fullDiagnose();
    diagnostician.printReport(report);
    
    if (options.fix) {
      diagnostician.autoFix(report);
    }
  });

program
  .command('config')
  .description('配置管理')
  .option('-g, --get <path>', '获取配置值')
  .option('-s, --set <path=value>', '设置配置值')
  .option('-v, --validate', '验证配置')
  .option('--summary', '显示配置摘要')
  .action((options) => {
    showBanner();
    const config = new ConfigManager();
    
    try {
      if (options.validate) {
        const validation = config.validate();
        console.log(chalk.bold('配置验证结果:'));
        if (validation.valid) {
          console.log(chalk.green('✅ 配置有效'));
        } else {
          console.log(chalk.red('❌ 配置无效:'));
          validation.errors.forEach(e => console.log('   - ' + e));
        }
        if (validation.warnings.length > 0) {
          console.log(chalk.yellow('⚠️  警告:'));
          validation.warnings.forEach(w => console.log('   - ' + w));
        }
      } else if (options.summary) {
        const summary = config.getSummary();
        console.log(chalk.bold('配置摘要:'));
        console.log(JSON.stringify(summary, null, 2));
      } else if (options.get) {
        const value = config.get(options.get);
        console.log(`${options.get} =`, value);
      } else if (options.set) {
        const [path, ...valueParts] = options.set.split('=');
        const value = valueParts.join('=');
        config.set(path, value);
        config.save();
        console.log(chalk.green(`✅ 已设置 ${path} = ${value}`));
      } else {
        console.log('用法：config [options]');
        console.log('  -g, --get <path>     获取配置值');
        console.log('  -s, --set <path=v>   设置配置值');
        console.log('  -v, --validate       验证配置');
        console.log('  --summary            显示配置摘要');
      }
    } catch (error) {
      console.log(chalk.red('❌ 错误：' + error.message));
    }
  });

program
  .command('skills')
  .description('Skills 管理')
  .option('-l, --list', '列出已安装的 Skills')
  .option('-i, --install <name>', '安装 Skill')
  .option('-u, --uninstall <name>', '卸载 Skill')
  .option('--search <query>', '搜索 Skills')
  .action((options) => {
    showBanner();
    
    if (options.list) {
      const detector = new OpenClawDetector();
      const skills = detector.detectSkillsStatus();
      console.log(chalk.bold(`已安装 ${skills.totalSkills} 个 Skills:\n`));
      skills.installedSkills.forEach(skill => {
        console.log(`  ${skill.name} (${skill.source})`);
      });
    } else if (options.install) {
      console.log(chalk.cyan(`正在安装 ${options.install}...`));
      const { execSync } = require('child_process');
      try {
        execSync(`clawhub install ${options.install}`, { stdio: 'inherit' });
        console.log(chalk.green('✅ 安装完成'));
      } catch (error) {
        console.log(chalk.red('❌ 安装失败'));
      }
    } else if (options.search) {
      console.log(chalk.cyan(`正在搜索 ${options.search}...`));
      const { execSync } = require('child_process');
      try {
        execSync(`clawhub search ${options.search} --limit 10`, { stdio: 'inherit' });
      } catch (error) {
        console.log(chalk.red('❌ 搜索失败'));
      }
    } else {
      console.log('用法：skills [options]');
      console.log('  -l, --list           列出已安装的 Skills');
      console.log('  -i, --install <name> 安装 Skill');
      console.log('  -u, --uninstall <name> 卸载 Skill');
      console.log('  --search <query>     搜索 Skills');
    }
  });

program
  .command('interactive')
  .description('交互模式')
  .action(async () => {
    showBanner();
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const ask = (question) => new Promise(resolve => readline.question(question, resolve));

    while (true) {
      await showMainMenu();
      const choice = await ask('请输入选项 (0-8): ');
      
      switch (choice.trim()) {
        case '1':
          const controller = new GatewayController();
          controller.start();
          break;
        case '2':
          const stopController = new GatewayController();
          stopController.stop();
          break;
        case '3':
          const restartController = new GatewayController();
          restartController.restart();
          break;
        case '4':
          const statusDetector = new OpenClawDetector();
          statusDetector.fullDetect();
          break;
        case '5':
          const detectDetector = new OpenClawDetector();
          detectDetector.fullDetect();
          break;
        case '6':
          const diag = new Diagnostician();
          const report = diag.fullDiagnose();
          diag.printReport(report);
          break;
        case '7':
          const config = new ConfigManager();
          console.log('配置摘要:', config.getSummary());
          break;
        case '8':
          const skillsDetector = new OpenClawDetector();
          const skills = skillsDetector.detectSkillsStatus();
          console.log(`已安装 ${skills.totalSkills} 个 Skills`);
          break;
        case '0':
          console.log(chalk.green('👋 再见！'));
          readline.close();
          return;
        default:
          console.log(chalk.yellow('无效选项，请重新输入'));
      }
      
      console.log();
      await ask('按回车键继续...');
    }
  });

// 默认行为：无命令时显示交互模式
if (process.argv.length <= 2) {
  showBanner();
  program.parse(['node', 'openclaw-launcher', 'interactive']);
} else {
  program.parse();
}
