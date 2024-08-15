import { MonacoLanguageClient } from "monaco-languageclient";
import {
  WebSocketMessageReader,
  WebSocketMessageWriter,
  toSocket,
} from "vscode-ws-jsonrpc";
import {
  CloseAction,
  ErrorAction,
  MessageTransports,
} from "vscode-languageclient";
import { CodeStorage } from "./storage";

function languageServerConnectionDidDrop(languageIdentifier: string) {
  (window as any).webkit.messageHandlers.toggleMessageHandler.postMessage({
    Event: "Language Server Connection Dropped",
    languageIdentifier: languageIdentifier,
  });
}

export function isLanguageServiceConnected(): boolean {
  return CodeStorage.languageClientWebSocket?.readyState === WebSocket.OPEN;
}

export function disconnectLanguageServer() {
  CodeStorage.languageClientWebSocket?.close();
}

/** parameterized version , support all languageId */
export const connectMonacoToLanguageServer = (
  url: string,
  args: [string],
  pwdBookmark: string,
  languageIdentifier: string
): WebSocket => {
  const webSocket = new WebSocket(url);
  CodeStorage.languageClientWebSocket = webSocket;

  webSocket.onopen = async () => {
    webSocket.send(
      JSON.stringify({
        args: args,
        redirectStderr: false,
        workingDirectoryBookmark: pwdBookmark,
        isLanguageService: true,
      })
    );
    // quick hack: wait for the server to start (5 seconds)
    await new Promise((resolve) => setTimeout(resolve, 5000));

    const socket = toSocket(webSocket);
    const reader = new WebSocketMessageReader(socket);
    const writer = new WebSocketMessageWriter(socket);
    const languageClient = createLanguageClient(
      {
        reader,
        writer,
      },
      languageIdentifier
    );
    languageClient.start();
    reader.onClose(() => {
      languageServerConnectionDidDrop(languageIdentifier);
      languageClient.stop();
    });
  };
  return webSocket;
};

const createLanguageClient = (
  transports: MessageTransports,
  languageIdentifier: string
): MonacoLanguageClient => {
  return new MonacoLanguageClient({
    name: "Sample Language Client",
    clientOptions: {
      // use a language id as a document selector
      documentSelector: [languageIdentifier],
      // disable the default error handler
      errorHandler: {
        error: () => ({ action: ErrorAction.Continue }),
        closed: () => ({ action: CloseAction.DoNotRestart }),
      },
    },
    // create a language client connection from the JSON RPC connection on demand
    connectionProvider: {
      get: () => {
        return Promise.resolve(transports);
      },
    },
  });
};
