import * as monaco from "monaco-editor";
import { updateUserConfiguration } from "@codingame/monaco-vscode-configuration-service-override";
import { decodeBase64 } from "./utilities";
import { CodeStorage } from "./storage";

function setTheme(theme: any) {
  if (theme.type == "dark") {
    monaco.editor.setTheme("vs-dark");
  } else {
    monaco.editor.setTheme("vs");
  }

  updateUserConfiguration(
    JSON.stringify({
      "workbench.colorCustomizations": theme.colors,
      "editor.tokenColorCustomizations": {
        textMateRules: theme.tokenColors,
      },
    })
  );
}

export function applyBase64AsTheme(base64Theme: string) {
  const theme = JSON.parse(decodeBase64(base64Theme));
  if (theme.type == "dark") {
    CodeStorage.customDarkTheme = theme;
  } else {
    CodeStorage.customLightTheme = theme;
  }
  changeEditorThemeForColorScheme();
}

export function changeEditorThemeForColorScheme() {
  if (!CodeStorage.customDarkTheme || !CodeStorage.customLightTheme) return;

  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    setTheme(CodeStorage.customDarkTheme);
  } else {
    setTheme(CodeStorage.customLightTheme);
  }
}
