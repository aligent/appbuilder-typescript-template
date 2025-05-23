import {
    ActionButton,
    Form,
    Heading,
    InlineAlert,
    ProgressCircle,
    TextField,
    View,
    Well,
} from '@adobe/react-spectrum';
import Search from '@spectrum-icons/workflow/Search';
import { useState } from 'react';
import { useAdobeRuntimeContext } from '../context/AdobeRuntimeContextProvider';
import { useAppBuilderAction } from '../hooks/useAppBuilderAction';
import { JsonTree, type Json } from './JsonTree';
export const SampleAction = () => {
    // Set up react hook to invoke our appbuilder action
    const { ims } = useAdobeRuntimeContext();
    const { response, loading, error, invoke } = useAppBuilderAction<Json>({
        name: 'appbuilder/api-sample',
        method: 'GET',
        ims,
    });

    // Keep track of the pokemon name input by the user
    const [pokemon, setPokemon] = useState('');

    return (
        <View>
            <Heading id="sample-action-heading" level={1}>
                Sample Action
            </Heading>
            <Form
                width="size-400"
                aria-labelledby="sample-action-heading"
                onSubmit={ev => {
                    ev.preventDefault();
                    invoke({ searchParams: { name: pokemon } });
                }}
            >
                <TextField
                    label="Enter pokemon name"
                    isRequired
                    name="pokemon"
                    value={pokemon}
                    onChange={setPokemon}
                    isDisabled={loading}
                />
                <ActionButton type="submit" isDisabled={loading}>
                    <Search />
                    Fetch details
                </ActionButton>
            </Form>
            {loading && (
                <ProgressCircle aria-label="Loading" isIndeterminate marginTop="size-200" />
            )}
            {error && (
                <InlineAlert variant="negative" marginTop="size-200">
                    {error}
                </InlineAlert>
            )}
            {response && (
                <Well marginTop="size-200">
                    <JsonTree response={response} />
                </Well>
            )}
        </View>
    );
};
