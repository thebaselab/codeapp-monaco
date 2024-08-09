import * as monaco from "monaco-editor";

export namespace CodeStorage {
  export let editor: monaco.editor.IStandaloneCodeEditor | undefined =
    undefined;
  export let diffEditor: monaco.editor.IStandaloneDiffEditor | undefined =
    undefined;
  export let customDarkTheme: any | undefined = undefined;
  export let customLightTheme: any | undefined = undefined;
  export let languageClientWebSocket: WebSocket | undefined = undefined;
}
