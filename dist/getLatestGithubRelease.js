"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGhReleases = void 0;
const axios_1 = __importDefault(require("axios"));
const node_cache_1 = __importDefault(require("node-cache"));
function getLatestGithubRelease(repo) {
    return __awaiter(this, void 0, void 0, function* () {
        const githubLatestReleaseUrl = `https://api.github.com/repos/${repo}/releases/latest`;
        try {
            const { data: release } = yield (0, axios_1.default)(githubLatestReleaseUrl);
            const releaseResponse = {
                version: release.tag_name,
                notes: release.body
                    .replace(/See the assets to download this version and install./, "")
                    .trim(),
                pub_date: release.published_at,
                platforms: {},
            };
            const PLATFORMS = {
                "linux-x86_64": "amd64.AppImage.tar.gz",
                "darwin-x86_64": "app.tar.gz",
                "darwin-aarch64": "app.tar.gz",
                "windows-x86_64": "x64_en-US.msi.zip",
            };
            yield Promise.all(release.assets.map((asset) => __awaiter(this, void 0, void 0, function* () {
                return Promise.all(Object.keys(PLATFORMS).map((platform) => __awaiter(this, void 0, void 0, function* () {
                    if (asset.name.endsWith(PLATFORMS[platform])) {
                        releaseResponse.platforms[platform] = Object.assign(Object.assign({}, releaseResponse.platforms[platform]), { url: asset.browser_download_url });
                    }
                    if (asset.name.endsWith(`${PLATFORMS[platform]}.sig`)) {
                        try {
                            const { data: sig } = yield (0, axios_1.default)(asset.browser_download_url);
                            releaseResponse.platforms[platform] = Object.assign(Object.assign({}, releaseResponse.platforms[platform]), { signature: sig });
                        }
                        catch (error) {
                            throw new Error(error);
                        }
                    }
                })));
            })));
            return releaseResponse;
        }
        catch (error) {
            return {};
        }
    });
}
function getGhReleases(payload) {
    return __awaiter(this, void 0, void 0, function* () {
        const { repo, caching = false, stdTTL = 300 } = payload;
        if (caching) {
            const dataCache = new node_cache_1.default({ stdTTL: stdTTL });
            const data = dataCache.get("data");
            if (data) {
                return data;
            }
            const newData = yield getLatestGithubRelease(repo);
            dataCache.set("data", newData);
            return newData;
        }
        return yield getLatestGithubRelease(repo);
    });
}
exports.getGhReleases = getGhReleases;
