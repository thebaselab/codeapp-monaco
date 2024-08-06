/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as monaco from "monaco-editor";
import { initServices } from "monaco-languageclient/vscode/services";
import getThemeServiceOverride from "@codingame/monaco-vscode-theme-service-override";
import getTextmateServiceOverride from "@codingame/monaco-vscode-textmate-service-override";
import "@codingame/monaco-vscode-theme-defaults-default-extension";
import "@codingame/monaco-vscode-all-language-default-extensions";
import getConfigurationServiceOverride from "@codingame/monaco-vscode-configuration-service-override";
import { useWorkerFactory } from "monaco-editor-wrapper/workerFactory";
import { initWebSocketAndStartClient } from "./languageService";
import { Uri } from "vscode";
import { computeDirtyDiff, invalidateDecorations } from "./diff";
import { IChange } from "vscode/vscode/vs/editor/common/diff/legacyLinesDiffComputer";
import { setTheme } from "./theme";
import {
  onRequestNewTextModel,
  renameModel,
  setModel,
  setValueForModel,
  switchToDiffView,
  switchToNormalView,
} from "./common";

declare global {
  let editor: monaco.editor.IStandaloneCodeEditor | undefined;
  let diffEditor: monaco.editor.IStandaloneDiffEditor | undefined;
  let customDarkTheme: any | undefined;
  let customLightTheme: any | undefined;

  interface Window {
    monaco: typeof monaco;
    editor: monaco.editor.IStandaloneCodeEditor | undefined;

    // common features
    setModel: (base64Url: string) => void;
    onRequestNewTextModel: (base64Url: string, base64Content: string) => void;
    renameModel: (base64OldUrl: string, base64NewUrl: string) => void;
    setValueForModel: (base64Url: string, base64Content: string) => void;
    switchToDiffView: (
      base64OriginalText: string,
      base64ModifiedText: string,
      base64UrlOriginal: string,
      base64UrlModified: string
    ) => void;
    switchToNormalView: () => void;

    // language service
    initWebSocketAndStartClient: (url: string) => WebSocket;

    // diff
    computeDirtyDiff: (
      originalUrl: string,
      modifiedUrl: string,
      ignoreTrimWhitespace: boolean
    ) => Promise<IChange[] | null>;
    invalidateDecorations: () => void;

    // theme
    setTheme: (base64Theme: string) => void;

    // TODO: vim
  }
}

export function installInterface() {
  // Export Monaco Editor to global scope
  window.monaco = monaco;

  // Export Interface to global scope
  window.editor = editor;
  window.setModel = setModel;
  window.onRequestNewTextModel = onRequestNewTextModel;
  window.renameModel = renameModel;
  window.setValueForModel = setValueForModel;
  window.switchToDiffView = switchToDiffView;
  window.switchToNormalView = switchToNormalView;

  window.initWebSocketAndStartClient = initWebSocketAndStartClient;

  window.computeDirtyDiff = computeDirtyDiff;
  window.invalidateDecorations = invalidateDecorations;

  window.setTheme = setTheme;
}

export const configureMonacoWorkers = () => {
  useWorkerFactory({
    ignoreMapping: true,
    workerLoaders: {
      editorWorkerService: () =>
        new Worker(
          new URL(
            "monaco-editor/esm/vs/editor/editor.worker.js",
            import.meta.url
          ),
          { type: "module" }
        ),
    },
  });
};
export const runClient = async () => {
  await initServices({
    serviceConfig: {
      userServices: {
        ...getThemeServiceOverride(),
        ...getTextmateServiceOverride(),
        ...getConfigurationServiceOverride(Uri.file("/workspace")),
      },
      debugLogging: true,
    },
  });

  // create monaco editor
  editor = monaco.editor.create(
    document.getElementById("monaco-editor-root")!,
    {
      automaticLayout: true,
      theme: "vs-dark",
    }
  );
  const model = monaco.editor.createModel(
    "print('Hello, world!')",
    undefined,
    monaco.Uri.parse("file:///main.py")
  );
  editor.setModel(model);

  initWebSocketAndStartClient("ws://localhost:30001/pyright");

  // const testTheme = {
  //     colors: {
  //         'editor.background': '#db3232',
  //     },
  //     tokenColors: []
  // }
  // setTheme(btoa(unescape(encodeURIComponent(JSON.stringify(testTheme)))));
};
