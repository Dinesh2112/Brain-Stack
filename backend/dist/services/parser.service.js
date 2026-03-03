"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parserService = exports.ParserService = void 0;
const pdf2json_1 = __importDefault(require("pdf2json"));
const mammoth_1 = __importDefault(require("mammoth"));
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
class ParserService {
    async parsePDF(buffer) {
        return new Promise((resolve, reject) => {
            const pdfParser = new pdf2json_1.default();
            pdfParser.on("pdfParser_dataError", (errData) => reject(new Error(errData.parserError)));
            pdfParser.on("pdfParser_dataReady", (pdfData) => {
                const text = pdfData.formImage.Pages.map((page) => page.Texts.map((textObj) => decodeURIComponent(textObj.R[0].T)).join(' ')).join('\n');
                resolve(text);
            });
            pdfParser.parseBuffer(buffer);
        });
    }
    async parseWord(buffer) {
        const data = await mammoth_1.default.extractRawText({ buffer });
        return data.value;
    }
    async parseWebsite(url) {
        const { data } = await axios_1.default.get(url);
        const $ = cheerio.load(data);
        // Clean up content: remove ads, navbars, scripts, footers
        $('script, style, nav, header, footer, noscript, iframe').remove();
        let text = $('main').text() || $('article').text() || $('body').text();
        // basic cleaning
        text = text.replace(/\s\s+/g, ' ').trim();
        return text;
    }
}
exports.ParserService = ParserService;
exports.parserService = new ParserService();
//# sourceMappingURL=parser.service.js.map