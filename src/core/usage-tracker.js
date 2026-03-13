#!/usr/bin/env node

/**
 * 用量统计和报告模块
 * 提供实时 Token 用量、成本分析、用量报告
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

class UsageTracker {
  constructor() {
    this.dataDir = path.join(os.homedir(), '.openclaw', 'usage');
    this.dataFile = path.join(this.dataDir, 'usage-log.json');
    this.ensureDataDir();
  }

  /**
   * 确保数据目录存在
   */
  ensureDataDir() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }
  }

  /**
   * 记录用量
   */
  logUsage(modelId, provider, tokens, cost = 0) {
    const record = {
      timestamp: new Date().toISOString(),
      modelId,
      provider,
      tokens: {
        input: tokens.input || 0,
        output: tokens.output || 0,
        total: (tokens.input || 0) + (tokens.output || 0)
      },
      cost,
      date: new Date().toISOString().split('T')[0]
    };

    // 读取现有数据
    let data = this.loadData();
    data.records.push(record);
    
    // 限制记录数量（保留最近 10000 条）
    if (data.records.length > 10000) {
      data.records = data.records.slice(-10000);
    }
    
    this.saveData(data);
    return record;
  }

  /**
   * 加载数据
   */
  loadData() {
    if (fs.existsSync(this.dataFile)) {
      try {
        return JSON.parse(fs.readFileSync(this.dataFile, 'utf-8'));
      } catch (e) {
        return { records: [], totals: {} };
      }
    }
    return { records: [], totals: {} };
  }

  /**
   * 保存数据
   */
  saveData(data) {
    fs.writeFileSync(this.dataFile, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * 获取实时用量统计
   */
  getRealTimeUsage() {
    const data = this.loadData();
    const today = new Date().toISOString().split('T')[0];
    
    // 今日统计
    const todayRecords = data.records.filter(r => r.date === today);
    const todayTokens = todayRecords.reduce((sum, r) => ({
      input: sum.input + r.tokens.input,
      output: sum.output + r.tokens.output,
      total: sum.total + r.tokens.total
    }), { input: 0, output: 0, total: 0 });
    
    const todayCost = todayRecords.reduce((sum, r) => sum + r.cost, 0);

    // 本月统计
    const currentMonth = today.slice(0, 7);
    const monthRecords = data.records.filter(r => r.date.startsWith(currentMonth));
    const monthTokens = monthRecords.reduce((sum, r) => ({
      input: sum.input + r.tokens.input,
      output: sum.output + r.tokens.output,
      total: sum.total + r.tokens.total
    }), { input: 0, output: 0, total: 0 });
    
    const monthCost = monthRecords.reduce((sum, r) => sum + r.cost, 0);

    return {
      today: {
        tokens: todayTokens,
        cost: todayCost,
        requests: todayRecords.length
      },
      month: {
        tokens: monthTokens,
        cost: monthCost,
        requests: monthRecords.length
      },
      totalRecords: data.records.length
    };
  }

  /**
   * 获取用量报告
   */
  getReport(period = 'daily', days = 7) {
    const data = this.loadData();
    const today = new Date();
    const reports = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayRecords = data.records.filter(r => r.date === dateStr);
      const tokens = dayRecords.reduce((sum, r) => ({
        input: sum.input + r.tokens.input,
        output: sum.output + r.tokens.output,
        total: sum.total + r.tokens.total
      }), { input: 0, output: 0, total: 0 });
      
      const cost = dayRecords.reduce((sum, r) => sum + r.cost, 0);

      reports.push({
        date: dateStr,
        tokens,
        cost,
        requests: dayRecords.length
      });
    }

    return {
      period,
      days,
      reports,
      summary: {
        totalTokens: reports.reduce((sum, r) => ({
          input: sum.input + r.tokens.input,
          output: sum.output + r.tokens.output,
          total: sum.total + r.tokens.total
        }), { input: 0, output: 0, total: 0 }),
        totalCost: reports.reduce((sum, r) => sum + r.cost, 0),
        totalRequests: reports.reduce((sum, r) => sum + r.requests, 0)
      }
    };
  }

  /**
   * 获取模型用量排行
   */
  getModelUsage(days = 7) {
    const data = this.loadData();
    const today = new Date();
    const cutoffDate = new Date(today);
    cutoffDate.setDate(cutoffDate.getDate() - days);
    const cutoffStr = cutoffDate.toISOString().split('T')[0];

    const recentRecords = data.records.filter(r => r.date >= cutoffStr);
    
    // 按模型分组
    const modelStats = {};
    for (const record of recentRecords) {
      const key = `${record.provider}/${record.modelId}`;
      if (!modelStats[key]) {
        modelStats[key] = {
          modelId: record.modelId,
          provider: record.provider,
          tokens: { input: 0, output: 0, total: 0 },
          cost: 0,
          requests: 0
        };
      }
      modelStats[key].tokens.input += record.tokens.input;
      modelStats[key].tokens.output += record.tokens.output;
      modelStats[key].tokens.total += record.tokens.total;
      modelStats[key].cost += record.cost;
      modelStats[key].requests += 1;
    }

    // 转换为数组并排序
    return Object.values(modelStats)
      .sort((a, b) => b.cost - a.cost);
  }

  /**
   * 设置用量警告
   */
  setAlert(thresholds) {
    const config = {
      dailyCost: thresholds.dailyCost || 100,
      monthlyCost: thresholds.monthlyCost || 1000,
      dailyTokens: thresholds.dailyTokens || 1000000,
      monthlyTokens: thresholds.monthlyTokens || 10000000
    };

    const configFile = path.join(this.dataDir, 'alerts.json');
    fs.writeFileSync(configFile, JSON.stringify(config, null, 2), 'utf-8');
    return config;
  }

  /**
   * 检查警告
   */
  checkAlerts() {
    const configFile = path.join(this.dataDir, 'alerts.json');
    if (!fs.existsSync(configFile)) {
      return { triggered: false, alerts: [] };
    }

    const thresholds = JSON.parse(fs.readFileSync(configFile, 'utf-8'));
    const usage = this.getRealTimeUsage();
    const alerts = [];

    if (usage.today.cost >= thresholds.dailyCost) {
      alerts.push({
        type: 'daily_cost',
        message: `今日花费 ¥${usage.today.cost.toFixed(2)} 已超过阈值 ¥${thresholds.dailyCost}`,
        level: 'warning'
      });
    }

    if (usage.month.cost >= thresholds.monthlyCost) {
      alerts.push({
        type: 'monthly_cost',
        message: `本月花费 ¥${usage.month.cost.toFixed(2)} 已超过阈值 ¥${thresholds.monthlyCost}`,
        level: 'critical'
      });
    }

    if (usage.today.tokens.total >= thresholds.dailyTokens) {
      alerts.push({
        type: 'daily_tokens',
        message: `今日 Token 用量 ${usage.today.tokens.total.toLocaleString()} 已超过阈值 ${thresholds.dailyTokens.toLocaleString()}`,
        level: 'warning'
      });
    }

    return {
      triggered: alerts.length > 0,
      alerts
    };
  }

  /**
   * 获取成本优化建议
   */
  getOptimizationSuggestions() {
    const modelRanking = this.getModelUsage(30);
    const suggestions = [];

    // 分析高频使用的模型
    const topModels = modelRanking.slice(0, 5);
    for (const model of topModels) {
      if (model.cost > 50) {
        suggestions.push({
          type: 'high_cost_model',
          model: `${model.provider}/${model.modelId}`,
          cost: model.cost,
          suggestion: `该模型 30 天花费 ¥${model.cost.toFixed(2)}，考虑使用更经济的替代模型或优化 prompt 长度`
        });
      }
    }

    // 检查是否有大量输出 token
    const totalOutput = modelRanking.reduce((sum, m) => sum + m.tokens.output, 0);
    const totalInput = modelRanking.reduce((sum, m) => sum + m.tokens.input, 0);
    const outputRatio = totalOutput / (totalInput || 1);

    if (outputRatio > 2) {
      suggestions.push({
        type: 'high_output_ratio',
        ratio: outputRatio.toFixed(2),
        suggestion: `输出/输入 Token 比例为 ${outputRatio.toFixed(2)}，考虑优化回复长度或使用更小的 max_tokens 设置`
      });
    }

    return suggestions;
  }
}

// 如果直接运行
if (require.main === module) {
  const tracker = new UsageTracker();
  
  console.log('📊 实时用量统计:');
  const usage = tracker.getRealTimeUsage();
  console.log('今日:', usage.today);
  console.log('本月:', usage.month);
  
  console.log('\n📈 用量报告 (最近 7 天):');
  const report = tracker.getReport('daily', 7);
  console.log('总 Token:', report.summary.totalTokens);
  console.log('总花费: ¥' + report.summary.totalCost.toFixed(2));
  
  console.log('\n🔔 警告检查:');
  const alerts = tracker.checkAlerts();
  console.log(alerts.triggered ? '⚠️ 触发警告' : '✅ 无警告');
  alerts.alerts.forEach(a => console.log('  -', a.message));
  
  console.log('\n💡 优化建议:');
  const suggestions = tracker.getOptimizationSuggestions();
  if (suggestions.length === 0) {
    console.log('  暂无建议');
  } else {
    suggestions.forEach(s => console.log('  -', s.suggestion));
  }
}

module.exports = UsageTracker;
