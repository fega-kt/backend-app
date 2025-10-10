import { execSync } from 'child_process';

try {
  // Kiểm tra nếu có package.json hoặc yarn.lock thay đổi
  const diff = execSync('git diff --name-only HEAD@{1} HEAD', {
    encoding: 'utf-8',
  });

  if (diff.includes('package.json') || diff.includes('yarn.lock')) {
    console.log('📦 Detected dependency changes — running yarn install...');
    execSync('yarn install --check-files', { stdio: 'inherit' });
  } else {
    console.log('✅ No dependency changes detected.');
  }
} catch (err) {
  console.error('⚠️ Error checking dependency changes:', err.message);
}
