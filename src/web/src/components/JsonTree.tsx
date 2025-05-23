import { Button, Text, TreeView, TreeViewItem, TreeViewItemContent } from '@adobe/react-spectrum';
import Brackets from '@spectrum-icons/workflow/Brackets';
import BracketsSquare from '@spectrum-icons/workflow/BracketsSquare';
import { useCallback } from 'react';

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/**
 * A component that displays a JSON object as a recursive tree view.
 * @param props - The props for the component.
 * @param props.response - The JSON object to display.
 * @returns A component that displays a JSON object as a recursive tree view.
 */
export const JsonTree = (props: { response: Json }) => {
    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(JSON.stringify(props.response, null, 2));
    }, [props.response]);

    return (
        <>
            <Button variant="primary" onPress={handleCopy} marginBottom="size-100">
                Copy Raw Response
            </Button>
            <TreeView aria-label="Tree view of response data">
                <JsonTreeViewItem path="" name="root" value={props.response} />
            </TreeView>
        </>
    );
};

// NOTE: TreeViewItem components MUST have a unique id
// Otherwise they will not be displayed by the TreeView component
const JsonTreeViewItem = (props: { path: string; name: string; value: Json }) => {
    if (Array.isArray(props.value)) {
        return <ArrayTreeViewItem path={props.path} name={props.name} value={props.value} />;
    }

    if (typeof props.value === 'object' && props.value !== null) {
        return <ObjectTreeViewItem path={props.path} name={props.name} value={props.value} />;
    }

    return (
        <TreeViewItem id={`${props.path}.${props.name}`} textValue={props.name}>
            <TreeViewItemContent>
                <Text>
                    {props.name}: {props.value?.toString()}
                </Text>
            </TreeViewItemContent>
        </TreeViewItem>
    );
};

const ArrayTreeViewItem = (props: { path: string; name: string; value: Json[] }) => {
    return (
        <TreeViewItem id={`${props.path}.${props.name}`} textValue={props.name}>
            <TreeViewItemContent>
                <Text>{props.value.length ? props.name : `${props.name}`}</Text>
                <BracketsSquare />
            </TreeViewItemContent>
            {props.value.length ? (
                props.value.map((item, index) => (
                    <JsonTreeViewItem
                        path={`${props.path}.${props.name}`}
                        name={index.toString()}
                        value={item}
                        // Note that this may not be better than array index keys
                        // as props.name is consistent across all items
                        // - consider a different key if sorting or changing the array is required
                        key={`${props.name}-${index}`}
                    />
                ))
            ) : (
                <TreeViewItem id={`${props.path}.${props.name}.empty`} textValue="(empty)">
                    <TreeViewItemContent>
                        <Text>(empty)</Text>
                    </TreeViewItemContent>
                </TreeViewItem>
            )}
        </TreeViewItem>
    );
};

const ObjectTreeViewItem = (props: {
    path: string;
    name: string;
    value: { [key: string]: Json };
}) => {
    return (
        <TreeViewItem id={`${props.path}.${props.name}`} textValue={props.name}>
            <TreeViewItemContent>
                <Text>{props.name}</Text>
                <Brackets />
            </TreeViewItemContent>
            {Object.entries(props.value).map(([key, value]) => (
                <JsonTreeViewItem
                    path={`${props.path}.${props.name}`}
                    name={key}
                    value={value}
                    key={`${props.name}-${key}`}
                />
            ))}
        </TreeViewItem>
    );
};
