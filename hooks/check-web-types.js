module.exports = () => {
  const { execSync } = require('child_process');

  console.log('\n💻 Checking web types before build... 🌐\n');
  try {
    execSync('npm run check-types:web', { stdio: 'inherit' });
    console.log('\n💻 Web type checking completed successfully! ✅\n');

    // Returning a truthy value will cause the build to be skipped
    // Returning a falsy value will cause the build to continue
    return null
  } catch (error) {
    console.error('\n💻 Web type checking failed: ❌\n', error.message);
    return { code: 1 };
  }
}