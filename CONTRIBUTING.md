# Contributing to OpenCASE

**Status:** This file is the current, authoritative contribution process — no separate
governance doc exists for this repo today.

## Before you start

Read the [README](README.md) for what OpenCASE is (a self-hosted CASE 1.0/1.1 platform), and
[`docs/DEVELOPMENT.md`](docs/DEVELOPMENT.md) for local setup (`docker-compose up --build` gets
all services running). [`docs/GET_STARTED.md`](docs/GET_STARTED.md) covers production deployment
instead, if that's what you're touching.

## Proposing a change

- **Bug fixes / small features**: open a PR against `main`. CI (`ci.yml`) runs automatically;
  `release.yml` handles versioned releases separately — don't hand-edit version tags.
  One reviewer approval before merge.
- **CASE spec compliance changes**: OpenCASE targets full CASE 1.0/1.1 compliance for 1EdTech
  certification — a change that affects spec conformance should reference the relevant CASE spec
  section in the PR description.
- **Larger features** (new capability, architecture change): open an issue first to discuss
  approach before investing in an implementation — this is a multi-service system
  (visual editor, publishing server, identity/access), and a design mismatch is cheaper to catch
  before code than after.

## License

Apache 2.0. Contributions are under the same license.

## Questions

Open a GitHub issue, or reach out to the OpenEvo Computational Curriculum Studies Lab
([openevo.eva.mpg.de](http://openevo.eva.mpg.de)).
