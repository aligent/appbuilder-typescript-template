declare module '@adobe/exc-app/topbar' {
    // The types declared in @adobe/aio-lib-core-config are inaccurate, providing our own declaration here
    export interface TopbarSolution {
        icon: string;
        title: string;
        shortTitle: string;
    }

    const topbar: {
        solution: TopbarSolution;
    };

    export default topbar;
}
