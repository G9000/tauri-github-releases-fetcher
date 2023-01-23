export interface ReleaseType {
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
interface getGhReleasesPayload {
    repo: string;
    caching?: boolean;
    stdTTL?: number;
}
export declare function getGhReleases(payload: getGhReleasesPayload): Promise<ReleaseType>;
export {};
