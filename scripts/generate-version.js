const fs = require('fs');
const path = require('path');

/**
 * 自动生成 latest.yml 版本更新文件
 * 从 manifest.json 读取版本信息，生成 latest.yml 文件
 */
function generateVersionFile() {
    try {
        // 读取 manifest.json
        const manifestPath = path.join(__dirname, '../src/manifest.json');
        const manifestContent = fs.readFileSync(manifestPath, 'utf8');
        
        // 使用正则表达式直接提取版本信息，避免解析包含注释的 JSON
        // 匹配 "versionName" : "1.1.7" 或 "versionName": "1.1.7"
        const versionMatch = manifestContent.match(/"versionName"\s*:\s*"([^"]+)"/);
        const version = versionMatch ? versionMatch[1] : '1.0.0';
        
        // 匹配 "versionCode" : 117 或 "versionCode": 117
        const versionCodeMatch = manifestContent.match(/"versionCode"\s*:\s*(\d+)/);
        const versionCode = versionCodeMatch ? parseInt(versionCodeMatch[1], 10) : 100;
        
        // 从环境变量获取版本描述，如果没有则使用默认值
        const versionDesc = process.env.VERSION_DESC || process.env.npm_config_version_desc || 
            `版本 ${version} 更新\n- 优化用户体验\n- 修复已知问题`;
        
        // 生成 YAML 内容
        const yamlContent = `version: '${version}'
versionCode: ${versionCode}
versionDesc: '${versionDesc.replace(/\n/g, '\\n')}'`;
        
        // 确保 scripts 目录存在
        const outputDir = path.join(__dirname, '../');
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }
        
        // 写入 latest.yml 文件
        const outputPath = path.join(outputDir, 'latest.yml');
        fs.writeFileSync(outputPath, yamlContent, 'utf8');
        
        console.log('✅ latest.yml 文件生成成功！');
        console.log(`   版本号: ${version}`);
        console.log(`   版本代码: ${versionCode}`);
        console.log(`   文件路径: ${outputPath}`);
        console.log(`   文件内容:\n${yamlContent}`);
        
        return true;
    } catch (error) {
        console.error('❌ 生成 latest.yml 文件失败:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// 执行生成
generateVersionFile();

