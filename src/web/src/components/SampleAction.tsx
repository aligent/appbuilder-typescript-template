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
import allActions from '../config.json';
import { useAppBuilderAction } from '../hooks/useAppBuilderAction';
import { JsonTree } from './JsonTree';

export const SampleAction = (props: { ims: { token: string; org: string } }) => {
    // Set up react hook to invoke our appbuilder action
    const sampleActionUrl = allActions['appbuilder/api-sample'];
    const { response, loading, error, invoke } = useAppBuilderAction<{
        abilities: Array<{ ability: { name: string } }>;
    }>({
        url: sampleActionUrl,
        method: 'GET',
        ims: props.ims,
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
