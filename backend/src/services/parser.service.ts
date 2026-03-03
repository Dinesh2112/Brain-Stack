const pdf = require('pdf-parse');
import mammoth from 'mammoth';
import axios from 'axios';
import * as cheerio from 'cheerio';

export class ParserService {
    async parsePDF(buffer: Buffer): Promise<string> {
        const data = await pdf(buffer);
        return data.text;
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
