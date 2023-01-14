import NodeCache from "node-cache";

const PLATFORMS: Array<[Array<string>, string]> = [
  [["linux-x86_64"], "amd64.AppImage.tar.gz"], // linux
  [["darwin-x86_64", "darwin-aarch64"], "app.tar.gz"], // apple intel & apple silicon
  [["windows-x86_64"], "x64_en-US.msi.zip"], // windows
];

interface Release {
  version: string;
  notes: string;
  pub_date: string;
  platforms: { [key: string]: { url: string; signature?: string } };
}

async function getLatestGithubRelease(repo: string): Promise<Release> {
  const githubLatestReleaseUrl = `https://api.github.com/repos/${repo}/releases/latest`;

  try {
    const response = await fetch(githubLatestReleaseUrl);
    const release = await response.json();

    const releaseResponse: Release = {
      version: release.tag_name,
      notes: release.body
        .replace(/See the assets to download this version and install./, "")
        .trim(),
      pub_date: release.published_at,
      platforms: {},
    };

    PLATFORMS.forEach(([for_platforms, extension]) => {
      const urlAssets = (release.assets || []).filter((asset: any) =>
        asset.name.endsWith(extension)
      );
      urlAssets.forEach((asset: any) => {
        for_platforms.forEach((platform) => {
          releaseResponse.platforms[platform] = {
            ...releaseResponse.platforms[platform],
            url: asset.browser_download_url,
          };
        });
      });
      const sigAssets = (release.assets || []).filter((asset: any) =>
        asset.name.endsWith(`${extension}.sig`)
      );
      sigAssets.forEach(async (asset: any) => {
        const sigFetchResponse = await fetch(asset.browser_download_url);
        const sig = await sigFetchResponse.text();
        for_platforms.forEach((platform) => {
          releaseResponse.platforms[platform] = {
            ...releaseResponse.platforms[platform],
            signature: sig,
          };
        });
      });
    });

    return releaseResponse;
  } catch (error) {
    return {} as Release;
  }
}

export function versionCompare(latestRelease: Release, currentVersion: string) {
  if (!latestRelease || !currentVersion) {
    return false;
  }

  try {
    const latestVersion = latestRelease.version;

    if (
      typeof latestRelease.version === "string" &&
      typeof currentVersion === "string"
    ) {
      const [latestMaj, latestMin, latestPatch] = latestVersion
        .replace(/^[vV]/, "")
        .split(".");
      const [curMaj, curMin, curPatch] = currentVersion
        .replace(/^[vV]/, "")
        .split(".");

      if (
        latestMaj === curMaj &&
        curMin === latestMin &&
        curPatch === latestPatch
      ) {
        return false;
      }
    } else {
      throw new Error("version is not a string");
    }
  } catch (e) {
    return false;
  }
  return true;
}

interface getGhReleasesPayload {
  repo: string;
  caching?: boolean;
  stdTTL?: number;
}

export default async function getGhReleases(
  payload: getGhReleasesPayload
): Promise<Release> {
  const { repo, caching = false, stdTTL = 300 } = payload;

  if (caching) {
    const dataCache = new NodeCache({ stdTTL: stdTTL });
    const data = dataCache.get("data");

    if (data) {
      return data as Release;
    }

    const newData = await getLatestGithubRelease(repo);
    dataCache.set("data", newData);
    return newData;
  }

  return await getLatestGithubRelease(repo);
}

module.exports = getGhReleases;
