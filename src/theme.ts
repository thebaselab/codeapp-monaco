import { updateUserConfiguration } from '@codingame/monaco-vscode-configuration-service-override';
import { decodeBase64 } from './utilities';

export function setTheme(base64Theme: string) {
    const theme = JSON.parse(decodeBase64(base64Theme));

    updateUserConfiguration(JSON.stringify({
        "workbench.colorCustomizations": theme.colors,
        "editor.tokenColorCustomizations": {
            enabled: true,
            rules: theme.tokenColors
        }
    }));
}

export function changeEditorThemeForColorScheme() {
    if (!customDarkTheme || !customLightTheme) return;

    if (window.matchMedia("(prefers-color-scheme: dark)").matches){
        setTheme(customDarkTheme);
    }else {
        setTheme(customLightTheme);
    }
}