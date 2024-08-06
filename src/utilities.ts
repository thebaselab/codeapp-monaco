export function decodeBase64(base64: string): string {
    return decodeURIComponent(escape(atob(base64)));
}