# Contributing to Mr Yarn

Clone the repo down to your machine.

## Scripts

Start the dev script, this builds and links the library globally to ensure the integration tests are running against the local build and not another installed version of Mr Yarn.

```bash
yarn dev
```

Run tests, this includes unit and integration in one go. This repository is very integration test heavy on purpose.

```bash
yarn test
```

Run tests in watch mode. This isn't always reliable because very often the build and link cycle performed in the zdevz script is late finishing.

```bash
yarn test:watch
```

Build the tool into `.build`

```bash
yarn build
```

Lint code.

```bash
yarn lint
```

## Precommit

A precommit hook runs linting and tests to try and maintain quality code in origin.
