# Mr Yarn

[![CircleCI](https://circleci.com/gh/LeeCheneler/mr-yarn.svg?style=svg)](https://circleci.com/gh/LeeCheneler/mr-yarn)

Mr Yarn is a mono repository utility tool specifically for mono repositories powered by [Yarn Workspaces](https://yarnpkg.com/lang/en/docs/workspaces/).

It isn't designed to do anything Yarn can't do. It simply optimizes your mono repo workflow by allowing you to perform common actions like installing dependencies and running scripts across multiple workspaces (packages) in a single command.

## Installation

```bash
# Install globally
yarn global add mr-yarn

# Verify installation
mr --version
```

## Commands

### `add`

Add dependencies to workspaces. Mr Yarn will automatically detect any dependencies that are local workspaces and add those too!

```bash
# Dependencies
mr add react react-dom

# Dev dependencies
mr add --dev webpack
mr add -D webpack

# Filter workspaces
mr add --workspaces workspace-one yargs
mr add --workspaces workspace-one yargs
mr add -w workspace-one yargs
```

### `remove`

Remove dependencies from workspaces.

```bash
# Dependencies
mr remove react react-dom

# Filter workspaces
mr remove --workspaces workspace-one yargs
mr remove -w workspace-one yargs
```

### `run`

Run NPM scripts in workspaces.

**Currently all scripts are run in parallel all the time.**

```bash
# No args
mr run start

# With args 'webpack-dev-server --hot'
mr run start -- --hot

# Filter workspaces
mr run --workspaces workspace-one start
mr run -w workspace-one start
```

## Filtering workspaces

You can use a comma seperated list with the workspaces flag.

```bash
# A single filtered workspace
mr add --workspaces workspace-one yargs
mr add --workspaces workspace-one yargs

# Multiple filtered workspaces
mr add --workspaces workspace-one,workspace-two yargs
mr add --workspaces workspace-one,workspace-two yargs
```

## CLI

Other useful options:

```bash
# Display help including commands and their options
mr --help

# Display Mr Yarn's version
mr --version
```

## FAQ 🤔

**Is Mr Yarn a replacement for Lerna?**

Sort of... Lerna's scope is greater than that of Mr Yarn. This tool is more interested in making developers lives in mono repos easier. It isn't interested (right now 😛) in publishing et al.
