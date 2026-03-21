## [1.15.0](https://github.com/BogdanRaicevic/ied-projects/compare/v1.14.0...v1.15.0) (2026-03-21)

### Features

* include sentry in the start and dev script ([bba7bd9](https://github.com/BogdanRaicevic/ied-projects/commit/bba7bd9e423ac97a57d6a5f8943247dd7d96f2f8))
* integrate Sentry for error monitoring and performance tracing with environment-based configuration. ([7a8dfa0](https://github.com/BogdanRaicevic/ied-projects/commit/7a8dfa0a9493a636cc47611fd6ac421280c4c463))

## [1.14.0](https://github.com/BogdanRaicevic/ied-projects/compare/v1.13.3...v1.14.0) (2026-03-20)

### Features

* show badly formatted emails in the firma table ([bd0595e](https://github.com/BogdanRaicevic/ied-projects/commit/bd0595eba148eb91714a11248b4ec5d083c36166))
* show errors for bad emails ([031bc6b](https://github.com/BogdanRaicevic/ied-projects/commit/031bc6bb3220ced8246c77065ac0dffdfc324f92))

### Bug Fixes

* badly formatted emails are colored red in zaposleni table ([a7f7567](https://github.com/BogdanRaicevic/ied-projects/commit/a7f756754437847ad9881920684b8651b9a5a35f))
* on FE populate mesto with `naziv_mesto` instead of ObjectID ([d061925](https://github.com/BogdanRaicevic/ied-projects/commit/d061925a5305e3d7ce2aed5650456c3a8cbe7ba8))
* Trigger email field validation on data load ([c9bbf32](https://github.com/BogdanRaicevic/ied-projects/commit/c9bbf32c1b0feb59653daea08d3d476d3630a341))

## [1.13.3](https://github.com/BogdanRaicevic/ied-projects/compare/v1.13.2...v1.13.3) (2026-03-20)

### Bug Fixes

* Add migration to remove invalid string `mesto` fields from `firmas` collection documents. ([64f0b44](https://github.com/BogdanRaicevic/ied-projects/commit/64f0b44cc252c6578e1b476765406b24f0906e9f))

## [1.13.2](https://github.com/BogdanRaicevic/ied-projects/compare/v1.13.1...v1.13.2) (2026-03-17)

### Bug Fixes

* the app would fail because save found created_at empty fields. we need to update only the comment. ([db61985](https://github.com/BogdanRaicevic/ied-projects/commit/db61985672a78676d04a820be9ffa3a8ed36a1ec))

## [1.13.1](https://github.com/BogdanRaicevic/ied-projects/compare/v1.13.0...v1.13.1) (2026-03-14)

### Bug Fixes

* type mismatch after refactoring ([f009ab6](https://github.com/BogdanRaicevic/ied-projects/commit/f009ab69485eb08e6bc3d637c49641dd886f6e6c))
* update `mesto_id` to support populated location objects across schema, backend, and frontend. ([6b5e48b](https://github.com/BogdanRaicevic/ied-projects/commit/6b5e48b9c1efef3caeaf83c774c3c4be10d29f60))

## [1.13.0](https://github.com/BogdanRaicevic/ied-projects/compare/v1.12.1...v1.13.0) (2026-03-14)

### Features

* fix tip_seminara usage and add new APIs ([c656ac7](https://github.com/BogdanRaicevic/ied-projects/commit/c656ac76819f39cec04d19f6918ae3fc5283a83f))

### Bug Fixes

* guard against bad ids ([97a5478](https://github.com/BogdanRaicevic/ied-projects/commit/97a547880a180021249521108751fafc64bb4ca7))
* remove console.log ([e2f39fb](https://github.com/BogdanRaicevic/ied-projects/commit/e2f39fb4f9965af1b9504a5be097f2ed7a9d0255))

## [1.12.1](https://github.com/BogdanRaicevic/ied-projects/compare/v1.12.0...v1.12.1) (2026-02-26)

### Bug Fixes

* minor bug fixes ([2314ee8](https://github.com/BogdanRaicevic/ied-projects/commit/2314ee8aa70169625273ba36e7d8ea6854748ee7))

## [1.12.0](https://github.com/BogdanRaicevic/ied-projects/compare/v1.11.0...v1.12.0) (2026-02-25)

### Features

* add migration adding mesto_id to each firma object ([551ac2d](https://github.com/BogdanRaicevic/ied-projects/commit/551ac2dca9d2f1fd3c8fe0b60f9e8bd33727ab69))
* migrate mesta in pretrage to be mesto_id ([e20df4d](https://github.com/BogdanRaicevic/ied-projects/commit/e20df4d3584c5d0a577f2ad38d7effff219c6537))

### Bug Fixes

* enable search by mesto_id ([4f3ad22](https://github.com/BogdanRaicevic/ied-projects/commit/4f3ad221ace7030d3a641d4fa242c3bceeb51b15))
* handle mesto_id in pretrage service ([f018b3e](https://github.com/BogdanRaicevic/ied-projects/commit/f018b3e0d29eef4150e088db1553bc034cd819b7))
* mesto relation in seminar search ([b34a1ec](https://github.com/BogdanRaicevic/ied-projects/commit/b34a1ece294ff2b21860b0fa587623f3d9d678d1))
* mongo projection property ([f617da5](https://github.com/BogdanRaicevic/ied-projects/commit/f617da5f3c801e15bcdb560f11f775ff11bafdd0))
* tests ([69814e6](https://github.com/BogdanRaicevic/ied-projects/commit/69814e670be09e0115f0583c014750bb2c11bbef))

## [1.11.0](https://github.com/BogdanRaicevic/ied-projects/compare/v1.10.5...v1.11.0) (2026-02-16)

### Features

* remove prijava comment on prijava delete ([dc5b32d](https://github.com/BogdanRaicevic/ied-projects/commit/dc5b32d5cf72d36f9c0761a4e873fd6189b080a1))

## [1.10.5](https://github.com/BogdanRaicevic/ied-projects/compare/v1.10.4...v1.10.5) (2026-01-24)

### Bug Fixes

* routes should not have access to db courser ([515131d](https://github.com/BogdanRaicevic/ied-projects/commit/515131dab2a1140291321dc145e777130b6ca621))

## [1.10.4](https://github.com/BogdanRaicevic/ied-projects/compare/v1.10.3...v1.10.4) (2026-01-24)

### Bug Fixes

* handle mongos server race condition ([12b67f3](https://github.com/BogdanRaicevic/ied-projects/commit/12b67f323e6294434dbc7c9cc44e5ba67ed87668))

## [1.10.3](https://github.com/BogdanRaicevic/ied-projects/compare/v1.10.2...v1.10.3) (2026-01-23)

### Bug Fixes

* vrsta_prijava was not defined for some entires, so a default was put in place ([42285be](https://github.com/BogdanRaicevic/ied-projects/commit/42285beae978445271795588999ccc235e87ebf5))

## [1.10.2](https://github.com/BogdanRaicevic/ied-projects/compare/v1.10.1...v1.10.2) (2026-01-21)

### Bug Fixes

* remove .populate because it attached whole object instead of just adding the _id ([1bde2fd](https://github.com/BogdanRaicevic/ied-projects/commit/1bde2fd94cd6e03d10f882efd8b72c5fc3c0a165))
* undefined in mongo ignores the field, unset to remove ([385b1a1](https://github.com/BogdanRaicevic/ied-projects/commit/385b1a1cc9545e0f08dcca43633473881ac8b75a))

## [1.10.1](https://github.com/BogdanRaicevic/ied-projects/compare/v1.10.0...v1.10.1) (2026-01-20)

### Bug Fixes

* add migration because prijave are now string values, not boolean ([01f8933](https://github.com/BogdanRaicevic/ied-projects/commit/01f8933ff6d4b2116b2b8c6acf35988939e2f28f))
* radio buttons were not clickable ([593c23c](https://github.com/BogdanRaicevic/ied-projects/commit/593c23c6d98effa3d452c0c0c0fe1e4d6ff3ae7a))

## [1.10.0](https://github.com/BogdanRaicevic/ied-projects/compare/v1.9.2...v1.10.0) (2026-01-17)

### Features

* add seed migration for seminar types ([2f8ae1d](https://github.com/BogdanRaicevic/ied-projects/commit/2f8ae1d4cc3562caf12068c4a88e169bbd762328))

### Bug Fixes

* Refactor Pretrage and fix missing searches for tipovi seminara ([ab15088](https://github.com/BogdanRaicevic/ied-projects/commit/ab1508892346c7b6dbd95c31cd561c1ee0ead177))
* wrong error message ([ffd90a7](https://github.com/BogdanRaicevic/ied-projects/commit/ffd90a7875cc9f9fde117ff91f1e7c3a265a95e4))

## [1.9.2](https://github.com/BogdanRaicevic/ied-projects/compare/v1.9.1...v1.9.2) (2026-01-10)

### Bug Fixes

* standardize ied-shared imports ([27f511f](https://github.com/BogdanRaicevic/ied-projects/commit/27f511f4bcbf89c3ef96a6fce0507b6b96d407db))

## [1.9.1](https://github.com/BogdanRaicevic/ied-projects/compare/v1.9.0...v1.9.1) (2026-01-10)

### Bug Fixes

* align hook form types ([f4e8099](https://github.com/BogdanRaicevic/ied-projects/commit/f4e80994bd253cd7a5604330069ce1868a9c3c5f))

## [1.9.0](https://github.com/BogdanRaicevic/ied-projects/compare/v1.8.0...v1.9.0) (2026-01-09)

### Features

* Add API for audit log stats overview ([4baed9e](https://github.com/BogdanRaicevic/ied-projects/commit/4baed9e9ce19c1ed3e95207695012dc73099b635))
* improve readability of time parameters ([49a9ba3](https://github.com/BogdanRaicevic/ied-projects/commit/49a9ba3738e4568c5d6e00047bc10b7a8ce8d7bb))
* show worked days ([54ba165](https://github.com/BogdanRaicevic/ied-projects/commit/54ba165e61dade767b3221c0895cbc4b01b5d05f))

### Bug Fixes

* badly formatted param delivered to route ([fd676cf](https://github.com/BogdanRaicevic/ied-projects/commit/fd676cf0c5fab9c6d29d1fa17818b4ede2cf1fac))
* remove testing code ([07469ed](https://github.com/BogdanRaicevic/ied-projects/commit/07469ed5b1abcaf63d7a93d55dbd47a9949ca9eb))
* return default values instead of throwing an error ([33eff96](https://github.com/BogdanRaicevic/ied-projects/commit/33eff96761b6e451cf33da332de27860a10bc6cf))
* send proper ISO format dates from BE to FE ([9181dd8](https://github.com/BogdanRaicevic/ied-projects/commit/9181dd8a6ff76ae11d3bada658bc0afbb31d9ab6))
* type issues ([0cd1d32](https://github.com/BogdanRaicevic/ied-projects/commit/0cd1d32b8591908070fbdb51acc47b0bca6bb02a))

## [1.8.0](https://github.com/BogdanRaicevic/ied-projects/compare/v1.7.3...v1.8.0) (2026-01-03)

### Features

* add CI step for executing tests ([3cff2c2](https://github.com/BogdanRaicevic/ied-projects/commit/3cff2c2b72036c62fcf3ce53b6a86470e81aaf29))
* add faker to fake data ([232db2a](https://github.com/BogdanRaicevic/ied-projects/commit/232db2a246358ed62f9f0a3cac3fd1569a99f36d))

## [1.7.3](https://github.com/BogdanRaicevic/ied-projects/compare/v1.7.2...v1.7.3) (2025-12-30)

### Bug Fixes

* type alocated to query filter ([2638a9d](https://github.com/BogdanRaicevic/ied-projects/commit/2638a9d822c37e757a24820f341401d4cad58cb3))
* type mismatch ([e7c4714](https://github.com/BogdanRaicevic/ied-projects/commit/e7c4714fc1d553372df9d67d970f655c63f157f5))

## [1.7.2](https://github.com/BogdanRaicevic/ied-projects/compare/v1.7.1...v1.7.2) (2025-12-29)

### Bug Fixes

* make tipSeminara optional ([26d2d41](https://github.com/BogdanRaicevic/ied-projects/commit/26d2d410a72fd63ed9ba0191f052e85172ca8e87))

## [1.7.1](https://github.com/BogdanRaicevic/ied-projects/compare/v1.7.0...v1.7.1) (2025-12-29)

### Reverts

* Revert "chore: (renovate): Update dependency zod to ^4.2.1" ([9c0d968](https://github.com/BogdanRaicevic/ied-projects/commit/9c0d9680503a0d2daf5973386740f335bd8ecc60))

## [1.7.0](https://github.com/BogdanRaicevic/ied-projects/compare/v1.6.0...v1.7.0) (2025-12-22)

### Features

* add collection for tip seminara and required infrastructure ([dedafb1](https://github.com/BogdanRaicevic/ied-projects/commit/dedafb1d7fec8cfc534dd06b75a75c1899ead928))
* add field for search by tip seminara ([0c0fbf7](https://github.com/BogdanRaicevic/ied-projects/commit/0c0fbf78090f7700f7794b0e71659dbdf7a04664))

### Bug Fixes

* findByIdAndDelete expects the ID as first param directly ([0cbe474](https://github.com/BogdanRaicevic/ied-projects/commit/0cbe47400193d0df7d8779032e3bd9fc0d524553))
* minor improvements ([75f9ec2](https://github.com/BogdanRaicevic/ied-projects/commit/75f9ec2c1e50ef49351e1dd2df5893d5a5ccadda))
* search query overwriting seminar results ([a18ab89](https://github.com/BogdanRaicevic/ied-projects/commit/a18ab898876489a9a09079a254938a72e4522864))

## [1.6.0](https://github.com/BogdanRaicevic/ied-projects/compare/v1.5.3...v1.6.0) (2025-12-20)

### Features

* add dates for filtering ([40c61ad](https://github.com/BogdanRaicevic/ied-projects/commit/40c61ad860d97b189383e4543b4cfb14b696a6b9))

## [1.5.3](https://github.com/BogdanRaicevic/ied-projects/compare/v1.5.2...v1.5.3) (2025-12-19)

### Bug Fixes

* Search seminars further in the future when creating a prijava for seminar ([b979aab](https://github.com/BogdanRaicevic/ied-projects/commit/b979aab8c246b495e7bfb57c1ca6b1cf27a202b9))

## [1.5.2](https://github.com/BogdanRaicevic/ied-projects/compare/v1.5.1...v1.5.2) (2025-12-14)

### Bug Fixes

* rename date field name ([95b857d](https://github.com/BogdanRaicevic/ied-projects/commit/95b857df171bc564f22c9de23c95d171baadc367))

## [1.5.1](https://github.com/BogdanRaicevic/ied-projects/compare/v1.5.0...v1.5.1) (2025-12-14)

### Bug Fixes

* hide metadata fields in the UI ([761028a](https://github.com/BogdanRaicevic/ied-projects/commit/761028ac01a8ee347b449158667669da917dee42))
* remove metadata fields from audit log ([215ab1a](https://github.com/BogdanRaicevic/ied-projects/commit/215ab1ae95faaf659db7471828d37b2a9e02fb89))

## [1.5.0](https://github.com/BogdanRaicevic/ied-projects/compare/v1.4.0...v1.5.0) (2025-12-14)

### Features

* pull and calculate ukupnaNaknada ([89b9f5e](https://github.com/BogdanRaicevic/ied-projects/commit/89b9f5e3af128aeec66c03e964c6aad3761141ee))

## [1.4.0](https://github.com/BogdanRaicevic/ied-projects/compare/v1.3.6...v1.4.0) (2025-12-06)

### Features

* add firma seminar table ([6c82a85](https://github.com/BogdanRaicevic/ied-projects/commit/6c82a85789dd748e23f14fefc809fac1561f671a))
* add FirmaSeminarCharts component ([d087c11](https://github.com/BogdanRaicevic/ied-projects/commit/d087c11b44a61ed8076d706583111538ed83d7b1))
* Add migration to fix string ids in prijave ([057ba6f](https://github.com/BogdanRaicevic/ied-projects/commit/057ba6f4118cea020d98e6d71bebe0731fdd91dd))
* add query parameters for firma seminari ([14fc73a](https://github.com/BogdanRaicevic/ied-projects/commit/14fc73aadaf80d3c050fa9d8f38959a778835fce))
* add scroll bar at the top of the table ([2096d9a](https://github.com/BogdanRaicevic/ied-projects/commit/2096d9ae37702910c72171b55648a3434a8c6557))
* add sub table for firma's seminars ([4775a81](https://github.com/BogdanRaicevic/ied-projects/commit/4775a817f6ae3636f7c040c0ebd16541e09aa574))
* create service to fetch seminari for firma overview ([5cdb860](https://github.com/BogdanRaicevic/ied-projects/commit/5cdb860d9748d657b3cc7e5c3269d6b2546edc43))
* use search params ([443ab03](https://github.com/BogdanRaicevic/ied-projects/commit/443ab03958ae7bb895c0c0406eb79c35c3201f92))

### Bug Fixes

* failing build ([96c12cc](https://github.com/BogdanRaicevic/ied-projects/commit/96c12cc486ba820cd16ba4ea7033c08aa68e057e))
* Fix prijave saving ids as strings instead of ObjectID ([60f4fbe](https://github.com/BogdanRaicevic/ied-projects/commit/60f4fbe242854108974e71fa60a233663a2ad6da))
* tables not using pagination options ([b8e5251](https://github.com/BogdanRaicevic/ied-projects/commit/b8e52514951f02d5691015e2f6570e01715aa0a3))

## [1.3.6](https://github.com/BogdanRaicevic/ied-projects/compare/v1.3.5...v1.3.6) (2025-11-23)

### Bug Fixes

* package json version should be auto incremented ([7816314](https://github.com/BogdanRaicevic/ied-projects/commit/78163140a8b2fe929b4357962e8fc79e7468e67b))

## [1.3.5](https://github.com/BogdanRaicevic/ied-projects/compare/v1.3.4...v1.3.5) (2025-11-23)

### Bug Fixes

* rename workflow ([4fdffb9](https://github.com/BogdanRaicevic/ied-projects/commit/4fdffb95cea653b66f9b3b10520c9d6e8889c52a))

# Changelog
