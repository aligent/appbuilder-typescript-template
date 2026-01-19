declare module '@adobe/exc-app/page' {
    // The types declared in @adobe/aio-lib-core-config are inaccurate, providing our own declaration here
    export interface PageDoneOptions {
        name?: string;
    }

    export interface PerformanceRecord {
        appId: string;
        capability?: string;
        error?: string;
        lastAppId?: string;
        loadTimes?: LoadTimes;
        loadType?: string;
        name?: string;
        nestingParent?: {
            appId: string;
            spaAppId?: string;
            topAppId?: string;
            topSpaAppId?: string;
        };
        previousSection?: string;
        region?: string;
        retries?: number;
        section?: string;
        serviceWorker: boolean;
        spaAppId?: string;
        thunderbird?: THUNDERBIRD;
        valid?: boolean;
        version: string;
    }

    export interface PageApi {
        title: string;
        done(options?: PageDoneOptions): Promise<PerformanceRecord>;
    }

    const page: PageApi;
    export default page;
}
