import { Content, Heading, Link, View } from '@adobe/react-spectrum';
export const Documentation = () => (
    <View width="size-16000">
        <Heading level={1}>Useful documentation for your app</Heading>
        <Content>
            <ul style={{ listStyle: 'none' }}>
                <li>
                    <Link>
                        <a
                            href="https://github.com/AdobeDocs/project-firefly/blob/master/README.md#project-firefly-developer-guide"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Adobe Developer App Builder
                        </a>
                    </Link>
                </li>
                <li>
                    <Link>
                        <a
                            href="https://github.com/adobe/aio-sdk#adobeaio-sdk"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Adobe I/O SDK
                        </a>
                    </Link>
                </li>
                <li>
                    <Link>
                        <a
                            href="https://adobedocs.github.io/adobeio-runtime/"
                            target="_blank"
                            rel="noreferrer"
                        >
                            Adobe I/O Runtime
                        </a>
                    </Link>
                </li>
                <li>
                    <Link>
                        <a
                            href="https://react-spectrum.adobe.com/react-spectrum/index.html"
                            target="_blank"
                            rel="noreferrer"
                        >
                            React Spectrum
                        </a>
                    </Link>
                </li>
            </ul>
        </Content>
    </View>
);
