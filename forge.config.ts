import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import path from "path";

// Based on https://github.com/electron/forge/blob/6b2d547a7216c30fde1e1fddd1118eee5d872945/packages/plugin/vite/src/VitePlugin.ts#L124
// Add ignore function to prevent build issues
const ignore = (path: string) => {
  // Don't ignore the main entry point
  if (path.includes(".vite/build/main.js")) {
    return false;
  }
  // Don't ignore better-sqlite3 and its dependencies
  if (path.includes("better-sqlite3")) {
    return false;
  }
  if (path.includes("bindings")) {
    return false;
  }
  if (path.includes("file-uri-to-path")) {
    return false;
  }
  // Ignore other node_modules
  if (path.includes("node_modules")) {
    return true;
  }
  return false;
};

const isEndToEndTestBuild = process.env.E2E_TEST_BUILD === "true";
const isProductionBuild = process.env.NODE_ENV === "production";

const config: ForgeConfig = {
  packagerConfig: {
    protocols: [
      {
        name: "CodeX",
        schemes: ["codex"],
      },
    ],
    icon: "./assets/icon/logo",
    extraResource: [
      path.resolve(__dirname, "node_modules/better-sqlite3/build/Release"),
    ],

    // Code signing configuration
    osxSign: isEndToEndTestBuild
      ? undefined
      : isProductionBuild
        ? {
            identity: "CodeX macOS Code Signing", // Self-signed certificate name
            keychain: process.env.KEYCHAIN_PATH || "login",
          }
        : undefined,
    osxNotarize: isEndToEndTestBuild
      ? undefined
      : isProductionBuild &&
          process.env.APPLE_ID &&
          process.env.APPLE_PASSWORD &&
          process.env.APPLE_TEAM_ID
        ? {
            appleId: process.env.APPLE_ID,
            appleIdPassword: process.env.APPLE_PASSWORD,
            teamId: process.env.APPLE_TEAM_ID,
          }
        : undefined,
    asar: false,
    ignore,
  },
  rebuildConfig: {
    extraModules: ["better-sqlite3"],
    force: true,
  },
  makers: [
    new MakerSquirrel({
      signWithParams: isProductionBuild
        ? `/sha1 ${process.env.SM_CODE_SIGNING_CERT_SHA1_HASH} /tr http://timestamp.digicert.com /td SHA256 /fd SHA256`
        : undefined,
    }),
    new MakerZIP({}, ["darwin"]),
    new MakerRpm({}),
    new MakerDeb({
      options: {
        mimeType: ["x-scheme-handler/codex"],
      },
    }),
  ],
  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "iotserver24",
          name: "codex",
        },
        draft: true,
        force: true,
      },
    },
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: "src/main.ts",
          config: "vite.main.config.mts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.mts",
          target: "preload",
        },
        {
          entry: "workers/tsc/tsc_worker.ts",
          config: "vite.worker.config.mts",
          target: "main",
        },
      ],
      renderer: [
        {
          name: "main_window",
          config: "vite.renderer.config.mts",
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: isEndToEndTestBuild,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};

export default config;
