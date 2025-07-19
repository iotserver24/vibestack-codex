import type { ForgeConfig } from "@electron-forge/shared-types";
import { MakerSquirrel } from "@electron-forge/maker-squirrel";
import { MakerZIP } from "@electron-forge/maker-zip";
import { MakerDeb } from "@electron-forge/maker-deb";
import { MakerRpm } from "@electron-forge/maker-rpm";
import { MakerDMG } from "@electron-forge/maker-dmg";
import { VitePlugin } from "@electron-forge/plugin-vite";
import { FusesPlugin } from "@electron-forge/plugin-fuses";
import { FuseV1Options, FuseVersion } from "@electron/fuses";
import { AutoUnpackNativesPlugin } from "@electron-forge/plugin-auto-unpack-natives";

const ignore = (file: string) => {
  if (!file) return false;

  const pathsToIgnore = [
    "/node_modules",
    "/drizzle",
    "/scaffold",
    "/worker",
    "/node_modules/stacktrace-js",
    "/node_modules/stacktrace-js/dist",
    "/node_modules/better-sqlite3",
    "/node_modules/bindings",
    "/node_modules/file-uri-to-path",
    "/.vite",
  ];

  return !pathsToIgnore.some((path) => file.startsWith(path));
};

const isEndToEndTestBuild = process.env.E2E_TEST_BUILD === "true";

const config: ForgeConfig = {
  packagerConfig: {
    protocols: [
      {
        name: "CodeX",
        schemes: ["codex"],
      },
    ],
    icon: "./assets/icon/logo",
    // Disable code signing for unsigned builds
    osxSign: undefined,
    osxNotarize: undefined,
    asar: true,
    ignore,
    executableName: "codex",
  },
  rebuildConfig: {
    extraModules: ["better-sqlite3"],
    force: true,
  },
  makers: [
    // Windows - Universal build (x64 + arm64)
    new MakerSquirrel({
      // Disable code signing for unsigned builds
      certificateFile: undefined,
      certificatePassword: undefined,
    }),
    // Windows ZIP - Universal build (temporarily disabled due to DLL issues)
    // new MakerZIP({}, ["win32"]),
    // macOS - Universal build (x64 + arm64)
    new MakerZIP({}, ["darwin"]),
    // macOS DMG - Universal build
    new MakerDMG({
      name: "CodeX-macOS-Universal",
      icon: "./assets/icon/logo.icns",
      background: "./assets/icon/logo.png",
      contents: [
        {
          x: 130,
          y: 220,
          type: "file",
          path: "CodeX.app",
        },
        {
          x: 410,
          y: 220,
          type: "link",
          path: "/Applications",
        },
      ],
    }),
    // Linux DEB - Universal build
    new MakerDeb({
      options: {
        name: "codex",
        productName: "CodeX",
        description: "AI-Powered Code Generation & Deployment",
        mimeType: ["x-scheme-handler/codex"],
        categories: ["Development"],
        maintainer: "iotserver24@gmail.com",
        homepage: "https://codex.anishkumar.tech",
      },
    }),
    // Linux RPM - Universal build
    new MakerRpm({
      options: {
        name: "codex",
        productName: "CodeX",
        description: "AI-Powered Code Generation & Deployment",
        categories: ["Development"],
      },
    }),
    // Linux AppImage maker not available, using ZIP instead
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
    new AutoUnpackNativesPlugin({}),
    new VitePlugin({
      build: [
        {
          entry: "src/main.ts",
          config: "vite.main.config.mts",
          target: "main",
        },
        {
          entry: "src/preload.ts",
          config: "vite.preload.config.mts",
          target: "preload",
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
