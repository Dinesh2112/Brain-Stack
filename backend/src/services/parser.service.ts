import PDFParser from 'pdf2json';
import mammoth from 'mammoth';
import axios from 'axios';
import * as cheerio from 'cheerio';

export class ParserService {
    async parsePDF(buffer: Buffer): Promise<string> {
        return new Promise((resolve, reject) => {
            const pdfParser = new PDFParser();

            pdfParser.on("pdfParser_dataError", (errData: any) => reject(new Error(errData.parserError)));
            pdfParser.on("pdfParser_dataReady", (pdfData: any) => {
                const text = pdfData.formImage.Pages.map((page: any) =>
                    page.Texts.map((textObj: any) => decodeURIComponent(textObj.R[0].T)).join(' ')
                ).join('\n');
                resolve(text);
            });

            pdfParser.parseBuffer(buffer);
        });
    }

    async parseWord(buffer: Buffer): Promise<string> {

        const data = await mammoth.extractRawText({ buffer });
        return data.value;
    }

    async parseWebsite(url: string): Promise<string> {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        // Clean up content: remove ads, navbars, scripts, footers
        $('script, style, nav, header, footer, noscript, iframe').remove();

        let text = $('main').text() || $('article').text() || $('body').text();
        // basic cleaning
        text = text.replace(/\s\s+/g, ' ').trim();

        return text;
    }
}

export const parserService = new ParserService();
