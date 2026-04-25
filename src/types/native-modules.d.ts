declare module 'react-native-html-to-pdf' {
  interface Options {
    html: string;
    fileName: string;
    base64?: boolean;
    directory?: string;
    height?: number;
    width?: number;
    paddingLeft?: number;
    paddingRight?: number;
    paddingTop?: number;
    paddingBottom?: number;
  }
  interface Result {
    filePath?: string;
    base64?: string;
  }
  const RNHTMLtoPDF: { convert: (options: Options) => Promise<Result> };
  export default RNHTMLtoPDF;
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
