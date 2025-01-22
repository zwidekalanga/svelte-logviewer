declare module 'ansiparse' {
    interface AnsiParseResult {
        text: string;
        foreground?: string;
        background?: string;
    }
    
    export default function ansiparse(str: string): AnsiParseResult[];
} 