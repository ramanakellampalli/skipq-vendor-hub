import RNPrint from 'react-native-print';

export async function generateAndSharePdf(html: string, _filename: string): Promise<void> {
  await RNPrint.print({ html });
}
