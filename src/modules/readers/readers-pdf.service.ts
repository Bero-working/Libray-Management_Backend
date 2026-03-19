import PDFDocument from 'pdfkit';
import { Injectable } from '@nestjs/common';

export type ReaderCardPayload = {
  code: string;
  fullName: string;
  className: string;
  status: string;
};

@Injectable()
export class ReadersPdfService {
  async generateCard(reader: ReaderCardPayload): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A7', margin: 20 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => {
        chunks.push(chunk);
      });

      doc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on('error', (error: unknown) => {
        if (error instanceof Error) {
          reject(error);
        } else {
          reject(new Error('Failed to generate library card PDF'));
        }
      });

      doc.fontSize(14).text('Library Card', { align: 'center' }).moveDown();

      doc.fontSize(10);
      doc.text(`Mã độc giả: ${reader.code}`);
      doc.text(`Họ tên: ${reader.fullName}`);
      doc.text(`Lớp: ${reader.className}`);
      doc.text(`Trạng thái: ${reader.status}`);

      doc.end();
    });
  }
}
