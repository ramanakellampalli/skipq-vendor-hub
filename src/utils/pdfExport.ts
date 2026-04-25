import { Alert, Platform } from 'react-native';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Share from 'react-native-share';

export async function generateAndSharePdf(html: string, filename: string): Promise<void> {
  const result = await RNHTMLtoPDF.convert({
    html,
    fileName: filename,
    base64: false,
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
    paddingBottom: 0,
  });

  if (!result.filePath) {
    Alert.alert('Export Failed', 'Could not generate the PDF. Please try again.');
    return;
  }

  const url = Platform.OS === 'android' ? `file://${result.filePath}` : result.filePath;

  await Share.open({ url, type: 'application/pdf', title: filename, failOnCancel: false });
}
