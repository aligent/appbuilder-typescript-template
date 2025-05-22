import { init, type Runtime } from '@adobe/exc-app';
import type { ImsProfile } from '@adobe/exc-app/ims/ImsProfile';
import page from '@adobe/exc-app/page';
import topbar from '@adobe/exc-app/topbar';
import { isInIframe } from './isInIframe';

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
export class RuntimeManager {
    private readonly CACHE_KEY = 'unifiedShellMRScript';
    private readonly HOT_RELOAD_KEY = 'EXC_US_HMR';
    private readonly ALLOWED_DOMAINS = [
        /^(exc-unifiedcontent\.)?experience(-qa|-stage|-cdn|-cdn-stage)?\.adobe\.(com|net)$/,
        /localhost\.corp\.adobe\.com$/,
    ];
    private readonly EXTENSION = '.js';
    private readonly PROTOCOL = 'https:';

    private readonly shortTitle: string;
    private url: string | null = null;

    constructor(private readonly title: string = 'Adobe App Builder') {
        if (!isInIframe()) {
            throw new Error('Module Runtime: Needs to be within an iframe');
        }

        this.shortTitle =
            this.title.split(' ').length >= 3
                ? this.title.split(' ').slice(0, 5).join('').toUpperCase()
                : this.title.slice(0, 5);
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
    public loadUrl() {
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

                    topbar.solution = {
                        icon: 'AdobeExperienceCloud',
                        title: this.title,
                        shortTitle: this.shortTitle,
                    };

                    page.title = this.title;

                    resolve({ runtime, ims });
                });
            });
        });
    }
}

export const mockRuntime = {
    on: () => {},
    configured: true,
    lastConfigurationPayload: null,
    off: () => {},
    emit: () => {},
} satisfies Runtime;

export const mockIms = {
    token: 'mock-token',
    org: 'mock-org',
    profile: {
        account_type: 'mock-account-type',
        authId: 'mock-auth-id',
        avatar: 'mock-avatar',
        avatarSrc: 'mock-avatar-src',
        countryCode: 'mock-country-code',
        displayName: 'mock-display-name',
        email: 'mock-email',
        emailVerified: true,
        first_name: 'mock-first-name',
        job_function: 'mock-job-function',
        last_name: 'mock-last-name',
        name: 'mock-name',
        preferred_languages: ['mock-preferred-language'],
        projectedProductContext: [],
        session: 'mock-session',
        userId: 'mock-user-id',
    },
} satisfies Ims;
