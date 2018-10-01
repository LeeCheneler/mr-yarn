import { extractForwardedOptions } from '../args';

describe('extractForwardedOptions', () => {
    it('should extract all forwarded options', () => {
        [
            {command: "mr run test -- -u -a", expected: '-u -a'},
            {command: "mr run test -- -u", expected: '-u'},
            {command: "mr run test --", expected: ''},
            {command: "mr run test", expected: ''},
            {command: "mr run test --p", expected: ''},
            {command: "mr run test --p -abc -- hello", expected: 'hello'}
            ]
            .forEach(({command, expected}) => {
                expect(extractForwardedOptions(command.split(' '))).toBe(expected)
            })
    })
})