#!/usr/bin/env node

/**
 * OpenClaw 启动器 - 配置验证测试
 */

const ConfigValidator = require('../config-validator');

console.log('🧪 测试配置验证器...\n');

const validator = new ConfigValidator();

// 测试 1: 验证默认配置
console.log('测试 1: 默认配置模板');
const defaultConfig = validator.DEFAULT_CONFIG;
console.log('✅ 默认配置存在:', !!defaultConfig);
console.log('✅ 包含 gateway:', !!defaultConfig.gateway);
console.log('✅ 包含 models:', !!defaultConfig.models);

// 测试 2: 验证配置验证功能
console.log('\n测试 2: 配置验证功能');
const testConfig = {
  gateway: {
    mode: 'local',
    port: 18789,
    auth: {
      mode: 'token',
      token: 'test-token'
    }
  }
};
const result = validator.validate(testConfig);
console.log('✅ 验证通过:', result.valid);
console.log('✅ 错误数:', result.errors.length);
console.log('✅ 警告数:', result.warnings.length);

// 测试 3: 验证无效配置
console.log('\n测试 3: 无效配置检测');
const invalidConfig = {
  gateway: {
    port: 80  // 无效端口
  }
};
const invalidResult = validator.validate(invalidConfig);
console.log('✅ 检测出错误:', invalidResult.errors.length > 0);
console.log('错误信息:', invalidResult.errors[0]);

// 测试 4: 检查配置文件
console.log('\n测试 4: 配置文件检查');
const checkResult = validator.check();
console.log('✅ 文件存在:', checkResult.exists);
console.log('✅ 文件可读:', checkResult.readable);
console.log('✅ JSON 有效:', checkResult.valid);

console.log('\n✅ 所有测试完成！\n');
