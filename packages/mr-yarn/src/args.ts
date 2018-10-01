/**
 * Extracts forwarded options from an argv array.
 * Forwarded options are all options past: ' -- ' in the command.
 * @param {String[]} argv
 * @returns {string} Options joined by a space.
 */
export const extractForwardedOptions = (argv: string[]) => {
    const forwardOptionsFlagIndex = argv.indexOf('--')
    if (forwardOptionsFlagIndex > -1) {
        return argv.slice(forwardOptionsFlagIndex + 1).join(' ')
    }

    return '';
}