const pdfKit = require('pdfkit');
const fs = require('fs');

function createPdf() {
try {
let fontNormal = 'Helvetica';
let fontBold = 'Helvetica-Bold'
let pdfDoc = new pdfKit();
let fileName = 'sample.pdf';
let image1 = '1.png';
let image2 = '2.png';
let sampleText = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";
let stream = fs.createWriteStream(fileName);
pdfDoc.pipe(stream);
//pdfDoc.text("Node.js PDF document creation with PDFKit library", 5, 5);
//pdfDoc.rect(5, 20, 550, 100).stroke("#ff0000");

pdfDoc.font(fontBold).text("Cool Title", {continued:true ,align:'center'});
pdfDoc.font(fontNormal)
pdfDoc.text('\n\n\n');

pdfDoc.text(sampleText+'\n\n\n');
pdfDoc.image(image1,{ width: 150, height: 150, align: "center" });
pdfDoc.text('\n\n\n');

pdfDoc.addPage();
//pdfDoc.text("Node.js PDF document creation with PDFKit library", 5, 5);
pdfDoc.text(sampleText+'\n\n\n');
pdfDoc.image(image2,{ width: 150, height: 150, align: "center" });
pdfDoc.text('\n\n\n');

pdfDoc.end();
console.log("pdf generate successfully");
} catch (error) {
console.log("Error occurred", error);
}
}

createPdf();