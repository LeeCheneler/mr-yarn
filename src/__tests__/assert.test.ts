import { assertWorkspaceConfig } from '../assert'

describe('checkWorkspaceConfig', () => {
  const validWorkspaceConfig = {
    private: true,
    workspaces: ['packages/*']
  }

  it('should accept valid config', () => {
    expect(() => assertWorkspaceConfig(validWorkspaceConfig)).not.toThrow()
  })

  it('should reject public packages', () => {
    expect(() => assertWorkspaceConfig({ ...validWorkspaceConfig, private: false })).toThrow()
  })

  it('should reject no workspaces', () => {
    expect(() => assertWorkspaceConfig({ ...validWorkspaceConfig, workspaces: null })).toThrow()
    expect(() => assertWorkspaceConfig({ ...validWorkspaceConfig, workspaces: [] })).toThrow()
  })
})
