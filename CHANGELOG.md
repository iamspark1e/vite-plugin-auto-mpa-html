## [1.3.1](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.3.0...v1.3.1) (2024-11-27)


### Bug Fixes

* renderEngineOption should specify compile option and runtime option ([446d8d9](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/446d8d92e9347d98c162e5532532595552556e16))



# [1.3.0](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.2.0...v1.3.0) (2024-11-26)


### Features

* migrate template engine from liquidjs to handlebars ([16e511c](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/16e511c105f46ba385771c0c5c5c41e61c9d9dcc))



# [1.2.0](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.1.3...v1.2.0) (2024-08-29)


### Features

* migrate ejs to liquidjs, close [#26](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/issues/26) ([0c9e9bb](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/0c9e9bb647b39f1950da39832ba8cc7202fa7a3a))
* type `EntryPathOption` change `ejsOption` to `renderEngineOption` ([fb27ceb](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/fb27cebf92fd622c9bf0c1cc42923c734f26c8ff))



## [1.1.3](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.1.2...v1.1.3) (2024-07-12)


### Bug Fixes

* remove unreachable code ([c883648](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/c883648a0262110172849e2bd45ed9988469b63b))
* spelling correction of dev-server directory page ([2248841](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/2248841608609e38d94cebfb83fbd2d438e470a2))



## [1.1.2](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.1.1...v1.1.2) (2024-05-13)


### Bug Fixes

* Add `Content-Type` header when the development server returns HTML to avoid returning it is being treated as text ([f6ec180](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/f6ec18066c4c5f291fbbf116a7a3166d8f662bca))
* add friendly log if the `configName` file is incorrect on dev server ([dc0c004](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/dc0c0045899b7aeadfc715b093a0f81b6fb6c9f7))



## [1.1.1](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.1.0-alpha.3...v1.1.1) (2023-12-15)


### Bug Fixes

* dev server can correctly recognize url search params now ([1eaa683](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/1eaa68307dafd0961d9e548e6541c371ac04a188))



# [1.1.0](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.1.0-alpha.3...v1.1.0) (2023-12-15)


### Bug Fixes

* dev server can correctly recognize url search params now ([1eaa683](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/1eaa68307dafd0961d9e548e6541c371ac04a188))



# [1.1.0-alpha.4](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.1.0-alpha.3...v1.1.0-alpha.4) (2023-10-17)


### Bug Fixes

* add `entry.__options.templateName` judgement for adaption of `PluginOption.expereimental.customTemplateName` using `.html` ([dcd8955](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/dcd89553fe99ffc9fa6594d596edea3d9a9517e1))
* path related resources cross-platform problem ([eaea7a7](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/eaea7a70bf5ba433df4e8cc4e6843a050c1b953c))
* remove prepareTempEntries related functions ([fa01e0e](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/fa01e0e40dce484ed72cf64d53bcd16622d1d1f5))
* **test:** unit tests, unplug vite-lifecycles test due to prepareTempEntries is removed ([086bd4a](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/086bd4a39f3aeeab1d794aa294afb5fcaa7c3f90))
* virtual entries only avaliable in `build` command ([983ee71](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/983ee71e1c4a6227ed11457102078d09ec7f820a))


### Features

* trying to make entry html virtual, but vite:build-html plugin could not resolve virtual entry format, received incorrect relative path ([d827f2d](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/d827f2d644e9bb2300cd5c8fca98c827cb36e5c3))
* using virtual template instead of `writeFile` ([5509baa](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/5509baa6d55b709f9eeb31ea1270dceb4f6accc9))



# [1.1.0-alpha.3](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.1.0-alpha.2...v1.1.0-alpha.3) (2023-10-17)


### Bug Fixes

* auto generate `optimizeDeps.entries` when command is `serve`, close https://github.com/iamspark1e/vite-plugin-auto-mpa-html/issues/16 ([3a7a345](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/3a7a34505067f46dcd85e5af1439dcc0a0999ed5))



# [1.1.0-alpha.2](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.1.0-alpha.1...v1.1.0-alpha.2) (2023-10-17)


### Features

* add `pageConfigGenerator` so you can use pluginOptions even in page config ([1648493](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/16484936c5f5ebdf41fbdc68b646cec869ee77fc))



# [1.1.0-alpha.1](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.1.0-alpha.0...v1.1.0-alpha.1) (2023-10-07)



# [1.1.0-alpha.0](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.0.1...v1.1.0-alpha.0) (2023-10-07)


### Bug Fixes

* in case the build progress is failed due to other reasons, flagged HTML (generated by plugin) will be overrode ([4207b74](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/4207b743bed624d65b1602ca6d8d8df0fd34cb8b))
* merge multi-level if branch ([26041cc](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/26041cc9ee44b6b4ab5c909ce19c1eefb2441858))
* **test:** clean templates when running unit tests ([c85d113](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/c85d1135b86cf3e99046f7be6eb46ff791c6c138))


### Features

* skip write temp entries in dev mode ([ad71333](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/ad71333fe5e65cd01d38afc4333e2741c1b5fe77))
* **test:** add single test unit for experimental mode ([036bc3f](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/036bc3f2338c165b7c7de0a1eecc0c0f1651db95))
* use dev-middleware to render templates instead of writeFile ([ffc54ae](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/ffc54aef6ac2c374e5fefdcb5d6b0f966cb66d4c))



## [1.0.1](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.0.1-beta.3...v1.0.1) (2023-07-10)


### Bug Fixes

* nested folder tests are skipped, fix nested folder does not compile issue ([106e2a2](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/106e2a2d805ba4f9e5ce8b3e4831f2e621eadd2f))



## [1.0.1-beta.3](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.0.1-beta.2...v1.0.1-beta.3) (2023-06-16)


### Bug Fixes

* add new option `experimental.rootEntryDistName` to customize the "root entry" asset names & fix `experimental.customTemplateName` may case pollution outer dist folder ([93d9ef1](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/93d9ef106f3e94b005d0e63a515ce989f6fe504c))
* **test:** add fallback entry name in case entry was placed in root dir ([2d840c1](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/2d840c1449c744b08e7add886d3fc1e41ecc9a61))



## [1.0.1-beta.2](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.0.1-beta.1...v1.0.1-beta.2) (2023-05-09)


### Bug Fixes

* add ignore node_modules incase using plugin without `root` path configured ([d17b87a](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/d17b87a3d6d7b9c7c2ba3ad48a227f257d218ac4))



## [1.0.1-beta.1](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.0.1-beta.0...v1.0.1-beta.1) (2023-05-06)


### Bug Fixes

* fix different generated entry HTML script path ([94c0fd8](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/94c0fd87ac9628f0c5cfcf515bb07ab06e0759b4))



## [1.0.1-beta.0](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.0.0...v1.0.1-beta.0) (2023-05-06)


### Bug Fixes

* **coverage:** uncovered branches about `src/tyemplate.ts` ([1207a70](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/1207a709d5bdaaf3ae0caa5b2635a734e6b2d454))
* **coverage:** uncovered branches about `src/types.ts` ([03ff770](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/03ff7704e76ce454937f18582bedb810df7eebaa))
* **coverage:** uncovered branches in `src/dev-middleware.ts` ([3a7315e](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/3a7315ea03e5d46d6d52fa8fb5e60399b661db05))
* **coverage:** uncovered tests in `tests/server.test.ts` ([7954b9a](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/7954b9a25c8a4461ff9c6974098fd355cf885e10))


### Features

* add auto coverage test for main branch ([45c9b51](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/45c9b518dcf383a10f345771531d766c8f16322e))
* add experimental feature - customTemplateName ([70a1c2b](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/70a1c2bdf69ca236743c66545686c5daf5f994a0))



# [1.0.0](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.0.0-alpha.1...v1.0.0) (2023-04-25)


### Features

* **debug:** add colorized console for plugin fatals ([2241370](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/2241370035f73bf3a820820b04dc09a7cfb6a2db))
* **debug:** add colorized console for plugin messages ([a3ced67](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/a3ced67fa5bcc7154f733dad4604ab3c3262faea))



# [1.0.0-alpha.1](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v1.0.0-alpha.0...v1.0.0-alpha.1) (2023-04-24)


### Bug Fixes

* add security detection for exist HTML files ([8113dfe](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/8113dfe4ce2f86e47f5e329beb70a06c8d559c5f))



# [1.0.0-alpha.0](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v0.1.1...v1.0.0-alpha.0) (2023-04-23)



## [0.1.1](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v0.1.1-alpha.0...v0.1.1) (2023-04-17)


### Bug Fixes

* add multi version export ([2da968f](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/2da968f01ed2080be8c7f6a2bb1d35d65d2bf84f))
* change output dir to adapt `tsup` default config ([aff67c4](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/aff67c48cb656739826abec3cef7b7703902e090))
* revert version in package.json ([c06bfdf](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/c06bfdf151e2072fd07cc3a2bcb607b3ba65ebd8))
* simplify github action & fix test fixtures config ([6e55e25](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/6e55e25a81ee2e1b51c360ef89ed3e81d46e7a4b))
* using bundled plugin in tests change its path ([773d163](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/773d16362149ccffb7b81bc41aab7d43b538fefc))



## [0.1.1](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v0.1.1-alpha.0...v0.1.1) (2023-04-17)


### Bug Fixes

* add multi version export ([2da968f](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/2da968f01ed2080be8c7f6a2bb1d35d65d2bf84f))
* change output dir to adapt `tsup` default config ([aff67c4](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/aff67c48cb656739826abec3cef7b7703902e090))
* revert version in package.json ([c06bfdf](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/c06bfdf151e2072fd07cc3a2bcb607b3ba65ebd8))
* using bundled plugin in tests change its path ([773d163](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/773d16362149ccffb7b81bc41aab7d43b538fefc))



## [0.1.1](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v0.1.1-alpha.0...v0.1.1) (2023-04-17)


### Bug Fixes

* add multi version export ([2da968f](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/2da968f01ed2080be8c7f6a2bb1d35d65d2bf84f))
* change output dir to adapt `tsup` default config ([aff67c4](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/aff67c48cb656739826abec3cef7b7703902e090))



## [0.1.1-alpha.0](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v0.1.0...v0.1.1-alpha.0) (2023-04-13)


### Features

* add helper unit test, add fallback href text for no-title pages ([35064cf](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/35064cf252f3c4fadea255671bde28ae3ba53a63))



# [0.1.0](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v0.0.9...v0.1.0) (2023-04-12)


### Bug Fixes

* add `viteServer.transformIndexHtml` for devServerMiddleware, fix cannot detect preamble bug ([54b4691](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/54b4691eff66864631339cab1152b75b3cb86a9d))



## [0.0.9](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v0.0.9-alpha.0...v0.0.9) (2023-03-28)


### Bug Fixes

* remove @types/mock-fs ([3835b19](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/3835b195db8370fa8dd5b8ed345a21afcd6aaf50))
* remove unused resolve definition ([c0155f7](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/c0155f756b43b17781d78c525f1f18a3166b4064))



## [0.0.9-alpha.0](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v0.0.8...v0.0.9-alpha.0) (2023-03-23)



## [0.0.8](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v0.0.7...v0.0.8) (2023-03-22)


### Bug Fixes

* entry test drop need of `mock-fs` ([7f2bf0f](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/7f2bf0ff20e73abf7a3dd789758e41668fe8c9a2))
* remove assets/index.html, use hardcode ([e7ae589](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/e7ae5896ecfbf265de34596cb96d4d91ed402025))
* remove mock-fs usage ([516f13a](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/516f13a6ff22c73c0ad6741b5928f17da6f68dec))


### Features

* add coverage comment when publish ([5b6efa3](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/5b6efa3605a4ae0121b9bb689b30a536f813d759))
* add vite native feature tests ([a6ca0c3](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/a6ca0c3a5ee08227e15f9ce21c980d301211f9c5))



## [0.0.7](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v0.0.6...v0.0.7) (2023-03-14)



## [0.0.6](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v0.0.5...v0.0.6) (2023-03-14)


### Bug Fixes

* add entries detection in case plugin option is incorrect ([0dbded8](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/0dbded8099e6804b95a40ae8bafffc04384c17f4))
* inject rollup option now use console.error instead of directly throw error for unit tests ([f441600](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/f4416009fb6d701f7394191ecd15828809d5f773))
* npm package miss .d.ts file ([edfbc02](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/edfbc0297ef4146171911b101900ea2dce7f44a0))



## [0.0.6](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v0.0.5...v0.0.6) (2023-03-14)


### Bug Fixes

* add entries detection in case plugin option is incorrect ([0dbded8](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/0dbded8099e6804b95a40ae8bafffc04384c17f4))
* npm package miss .d.ts file ([edfbc02](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/edfbc0297ef4146171911b101900ea2dce7f44a0))



## [0.0.5](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v0.0.4...v0.0.5) (2023-03-14)


### Bug Fixes

* glob package should in deps not devDeps, update docs & ignore file ([b015a86](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/b015a86bfb802ca298596943668a7b4c7f322cc5))



## [0.0.4](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v0.0.3...v0.0.4) (2023-03-14)


### Bug Fixes

* package glob import `globSync` error ([726d67a](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/726d67a3b6814a1ded61cb7d73a719a54a938df5))



## [0.0.3](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v0.0.2...v0.0.3) (2023-03-14)


### Bug Fixes

* `buildStart` error overrided by `buildEnd` errors \n fix: add console warning if entry file is not configured properly\n feat: add directory page if `enableDirectoryPage` is set `true` ([a2ae7d4](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/a2ae7d491e64762581a7e2be7d6e6b4533083899))


### Features

* add devServer Directory page ([bfde57d](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/bfde57d479c831ec339709e350f051874b941686))
* auto generate mpa entry ([4ea1d53](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/4ea1d535495f1380238a410285c06a5bbc90413d))



## [0.0.2](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v0.0.1...v0.0.2) (2023-03-03)


### Features

* add an minimal projet for devServer tests ([5f6d2f3](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/5f6d2f3e53790a786dde7d82a8467e9a2f8884c4))
* add unit test for functions ([93c04b9](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/93c04b95ed3d0b57ee3a4c2371ceca9c360d86e5))
* add unit test powered by Vitest, configureServer hook is still under testing ([a1d0077](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/a1d007743e9a545a762da768d7b073753b51d4fb))
* add vitest test kit ([35817d4](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/35817d435d139625b4a3af5824dfcf72e27eaaa3))
* merge unit test into GitHub Action & npmignore ([6ea5366](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/6ea53664e8788a0f157349cc997c07ad4df7e218))



## [0.0.1](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/compare/v0.0.1-alpha.1...v0.0.1) (2023-03-01)


### Features

* add commitlint & changelog ([6090742](https://github.com/iamspark1e/vite-plugin-auto-mpa-html/commit/60907428568e848c8d3f7e5101855035d076072f))



