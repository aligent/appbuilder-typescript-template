module.exports = () => {
  const { execSync } = require('child_process');

  console.log('\n⏩ Checking action types before build... 🔍\n');
  try {
    execSync('npm run check-types:actions', { stdio: 'inherit' });
    console.log('\n⏩ Action type checking completed successfully! ✅\n');

    // Returning a truthy value will cause the build to be skipped
    // Returning a falsy value will cause the build to continue
    return null
  } catch (error) {
    console.error('\n⏩ Action type checking failed: ❌\n', error.message);
    return { code: 1 };
  }
}