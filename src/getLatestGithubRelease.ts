import axios from "axios";
import NodeCache from "node-cache";

export interface ReleaseType {
  version: string;
  notes: string;
  pub_date: string;
  platforms: { [key: string]: { url: string; signature?: string } };
}

async function getLatestGithubRelease(repo: string): Promise<ReleaseType> {
  const githubLatestReleaseUrl = `https://api.github.com/repos/${repo}/releases/latest`;

  try {
    const { data: release } = await axios(githubLatestReleaseUrl);

    const releaseResponse: ReleaseType = {
      version: release.tag_name,
      notes: release.body
        .replace(/See the assets to download this version and install./, "")
        .trim(),
      pub_date: release.published_at,
      platforms: {},
    };

    const PLATFORMS: { [key: string]: string } = {
      "linux-x86_64": "amd64.AppImage.tar.gz",
      "darwin-x86_64": "app.tar.gz",
      "darwin-aarch64": "app.tar.gz",
      "windows-x86_64": "x64_en-US.msi.zip",
    };

    await Promise.all(
      release.assets.map(async (asset: any) =>
        Promise.all(
          Object.keys(PLATFORMS).map(async (platform) => {
            if (asset.name.endsWith(PLATFORMS[platform])) {
              releaseResponse.platforms[platform] = {
                ...releaseResponse.platforms[platform],
                url: asset.browser_download_url,
              };
            }
            if (asset.name.endsWith(`${PLATFORMS[platform]}.sig`)) {
              try {
                const { data: sig } = await axios(asset.browser_download_url);
                releaseResponse.platforms[platform] = {
                  ...releaseResponse.platforms[platform],
                  signature: sig,
                };
              } catch (error: any) {
                throw new Error(error);
              }
            }
          })
        )
      )
    );

    return releaseResponse;
  } catch (error) {
    return {} as ReleaseType;
  }
}

interface getGhReleasesPayload {
  repo: string;
  caching?: boolean;
  stdTTL?: number;
}

export async function getGhReleases(
  payload: getGhReleasesPayload
): Promise<ReleaseType> {
  const { repo, caching = false, stdTTL = 300 } = payload;

  if (caching) {
    const dataCache = new NodeCache({ stdTTL: stdTTL });
    const data = dataCache.get("data");

    if (data) {
      return data as ReleaseType;
    }

    const newData = await getLatestGithubRelease(repo);
    dataCache.set("data", newData);
    return newData;
  }

  return await getLatestGithubRelease(repo);
}
