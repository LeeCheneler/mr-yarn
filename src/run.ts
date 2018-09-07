import * as fs from 'fs-extra'
import * as yargs from 'yargs'
import { assertWorkspaceConfig } from './assert'
import { defaultLogger } from './logger'

interface IRunOptions {
  workspacesConfigFilePath: string
}

export const run = async ({ workspacesConfigFilePath }: IRunOptions) => {
  try {
    /**
     * Validate Yarn Workspaces config first and foremost as this tool requires it
     */
    const workspacesConfig = await fs.readJson(workspacesConfigFilePath)
    assertWorkspaceConfig(workspacesConfig)

    /**
     * Initiate the CLI
     */
    yargs.help().version().argv // tslint:disable-line
  } catch (error) {
    defaultLogger.error(error)
  }
}
