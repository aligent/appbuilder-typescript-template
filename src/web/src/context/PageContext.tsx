import { createContext, useContext } from 'react';

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
 */
function formatShortTitle(title: string) {
    return title.split(' ').length >= 3
        ? title.split(' ').slice(0, 5).join('').toUpperCase()
        : title.slice(0, 5);
}

export const PageContextProvider = ({
    children,
    title,
    shortTitle,
}: {
    children: React.ReactNode;
    title?: string;
    shortTitle?: string;
}) => {
    title = title?.trim() || 'Adobe App Builder';
    shortTitle = shortTitle?.trim() || formatShortTitle(title);

    return <PageContext value={{ title, shortTitle }}>{children}</PageContext>;
};

export const usePageContext = () => {
    return useContext(PageContext);
};
