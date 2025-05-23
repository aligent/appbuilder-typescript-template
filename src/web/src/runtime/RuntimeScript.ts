import { init, type Runtime } from '@adobe/exc-app';
import type { ImsProfile } from '@adobe/exc-app/ims/ImsProfile';
import page from '@adobe/exc-app/page';

/**
 * Adobe Identity Management Service properties
 */
export interface Ims {
    profile: ImsProfile;
    org: string;
    token: string;
}

/**
 * Handles loading and initialising the Adobe runtime
 *
 * @param title - The title of the application
 */
export class RuntimeScript {
    private readonly CACHE_KEY = 'unifiedShellMRScript';
    private readonly HOT_RELOAD_KEY = 'EXC_US_HMR';
    private readonly ALLOWED_DOMAINS = [
        /^(exc-unifiedcontent\.)?experience(-qa|-stage|-cdn|-cdn-stage)?\.adobe\.(com|net)$/,
        /localhost\.corp\.adobe\.com$/,
    ];
    private readonly EXTENSION = '.js';
    private readonly PROTOCOL = 'https:';

    private url: string | null = null;

    /**
     * Check if the current window is an iframe
     * The Adobe runtime should only be available within the Experience Cloud iframe
     *
     * @returns true if the current window is an iframe, false otherwise
     */
    public isInIframe() {
        try {
            return window.self !== window.top;
        } catch {
            return true;
        }
    }

    /**
     * Finds the url to the runtime script
     *
     * @returns The url to the runtime script
     */
    private findUrl(): string | null {
        let url = new URL(window.location.href).searchParams.get('_mr');
        if (url) {
            console.log('Module Runtime: Using script URL from search params');
        } else if ('EXC_US_HMR' in window) {
            url = window.sessionStorage.getItem(this.CACHE_KEY);
            console.log('Module Runtime: Using cached script URL');
        }

        if (!url) {
            console.warn('Module Runtime: No script URL found');
            return null;
        }

        return url;
    }

    /**
     * Validates and parses the url to the runtime script
     *
     * @param rawUrl - The url to the runtime script
     * @returns The parsed url to the runtime script
     */
    private parseUrl(rawUrl: string): string | null {
        let url: URL;
        try {
            url = new URL(decodeURIComponent(rawUrl));
        } catch {
            console.warn('Module Runtime: Invalid script URL encoding');
            return null;
        }

        if (url.protocol !== this.PROTOCOL) {
            console.warn(`Module Runtime: Script URL protocol must be ${this.PROTOCOL}`);
            return null;
        }

        if (!this.ALLOWED_DOMAINS.some(re => re.test(url.hostname))) {
            console.warn('Module Runtime: Script URL must be from an allowed domain');
            return null;
        }

        if (!url.pathname.endsWith(this.EXTENSION)) {
            console.warn(`Module Runtime: Script URL must have a ${this.EXTENSION} extension`);
            return null;
        }

        return url.toString();
    }

    /**
     * Caches the url to the runtime script for hot reloading support
     */
    private cacheUrl(): void {
        if (!this.url) {
            console.warn('Module Runtime: No script URL found');
            return;
        }

        if (!this.parseUrl(this.url)) {
            console.warn('Module Runtime: Invalid ');
            return;
        }

        window.sessionStorage.setItem(this.CACHE_KEY, this.url);
        console.log('Module Runtime: Cached script URL');
    }

    /**
     * Finds, validates, and caches the url to the runtime script
     *
     * @returns true if the url was loaded successfully, false otherwise
     */
    public getUrl() {
        const rawUrl = this.findUrl();
        if (!rawUrl) {
            console.warn('Module Runtime: No script URL found');
            return false;
        }

        const parsedUrl = this.parseUrl(rawUrl);

        if (!parsedUrl) {
            console.warn('Module Runtime: Invalid script URL');
            return false;
        }

        this.url = parsedUrl;
        this.cacheUrl();
        return true;
    }

    /**
     * Attaches the runtime script to the document
     * Triggers a hot reload if hot reloading is enabled
     *
     * @returns true if the script was attached successfully, false otherwise
     */
    public attachToDocument() {
        if (!this.url) {
            return false;
        }

        const script = document.createElement('script');
        script.async = true;
        script.src = this.url;

        return new Promise<boolean>(resolve => {
            script.onload = () => {
                const hotReload = this.HOT_RELOAD_KEY in window && window[this.HOT_RELOAD_KEY];
                if (typeof hotReload === 'function') {
                    hotReload();
                }
                resolve(true);
            };
            script.onerror = () => resolve(false);

            document.head.appendChild(script);
        });
    }

    /**
     * Initialises the runtime object and sets the application properties
     *
     * @returns {Object} The runtime object and IMS properties
     */
    public initialise() {
        return new Promise<{ runtime: Runtime; ims: Ims }>(resolve => {
            init(runtime => {
                runtime.on('ready', ({ imsOrg, imsToken, imsProfile }) => {
                    page.done();
                    const ims = {
                        profile: imsProfile,
                        org: imsOrg,
                        token: imsToken,
                    };

                    resolve({ runtime, ims });
                });
            });
        });
    }
}
