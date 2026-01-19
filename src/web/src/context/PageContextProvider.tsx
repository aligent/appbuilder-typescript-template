import page from '@adobe/exc-app/page';
import topbar from '@adobe/exc-app/topbar';
import { createContext, useContext, useEffect } from 'react';
import { useAdobeRuntimeContext } from './AdobeRuntimeContextProvider.ts';

interface PageContextType {
    title: string;
    shortTitle: string;
}

export const PageContext = createContext<PageContextType>({
    title: 'Adobe App Builder',
    shortTitle: 'AAB',
});

/**
 * Format a short title from the full title
 *
 * If the title is less than 3 words, use the first 5 characters
 * If the title is 3 or more words, make an acronym from the first 5 words
 *
 * @param title - The title to format
 * @returns The short title
 *
 * @example
 * ```tsx
 * formatShortTitle('Adobe App Builder') // 'AAB'
 * formatShortTitle('Aligent Template') // 'Aligent'
 * ```
 */
function formatShortTitle(title: string) {
    return title.split(' ').length >= 3
        ? title.split(' ').slice(0, 5).join('').toUpperCase()
        : title.slice(0, 5);
}

/**
 * Provides page properties to the application
 *
 * If wrapped with AdobeRuntimeContextProvider, it will
 * update the topbar and page title on successfully loading the Adobe runtime
 *
 * @param children - The children to render
 * @param title - Optional title for the page
 * @param shortTitle - Optional short title for the page
 * @returns Page properties for the application
 *
 * @default title - 'Adobe App Builder'
 * @default shortTitle - 'AAB'
 *
 * @example
 * ```tsx
 * <AdobeRuntimeContextProvider>
 *     <PageContextProvider title="Aligent App Builder Typescript Template">
 *         <App />
 *     </PageContextProvider>
 * </AdobeRuntimeContextProvider>
 * ```
 */
export const PageContextProvider = ({
    children,
    title,
    shortTitle,
}: {
    children: React.ReactNode;
    title?: string;
    shortTitle?: string;
}) => {
    const formattedTitle = title?.trim() || 'Adobe App Builder';
    const formattedShortTitle = shortTitle?.trim() || formatShortTitle(formattedTitle);

    document.title = formattedTitle;

    // If wrapped with AdobeRuntimeContextProvider
    // update the topbar and page title on successfully loading the Adobe runtime
    const { loading, error } = useAdobeRuntimeContext();
    useEffect(() => {
        if (loading || error) {
            return;
        }

        topbar.solution = {
            icon: 'AdobeExperienceCloud',
            title: formattedTitle,
            shortTitle: formattedShortTitle,
        };

        page.title = formattedTitle;
    }, [loading, error, formattedTitle, formattedShortTitle]);

    return (
        <PageContext value={{ title: formattedTitle, shortTitle: formattedShortTitle }}>
            {children}
        </PageContext>
    );
};

export const usePageContext = () => {
    return useContext(PageContext);
};
