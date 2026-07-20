# vite-plugin-auto-mpa-html 问题清单

基于README文档与源代码分析发现的问题

## 高优先级

### 1. 类型定义与实现不一致
- **位置**: `src/types.ts:5`, `src/core.ts:39`
- **问题**: `PluginOption.entryName` 定义为可选，但 `core.ts` 直接使用未检查默认值
- **影响**: 用户不提供时glob搜索失败

### 2. 错误处理逻辑不一致
- **位置**: `src/template.ts:143-163`
- **问题**: `_console.fatal` 抛出异常后函数继续执行
- **影响**: 错误状态下可能产生未定义行为

### 3. 路径拼接逻辑问题
- **位置**: `src/template.ts:80`
- **问题**: 使用 `split('/').reverse()[0]` 处理路径，Windows兼容性差
- **影响**: 跨平台脚本路径错误

### 4. 依赖声明不完整
- **位置**: `package.json:63-65`
- **问题**: `handlebars` 未声明为peer依赖
- **影响**: 用户可能缺少核心依赖

## 中优先级

### 5. 文档与类型定义矛盾
- **位置**: `src/types.ts:41`, README.md:163
- **问题**: `template` 标记@required但类型定义为可选

### 6. 配置合并逻辑缺陷
- **位置**: `index.ts:12-15`
- **问题**: 扩展运算符未深度合并嵌套对象

### 7. ESM模块导入问题
- **位置**: `src/core.ts:2`
- **问题**: `import pkg from 'glob'` 导入CJS模块方式不当

### 8. 错误信息不准确
- **位置**: `src/template.ts:143`
- **问题**: 错误信息硬编码为 `config.json`

### 9. 目录页面链接生成问题
- **位置**: `src/dev-middleware.ts:28`
- **问题**: 未处理 `customTemplateName` 配置

### 10. 开发服务器边界条件
- **位置**: `src/dev-middleware.ts:46`
- **问题**: 根路径未检查是否存在 `index.html`

## 低优先级

### 11. Windows路径兼容性
- **位置**: `src/template.ts:181`
- **问题**: 路径拼接使用 `+` 而非 `path.join`

### 12. 测试覆盖不完整
- **位置**: `tests/server.test.ts:66-97`
- **问题**: 部分测试用例被注释

### 13. 虚拟模块路径处理
- **位置**: `index.ts:34`
- **问题**: `path.resolve` 处理虚拟模块ID可能出错

### 14. 模板路径解析问题
- **位置**: `src/template.ts:59`
- **问题**: 相对路径解析基准不明确

## 已完成的功能

### 15. 配置文件监视功能 (v1.4.0)
- **功能**: 开发模式下自动监视配置文件和模板文件变化
- **实现**: 使用 chokidar 监视文件变化，触发完全重载
- **选项**: `watchConfig` (默认: true)
- **位置**: `src/config-watcher.ts`, `index.ts`
