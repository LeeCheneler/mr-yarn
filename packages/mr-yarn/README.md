# Mr Yarn

[![CircleCI](https://circleci.com/gh/LeeCheneler/mr-yarn.svg?style=svg)](https://circleci.com/gh/LeeCheneler/mr-yarn)

Mr Yarn is a mono repository utility tool specifically for mono repositories powered by [Yarn Workspaces](https://yarnpkg.com/lang/en/docs/workspaces/).

## Installation

```bash
yarn global add mr-yarn
```

## Getting Started

Check Mr Yarn's version:

```bash
mr --version
```

Add dependencies:

```bash
# Dependencies
mr add react react-dom

# Dev dependencies
mr add --dev webpack
mr add -D webpack

# Filter workspaces
mr add --workspaces workspace-one yargs
mr add -w workspace-one yargs
```

Run an NPM script:

```bash
# No args
mr run start

# With args '--proxy localhost:8080'
mr run start -- --proxy localhost:8080

# Filter workspaces
mr run --workspaces workspace-one start
mr run -w workspace-one start
```

## Commands

| Command | Description                     | Supported Switches     |
| ------- | ------------------------------- | ---------------------- |
| Add     | Add dependencies to workspaces  | `--dev` `--workspaces` |
| Run     | Run an NPM script in workspaces | `--workspaces` `--`    |

## Switches

| Switch         | Alt  | Descirption                                                                     |
| -------------- | ---- | ------------------------------------------------------------------------------- |
| `--`           |      | Forwards the arguments following it onto the. Must be at the end of the command |
| `--dev`        | `-D` | Install dependencies as dev dependencies                                        |
| `--version`    |      | Outputs the version of Mr Yarn when no command is used                          |
| `--workspaces` | `-w` | Filter the command to only the specified workspaces                             |

## Verified to work against

|      | Version |
| ---- | ------- |
| Yarn | 1.7.0   |
| Node | 8.11.3  |

## FAQ 🤔

**Is Mr Yarn a replacement for Lerna?**

Sort of... Lerna's scope is greater than that of Mr Yarn. This tool is more interested in making developers lives in mono repos easier. It isn't interested (right now 😛) in publishing et al.
