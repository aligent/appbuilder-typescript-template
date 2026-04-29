export interface AIORuntime {
    apiHost?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on: (event: string, callback: (data: any) => void) => void;
    done?: () => void;
    solution?: {
        icon: string;
        title: string;
        shortTitle: string;
    };
    title?: string;
    favicon?: string;
    heroClick?: () => void;
}

export interface IMSContext {
    token?: string;
    org?: string;
    profile?: unknown;
}

export interface AppProps {
    runtime: AIORuntime;
    ims: IMSContext;
}
