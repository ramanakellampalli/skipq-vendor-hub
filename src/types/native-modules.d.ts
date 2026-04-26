declare module 'react-native-print' {
  interface PrintOptions {
    html?: string;
    filePath?: string;
    isLandscape?: boolean;
  }
  const RNPrint: { print: (options: PrintOptions) => Promise<void> };
  export default RNPrint;
}

declare module 'react-native-share' {
  interface ShareOptions {
    url: string;
    type?: string;
    title?: string;
    failOnCancel?: boolean;
  }
  const Share: { open: (options: ShareOptions) => Promise<void> };
  export default Share;
}
