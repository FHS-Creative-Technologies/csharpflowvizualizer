import { create } from 'zustand';
import type { BaseInfo } from '../../types';
import { parseRoslynData } from '../lib/parsing-helper';
import type { ExtensionToWebviewMessage, HighlightLinePayload, WebviewToExtensionMessage } from '../../../src/messages';

declare const acquireVsCodeApi: () => unknown;

export interface VsCodeApi {
    postMessage(message: WebviewToExtensionMessage): void;
}


interface RoslynState {
    response: string;
    loading: boolean;
    data: BaseInfo[] | null;
    activeLine: number | null;
    highlightedRange: HighlightLinePayload | null;
    vscodeApi: VsCodeApi | null;
    initializeVsCodeApi: () => void;
    setupMessageListener: () => (() => void);
    sendMessage: (message: WebviewToExtensionMessage) => void;
    setResponse: (r: string) => void;
    setLoading: (l: boolean) => void;
    setData: (d: BaseInfo[] | null) => void;
}

export const useRoslynStore = create<RoslynState>((set, get) => ({
    response: 'No response yet',
    loading: false,
    data: null,
    activeLine: null,
    highlightedRange: null,
    vscodeApi: null,

    setResponse: (r: string) => set({ response: r }),
    setLoading: (l: boolean) => set({ loading: l }),
    setData: (d: BaseInfo[] | null) => set({ data: d }),

    initializeVsCodeApi: () => {
        try {
            const api = acquireVsCodeApi() as VsCodeApi;
            set({ vscodeApi: api });
            console.log('VS Code API initialized (store)');
        } catch (error) {
            console.error('Failed to initialize VS Code API (store):', error);
        }
    },

    setupMessageListener: () => {
        const handleMessage = (event: MessageEvent<ExtensionToWebviewMessage>) => {
            try {
                const message = event.data;
                const command = message.command;
                console.log('Message from extension (store):', message.command);

                switch (command) {
                    case 'roslynAnalysis':
                        {
                            const parsed = parseRoslynData(message.data);
                            set({ response: "Data received", loading: false, data: parsed });
                            break;
                        }
                    case 'lineSelectionChanged':
                        {
                            const line = message.data;
                            set({ response: `Line selection changed: ${line}`, loading: false, activeLine: line });
                            break;
                        }
                    case 'highlightedLinesChanged':
                        {
                            set({ response: message.data ? `Highlighted lines: ${message.data.startLine}-${message.data.endLine}` : 'Highlight cleared', loading: false, highlightedRange: message.data });
                            break;
                        }
                    case 'analysisError':
                        {
                            set({ response: message.text, loading: false });
                            break;
                        }
                    default:
                        console.warn(`Unknown message command (store): ${command}`);
                }
            } catch (error) {
                console.error('✗ Error handling message (store):', error);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    },

    sendMessage: (message: WebviewToExtensionMessage) => {
        try {
            const api = get().vscodeApi;
            if (!api) {
                console.error('VS Code API not initialized (store)');
                set({ response: 'Error: VS Code API not available', loading: false });
                return;
            }

            set({ loading: message.command === 'getFileContent' });
            console.log(`Sending command (store): ${message.command}`);
            api.postMessage(message);
        } catch (error) {
            console.error('Error sending message (store):', error);
            set({ response: 'Error sending message', loading: false });
        }
    },
}));

export default useRoslynStore;
