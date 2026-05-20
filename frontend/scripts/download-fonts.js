/**
 * Font Download Helper
 * Run: node scripts/download-fonts.js
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const FONTS_DIR = path.join(__dirname, '..', 'assets', 'fonts');

const FONTS = [
  // Inter
  { name: 'Inter-Regular.ttf', url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.ttf' },
  { name: 'Inter-Medium.ttf', url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuI6fAZ9hjQ.ttf' },
  { name: 'Inter-SemiBold.ttf', url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuGKYAZ9hjQ.ttf' },
  { name: 'Inter-Bold.ttf', url: 'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYAZ9hjQ.ttf' },
  // Space Grotesk (from Google Fonts CSS API)
  { name: 'SpaceGrotesk-Regular.ttf', url: 'https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7oUUsj.ttf' },
  { name: 'SpaceGrotesk-Medium.ttf', url: 'https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj7aUUsj.ttf' },
  { name: 'SpaceGrotesk-SemiBold.ttf', url: 'https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj42Vksj.ttf' },
  { name: 'SpaceGrotesk-Bold.ttf', url: 'https://fonts.gstatic.com/s/spacegrotesk/v22/V8mQoQDjQSkFtoMM3T6r8E7mF71Q-gOoraIAEj4PVksj.ttf' },
  // JetBrains Mono
  { name: 'JetBrainsMono-Regular.ttf', url: 'https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPQ.ttf' },
  { name: 'JetBrainsMono-Medium.ttf', url: 'https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8-qxjPQ.ttf' },
];

if (!fs.existsSync(FONTS_DIR)) {
  fs.mkdirSync(FONTS_DIR, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        file.close();
        try { fs.unlinkSync(dest); } catch {}
        return reject(new Error(`HTTP ${res.statusCode}`));
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log(`Downloading ${FONTS.length} font files...\n`);
  for (const font of FONTS) {
    const dest = path.join(FONTS_DIR, font.name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 10000) {
      console.log(`  ✓ ${font.name} (${(fs.statSync(dest).size / 1024).toFixed(0)}KB)`);
      continue;
    }
    process.stdout.write(`  ↓ ${font.name}...`);
    try {
      await download(font.url, dest);
      console.log(` done (${(fs.statSync(dest).size / 1024).toFixed(0)}KB)`);
    } catch (err) {
      console.log(` FAILED: ${err.message}`);
    }
  }
  console.log('\nDone!');
}

main();
