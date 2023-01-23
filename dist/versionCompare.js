"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.versionCompare = void 0;
const semver_1 = __importDefault(require("semver"));
function versionCompare(latestRelease, currentVersion) {
    if (!latestRelease || !currentVersion) {
        return false;
    }
    try {
        const latestVersion = latestRelease.version;
        if (semver_1.default.valid(latestVersion) && semver_1.default.valid(currentVersion)) {
            return semver_1.default.gt(latestVersion, currentVersion);
        }
        else {
            throw new Error("version is not a valid semver version string");
        }
    }
    catch (e) {
        return false;
    }
}
exports.versionCompare = versionCompare;
