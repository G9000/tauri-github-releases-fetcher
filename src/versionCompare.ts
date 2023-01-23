import semver from "semver";
import type { ReleaseType } from "./getLatestGithubRelease";

export function versionCompare(
  latestRelease: ReleaseType,
  currentVersion: string
) {
  if (!latestRelease || !currentVersion) {
    return false;
  }

  try {
    const latestVersion = latestRelease.version;
    if (semver.valid(latestVersion) && semver.valid(currentVersion)) {
      return semver.gt(latestVersion, currentVersion);
    } else {
      throw new Error("version is not a valid semver version string");
    }
  } catch (e) {
    return false;
  }
}
