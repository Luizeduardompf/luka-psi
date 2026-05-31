#!/usr/bin/env node
// Downloads Expo Go SDK 52 APK for Android using Node.js https (follows redirects properly)

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CACHE_DIR = path.join(process.env.HOME, '.expo', 'android-apk-cache');
const APK_PATH = path.join(CACHE_DIR, 'expo-go-sdk52.apk');

// Ensure cache dir exists
fs.mkdirSync(CACHE_DIR, { recursive: true });

function download(urlStr, destPath, redirectCount = 0) {
  return new Promise((resolve, reject) => {
    if (redirectCount > 10) {
      return reject(new Error('Too many redirects'));
    }

    const url = new URL(urlStr);
    const client = url.protocol === 'https:' ? https : http;

    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        'Accept': 'application/octet-stream, */*',
      }
    };

    client.get(options, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
        const location = res.headers.location;
        console.log(`  Redirect ${res.statusCode} → ${location.substring(0, 80)}...`);
        res.resume();
        return resolve(download(location, destPath, redirectCount + 1));
      }

      if (res.statusCode !== 200) {
        res.resume();
        return reject(new Error(`HTTP ${res.statusCode}: ${urlStr.substring(0, 80)}`));
      }

      const total = parseInt(res.headers['content-length'] || '0', 10);
      let downloaded = 0;
      let lastPrint = 0;

      const file = fs.createWriteStream(destPath);
      res.pipe(file);

      res.on('data', chunk => {
        downloaded += chunk.length;
        const pct = total ? Math.floor(downloaded / total * 100) : 0;
        if (pct - lastPrint >= 10 || downloaded === total) {
          process.stdout.write(`\r  ${pct}% (${(downloaded/1024/1024).toFixed(1)} MB)`);
          lastPrint = pct;
        }
      });

      file.on('finish', () => {
        file.close();
        process.stdout.write('\n');
        resolve(destPath);
      });

      file.on('error', reject);
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function getApkUrl() {
  // Try Expo API with SDK version 52 first
  const endpoints = [
    { hostname: 'api.expo.dev', path: '/v2/versions/latest?platform=android&sdkVersion=52' },
    { hostname: 'exp.host', path: '/--/api/v2/versions?sdkVersion=52' },
    { hostname: 'api.expo.dev', path: '/v2/versions' },
  ];

  for (const ep of endpoints) {
    const url = await new Promise((resolve) => {
      const options = {
        hostname: ep.hostname,
        path: ep.path,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'expo-cli/8.0.0'
        }
      };
      https.get(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const json = JSON.parse(data);
            // Look for SDK 52 specific URL or androidUrl
            const androidUrl = (json.sdkVersions && json.sdkVersions['52.0.0'] && json.sdkVersions['52.0.0'].androidClientUrl)
              || json.androidUrl || '';
            if (androidUrl && androidUrl.includes('.apk')) {
              console.log(`  Found URL (${ep.hostname}): ${androidUrl}`);
              resolve(androidUrl);
            } else {
              resolve(null);
            }
          } catch(e) { resolve(null); }
        });
      }).on('error', () => resolve(null));
    });
    if (url) return url;
  }
  return null;
}

async function main() {
  console.log('\n══════════════════════════════════════════');
  console.log('  Download: Expo Go SDK 52 APK');
  console.log('══════════════════════════════════════════\n');

  // Check if valid APK already exists
  if (fs.existsSync(APK_PATH)) {
    const size = fs.statSync(APK_PATH).size;
    if (size > 10_000_000) {
      console.log(`✓ APK já existe (${(size/1024/1024).toFixed(1)} MB): ${APK_PATH}`);
      return APK_PATH;
    } else {
      console.log(`⚠ APK inválido (${size} bytes) — removendo...`);
      fs.unlinkSync(APK_PATH);
    }
  }

  // Get URL
  // SDK 52 = Expo Go 2.31.x (2.32.x is SDK 53 — do NOT use API which may return wrong version)
  // Use known CDN URLs for SDK 52 directly
  const fallbacks = [
    'https://d1ahtucjixef4r.cloudfront.net/Exponent-2.31.4.apk',
    'https://d1ahtucjixef4r.cloudfront.net/Exponent-2.31.3.apk',
    'https://d1ahtucjixef4r.cloudfront.net/Exponent-2.31.2.apk',
  ];
  let apkUrl = fallbacks[0];
  console.log(`  SDK 52 — usando CDN: ${apkUrl}`);

  console.log(`\n▶ Baixando de:\n  ${apkUrl}\n`);

  try {
    await download(apkUrl, APK_PATH);
  } catch (err) {
    console.error(`✗ Download falhou: ${err.message}`);
    process.exit(1);
  }

  const size = fs.statSync(APK_PATH).size;
  if (size < 10_000_000) {
    console.error(`✗ APK muito pequeno (${size} bytes) — download inválido`);
    fs.unlinkSync(APK_PATH);
    process.exit(1);
  }

  console.log(`\n✓ APK baixado: ${(size/1024/1024).toFixed(1)} MB`);
  console.log(`  ${APK_PATH}`);
  return APK_PATH;
}

main().then(apkPath => {
  console.log('\n▶ Instalando no emulador Android...');

  const ANDROID_HOME = process.env.HOME + '/Library/Android/sdk';
  const adb = `${ANDROID_HOME}/platform-tools/adb`;

  try {
    // Get device
    const devices = execSync(`${adb} devices`).toString();
    const deviceMatch = devices.match(/emulator-\d+\s+device/);
    if (!deviceMatch) {
      console.error('✗ Nenhum emulador Android encontrado');
      process.exit(1);
    }
    const device = deviceMatch[0].split('\t')[0];
    console.log(`  Device: ${device}`);

    // Uninstall existing (ignore errors)
    try { execSync(`${adb} -s ${device} uninstall host.exp.exponent`, { stdio: 'pipe' }); } catch(e) {}

    // Install
    const result = execSync(`${adb} -s ${device} install -r ${apkPath}`, { stdio: 'pipe', timeout: 120000 }).toString();
    console.log(`✓ ${result.trim()}`);

    // Open Expo Go with Luka
    console.log('\n▶ Abrindo Luka no Expo Go...');
    try {
      execSync(`${adb} -s ${device} shell am start -a android.intent.action.VIEW -d "exp://10.0.2.2:8081" host.exp.exponent/.experience.HomeActivity`, { stdio: 'pipe' });
    } catch(e) {
      execSync(`${adb} -s ${device} shell am start -a android.intent.action.VIEW -d "exp://10.0.2.2:8081"`, { stdio: 'pipe' });
    }

    console.log('\n══════════════════════════════════════════');
    console.log('  ✓ Expo Go instalado e Luka abrindo!');
    console.log('══════════════════════════════════════════\n');

  } catch (err) {
    console.error(`✗ Erro: ${err.message}`);
    process.exit(1);
  }
}).catch(err => {
  console.error(`✗ ${err.message}`);
  process.exit(1);
});
