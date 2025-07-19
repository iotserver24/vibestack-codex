#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

/**
 * Clean build artifacts that might cause conflicts
 */
function cleanBuildArtifacts() {
  const directoriesToClean = [
    ".vite",
    "vibestacks-coder/.vite",
    "vibestacks-coder/node_modules",
    "out",
    "dist",
  ];

  console.log("🧹 Cleaning build artifacts...");

  directoriesToClean.forEach((dir) => {
    const fullPath = path.resolve(dir);
    if (fs.existsSync(fullPath)) {
      try {
        fs.rmSync(fullPath, { recursive: true, force: true });
        console.log(`✅ Cleaned: ${dir}`);
      } catch (error) {
        console.warn(`⚠️  Could not clean ${dir}:`, error.message);
      }
    } else {
      console.log(`ℹ️  Skipped (not found): ${dir}`);
    }
  });

  console.log("✨ Build artifacts cleaned successfully!");
}

// Run if called directly
if (require.main === module) {
  cleanBuildArtifacts();
}

module.exports = { cleanBuildArtifacts };
