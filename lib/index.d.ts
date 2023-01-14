interface Release {
    version: string;
    notes: string;
    pub_date: string;
    platforms: {
        [key: string]: {
            url: string;
            signature?: string;
        };
    };
}
export declare function versionCompare(latestRelease: Release, currentVersion: string): boolean;
interface getGhReleasesPayload {
    repo: string;
    caching?: boolean;
    stdTTL?: number;
}
export default function getGhReleases(payload: getGhReleasesPayload): Promise<Release>;
export {};
