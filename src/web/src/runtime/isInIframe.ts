/**
 * Check if the current window is an iframe
 * The Adobe runtime should only be available within the Experience Cloud iframe
 *
 * @returns true if the current window is an iframe, false otherwise
 */
export function isInIframe(): boolean {
    try {
        return window.self !== window.top;
    } catch {
        return true;
    }
}
