interface IWorkspaceConfig {
  private: boolean
  workspaces: string[]
}

export const assertWorkspaceConfig = ({ private: privatePackage, workspaces }: IWorkspaceConfig) => {
  if (!(privatePackage && workspaces && workspaces.length > 0)) {
    throw new Error(
      "Invalid Yarn Workspace config. Ensure you run this tool in the same directory as the 'package.json' that configures Yarn Workspaces."
    )
  }
}
