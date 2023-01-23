# tauri-gh-releases-generator

A small package to fetch github publish.


## Installation

`npm i tauri-github-releases-fetcher`


## Usage


```
import { getGhReleases } from "tauri-github-releases-fetcher"

const latestRelease = await getGhReleases({ repo: App_Repo, caching: true })
```
