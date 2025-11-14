#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '../project.config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

const rootPackagePath = path.join(__dirname, '../package.json');
const rootPackage = JSON.parse(fs.readFileSync(rootPackagePath, 'utf-8'));
rootPackage.name = config.name.monorepo;
rootPackage.version = config.version;
fs.writeFileSync(rootPackagePath, JSON.stringify(rootPackage, null, 2) + '\n');

const webPackagePath = path.join(__dirname, '../packages/web/package.json');
const webPackage = JSON.parse(fs.readFileSync(webPackagePath, 'utf-8'));
webPackage.name = `@${config.name.kebab}/web`;
webPackage.version = config.version;
fs.writeFileSync(webPackagePath, JSON.stringify(webPackage, null, 2) + '\n');

const electronPackagePath = path.join(__dirname, '../packages/electron/package.json');
const electronPackage = JSON.parse(fs.readFileSync(electronPackagePath, 'utf-8'));
electronPackage.name = `@${config.name.kebab}/electron`;
electronPackage.version = config.version;
electronPackage.description = `${config.description} (Electron)`;
electronPackage.author = config.author.name;
fs.writeFileSync(electronPackagePath, JSON.stringify(electronPackage, null, 2) + '\n');

const tauriPackagePath = path.join(__dirname, '../packages/tauri/package.json');
const tauriPackage = JSON.parse(fs.readFileSync(tauriPackagePath, 'utf-8'));
tauriPackage.name = `@${config.name.kebab}/tauri`;
tauriPackage.version = config.version;
fs.writeFileSync(tauriPackagePath, JSON.stringify(tauriPackage, null, 2) + '\n');

const electronBuilderPath = path.join(__dirname, '../packages/electron/electron-builder.json5');
let electronBuilder = fs.readFileSync(electronBuilderPath, 'utf-8');
electronBuilder = electronBuilder.replace(
  /"appId":\s*"[^"]*"/,
  `"appId": "${config.appId.electron}"`
);
electronBuilder = electronBuilder.replace(
  /"productName":\s*"[^"]*"/,
  `"productName": "${config.name.display}"`
);
electronBuilder = electronBuilder.replace(
  /"copyright":\s*"[^"]*"/,
  `"copyright": "${config.copyright}"`
);
fs.writeFileSync(electronBuilderPath, electronBuilder);

const tauriConfPath = path.join(__dirname, '../packages/tauri/tauri.conf.json');
const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf-8'));
tauriConf.productName = config.name.kebab;
tauriConf.version = config.version;
tauriConf.identifier = config.appId.tauri;
if (tauriConf.app && tauriConf.app.windows && tauriConf.app.windows.length > 0) {
  tauriConf.app.windows[0].title = config.name.display;
}
fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n');

const cargoTomlPath = path.join(__dirname, '../packages/tauri/Cargo.toml');
let cargoToml = fs.readFileSync(cargoTomlPath, 'utf-8');
cargoToml = cargoToml.replace(
  /version\s*=\s*"[^"]*"/,
  `version = "${config.version}"`
);
cargoToml = cargoToml.replace(
  /description\s*=\s*"[^"]*"/,
  `description = "${config.description}"`
);
if (config.author.name) {
  cargoToml = cargoToml.replace(
    /authors\s*=\s*\[[^\]]*\]/,
    `authors = ["${config.author.name}"]`
  );
}
fs.writeFileSync(cargoTomlPath, cargoToml);

const indexHtmlPath = path.join(__dirname, '../packages/web/index.html');
let indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8');
indexHtml = indexHtml.replace(
  /<title>[^<]*<\/title>/,
  `<title>${config.name.display}</title>`
);
fs.writeFileSync(indexHtmlPath, indexHtml);

console.log('✅ 项目配置已同步到所有文件');

