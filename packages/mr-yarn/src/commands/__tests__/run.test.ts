import {expandWorkspaceScripts} from '../run'

const workspace = {
    __workspaceConfigFilepath: "",
    __workspaceDir: "",
    name: "",
    version: "",
}

describe('expandWorkspaceScripts', () => {
    it('should include scripts present in the workspaces', () => {
        const workspaces = [
            {...workspace, scripts: {start: 'webpack'}},
            {...workspace, scripts: {build: 'webpack'}},
            {...workspace, scripts: {}},
            {...workspace}
        ]

        const expandedWorkspaces = expandWorkspaceScripts(workspaces, 'start');
        expect(expandedWorkspaces)
            .toEqual([{workspace: workspaces[0], script: 'start'}])
    })


    it('should expand glob syntax', () => {
        const workspaces = [
            {...workspace, scripts: { "run:a": 'webpack', "run:b": 'webpack', "run:c": 'webpack' }},
            {...workspace, scripts: { "run:xyz": 'webpack' }}
        ]

        const expandedWorkspaces = expandWorkspaceScripts(workspaces, 'run:*');

        expect(expandedWorkspaces).toEqual([
            {workspace: workspaces[0], script: 'run:a'},
            {workspace: workspaces[0], script: 'run:b'},
            {workspace: workspaces[0], script: 'run:c'},
            {workspace: workspaces[1], script: 'run:xyz'}
        ])
    })


});
