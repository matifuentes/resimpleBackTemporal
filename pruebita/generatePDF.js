import fs from "fs";
import { jsPDF } from "jspdf";
import { CONTENIDO } from './ArrayPrueba.js';
import { MontserratRegularbase64 } from './MontserratRegularBase64.js';

// const fontFileContent = fs.readFileSync("C:/Users/DanielCarrasco/Music/resimpleBackTemporal/pruebita/MontserratRegular.ttf");
// const fontBase64 = fontFileContent.toString("base64");
// doc.addFileToVFS("MontserratRegular.woff", fontBase64);
// doc.addFont("MontserratRegular.woff", "MontserratRegular");
// doc.setFont("MontserratRegular");

function generatePDF(PDF_data) {
  const doc = new jsPDF({
    orientation: "p",
    unit: "pt",
    format: "letter"
  });

  // Se agrega la fuente que se utilizara
  doc.addFileToVFS("MontserratRegular.ttf", MontserratRegularbase64);
  doc.addFont("MontserratRegular.ttf", "MontserratRegular", "normal");
  doc.setFont("MontserratRegular");


  // Se indican los detalles de la pagina, margin, tamaño tabla, tamaño border, color texto
  const PAGE_WIDTH = doc.internal.pageSize.getWidth();
  const MARGIN_LEFT = 18;
  const MARGIN_RIGHT = 18;
  const MARGIN_TOP = 30;
  const BORDER_WIDTH = 0.5;
  const TABLE_WIDTH = PAGE_WIDTH - (MARGIN_LEFT + MARGIN_RIGHT);
  const fontSize_PDF = 10;
  doc.setTextColor(0, 0, 0);

  let currentY = MARGIN_TOP; // varible que indica donde se genera el elemento (box, texto) en el eje Y


  const tableHeader1 = (title, fontSize, boxHeight) => {
    doc.setFillColor(220, 220, 220);
    doc.rect(MARGIN_LEFT, currentY, TABLE_WIDTH, boxHeight, "F");

    const textWidth = doc.getStringUnitWidth(title) * fontSize;
    const textAlign = MARGIN_LEFT + (TABLE_WIDTH - textWidth) / 2; //textAlign -> Center
    const centerTextVertically = currentY + (boxHeight / 2) + 4; // posicionar texto en eje Y, dentro de box
    doc.setFontSize(fontSize);
    doc.text(title, textAlign, centerTextVertically);
  }

  const tableHeader2 = (array_titles, fontSize, numberOfColumns, sizeBoxes, boxHeight) => {
    let boxPositionOn_X = MARGIN_LEFT;
    const centerTextVertically = currentY + (boxHeight / 2) + 3;

    doc.setFontSize(fontSize);

    for (let i = 0; i < numberOfColumns; i++) {
      doc.setFillColor(220, 220, 220);
      doc.rect(boxPositionOn_X, currentY, sizeBoxes[i], boxHeight, "F");

      const textWidth = doc.getStringUnitWidth(array_titles[i]) * fontSize;
      const textAlign = ((sizeBoxes[i] - textWidth) / 2 + boxPositionOn_X) //textAlign -> Center
      doc.text(array_titles[i], textAlign, centerTextVertically);

      boxPositionOn_X += sizeBoxes[i] + BORDER_WIDTH;
    }
  }

  const tableHeader3 = (array_titles, numberOfColumns, sizeBoxes, boxHeight) => {
    let boxPositionOn_X = MARGIN_LEFT;

    for (let i = 0; i < numberOfColumns; i++) {
      // doc.setFillColor(240, 240, 240);
      doc.setFillColor(220, 220, 220);
      doc.rect(boxPositionOn_X, currentY, sizeBoxes[i], boxHeight, "F");

      const isMultipleLines = array_titles[i].length > 1;
      let centerTextVertically = currentY + (boxHeight / 2) + (isMultipleLines ? -1.2 : 3);

      for (const [text, fontSize] of array_titles[i]) {
        doc.setFontSize(fontSize);
        const textWidth = doc.getStringUnitWidth(text) * fontSize;
        const textAlign = ((sizeBoxes[i] - textWidth) / 2 + boxPositionOn_X) //textAlign -> Center

        doc.text(text, textAlign, centerTextVertically);
        centerTextVertically += doc.getTextDimensions(text).h + 0.5;
      }

      boxPositionOn_X += sizeBoxes[i] + BORDER_WIDTH;
    }
  }

  const tableBody = (data, fontSize, numberOfColumns, sizeBoxes, boxHeight) => {
    doc.setFontSize(fontSize);

    for (const row of data) {
      const {
        nameSubCategory,
        nameClassificationMaterial,
        nameMaterial,
        priceNotDangerous,
        tonNotDangerous,
        priceDangerous,
        tonDangerous,
      } = row;

      const columnTexts = [
        nameSubCategory,
        nameClassificationMaterial,
        nameMaterial,
        priceNotDangerous.toString(),
        tonNotDangerous.toString(),
        (priceNotDangerous * tonNotDangerous).toFixed(2), // Total
        priceDangerous.toString(),
        tonDangerous.toString(),
        (priceDangerous * tonDangerous).toFixed(2), // Total,
      ];

      let boxPositionOn_X = MARGIN_LEFT;

      // TODO refactor
      for (let i = 0; i < numberOfColumns; i++) {
        doc.setFillColor(236, 240, 241)
        doc.rect(boxPositionOn_X, currentY, sizeBoxes[i], boxHeight, "F");

        const centerTextVertically = currentY + (boxHeight / 2);

        if (i == 0) {
          const splitText = doc.splitTextToSize(columnTexts[i], sizeBoxes[i]);
          const isMultipleLines = splitText.length > 1;
          const textWidth = doc.getStringUnitWidth(columnTexts[i]) * fontSize;
          const textAlign = isMultipleLines ? boxPositionOn_X : ((sizeBoxes[i] - textWidth) / 2 + boxPositionOn_X)
          doc.text(splitText, textAlign, (isMultipleLines ? centerTextVertically - 1.2 : centerTextVertically + 2)) //textAlign -> Left

          // const textWidth = doc.getStringUnitWidth(columnTexts[i]) * fontSize;
          // const textAlign = ((sizeBoxes[i] - textWidth) / 2 + boxPositionOn_X) //textAlign -> Center
          // doc.text(columnTexts[i], textAlign, centerTextVertically + 2);

        } else if (i == 2) {
          const splitText = doc.splitTextToSize(columnTexts[i], (sizeBoxes[i] - 10));
          const isMultipleLines = splitText.length > 1;
          doc.text(splitText, boxPositionOn_X + 5, (isMultipleLines ? centerTextVertically - 1.2 : centerTextVertically + 2)); //textAlign -> Left

        } else {
          const textWidth = doc.getStringUnitWidth(columnTexts[i]) * fontSize;
          const textAlign = ((sizeBoxes[i] - textWidth) / 2 + boxPositionOn_X) //textAlign -> Center
          doc.text(columnTexts[i], textAlign, centerTextVertically + 2);
        }

        boxPositionOn_X += sizeBoxes[i] + BORDER_WIDTH;
      }

      currentY += boxHeight + BORDER_WIDTH;
    }
  }

  const CertificateHeader = (id, rut, type, currentDate) => {
    doc.setFontSize(fontSize_PDF);

    // ----- Fecha -----
    const day = currentDate.getDate();
    const month = currentDate.toLocaleString('default', { month: 'long' });
    const year = currentDate.getFullYear();
    const date = `Santiago, ${day.toString().padStart(2, "0")} de ${month} de ${year}`; // 'Santiago, xx de xxx de 2023'

    const date_textWidth = doc.getStringUnitWidth(date) * fontSize_PDF;
    const date_text_X = PAGE_WIDTH - MARGIN_RIGHT - date_textWidth;
    doc.text(date, date_text_X, currentY);
    currentY += 15;

    // ----- Dirigido a -----
    doc.text("Señor", MARGIN_LEFT, currentY);
    currentY += 12;
    doc.text("Productor", MARGIN_LEFT, currentY);
    currentY += 12;
    doc.text(`RUT: ${rut}`, MARGIN_LEFT, currentY);
    currentY += 12;
    doc.text(`ID: ${id}`, MARGIN_LEFT, currentY);
    currentY += 12;

    // doc.setFont("MontserratRegular", "bold");
    // doc.setFontStyle("underline");
    doc.text("Presente", MARGIN_LEFT, currentY);
    currentY += 20;

    // ----- Certificate Title -----
    const certificateTitle = "CERTIFICADO DECLARACIÓN";
    const certificateTitle_textWidth = doc.getStringUnitWidth(certificateTitle) * fontSize_PDF;
    const certificateTitle_text_X = (PAGE_WIDTH - certificateTitle_textWidth) / 2;

    doc.text(certificateTitle, certificateTitle_text_X, currentY);
    currentY += 20;


    // ----- Body of the Certificate -----

    doc.text("Estimado Productor:", MARGIN_LEFT, currentY);
    currentY += 20;

    const bodyText = `Certifico recepción de información declarada para el proceso ${type.toUpperCase()} DE LINEA BASE año 2023, dando cumplimiento a la cláusula Quinta del contrato de Resimple y al decreto supremo N°12 para el producto prioritario de envases y embalajes, donde se indican los plazos, metas y obligaciones.`;
    const splitText = doc.splitTextToSize(bodyText, (PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT));
    doc.text(splitText, MARGIN_LEFT, currentY);
    currentY += 45;
  }

  const CertificateFooter = () => {
    doc.setFontSize(fontSize_PDF);

    doc.text("Atentamente,", MARGIN_LEFT, currentY);
    currentY += 12;
    doc.text("Nathalia Silva", MARGIN_LEFT, currentY);
    currentY += 12;
    doc.text("Gerenta Economía Circular", MARGIN_LEFT, currentY);
    currentY += 12;
    doc.text("ReSimple", MARGIN_LEFT, currentY);
    currentY += 12;
  }

  const createTable = (type, title, data) => {
    // ----- Table Header 1 -----
    const header1_fontSize = 11;
    const header1_boxHeight = 21;
    tableHeader1(title, header1_fontSize, header1_boxHeight);
    currentY += header1_boxHeight + BORDER_WIDTH;

    // ----- Table  Header 2 -----
    const header2_fontSize = 7;
    const header2_boxHeight = 19;
    const header2_numberOfColumns = 3;
    const header2_widthTableMinusBorders = TABLE_WIDTH - ((header2_numberOfColumns - 1) * BORDER_WIDTH);
    const header2_sizeBoxes = [
      header2_widthTableMinusBorders * 0.52,
      header2_widthTableMinusBorders * 0.24,
      header2_widthTableMinusBorders * 0.24
    ];

    tableHeader2(["Material", "No Peligroso", "Peligroso"], header2_fontSize, header2_numberOfColumns, header2_sizeBoxes, header2_boxHeight);
    currentY += header2_boxHeight + BORDER_WIDTH;

    // ----- Table Header 3 -----
    const header3_boxHeight = 19;
    const header3_numberOfColumns = 9;
    const header3_widthTableMinusBorders = TABLE_WIDTH - ((header3_numberOfColumns - 1) * BORDER_WIDTH);
    const header3_sizeBoxes = [
      header3_widthTableMinusBorders * 0.1,
      header3_widthTableMinusBorders * 0.1,
      header3_widthTableMinusBorders * 0.32,
      header3_widthTableMinusBorders * 0.08,
      header3_widthTableMinusBorders * 0.08,
      header3_widthTableMinusBorders * 0.08,
      header3_widthTableMinusBorders * 0.08,
      header3_widthTableMinusBorders * 0.08,
      header3_widthTableMinusBorders * 0.08
    ];
    // [text, sizeText]
    const header3_arrayTitles = [
      [["Subcategoría", 7]],
      [["Clasificación", 7], ["Materiales", 7]],
      [["Materiales", 7]],
      [["Cantidad", 7], ["(Toneladas)", 6]],
      [["Tarifa", 7], ["(UF)", 6]],
      [["Total", 7], ["(UF)", 6]],
      [["Cantidad", 7], ["(Toneladas)", 6]],
      [["Tarifa", 7], ["(UF)", 6]],
      [["Total", 7], ["(UF)", 6]],
    ];

    tableHeader3(header3_arrayTitles, header3_numberOfColumns, header3_sizeBoxes, header3_boxHeight)
    currentY += header3_boxHeight + BORDER_WIDTH;


    // ----- Table body -----
    const body_fontSize = 5;
    const body_numberOfColumns = 9;
    // const body_boxHeight = 20;
    const body_boxHeight = 15;
    const body_widthTableMinusBorders = TABLE_WIDTH - ((body_numberOfColumns - 1) * BORDER_WIDTH);
    const body_sizeBoxes = [
      body_widthTableMinusBorders * 0.1,
      body_widthTableMinusBorders * 0.1,
      body_widthTableMinusBorders * 0.32,
      body_widthTableMinusBorders * 0.08,
      body_widthTableMinusBorders * 0.08,
      body_widthTableMinusBorders * 0.08,
      body_widthTableMinusBorders * 0.08,
      body_widthTableMinusBorders * 0.08,
      body_widthTableMinusBorders * 0.08
    ];

    tableBody(data, body_fontSize, body_numberOfColumns, body_sizeBoxes, body_boxHeight);
    currentY += 40;
  }

  // ----------------------------- Certificate PDF creation -----------------------------

  const currentDate = new Date();
  CertificateHeader('64a30e37b945e1778bbfdb8f', PDF_data.rutManager, PDF_data.registerType, currentDate)
  createTable(PDF_data.registerType, 'Categoría Domiciliaria', PDF_data.domiciliary)
  CertificateFooter()


  
  // --------------- Write File ---------------
  const day = currentDate.getDate().toString().padStart(2, "0");
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const year = currentDate.getFullYear();
  const hours = currentDate.getHours().toString().padStart(2, "0");
  const minutes = currentDate.getMinutes().toString().padStart(2, "0");
  const seconds = currentDate.getSeconds().toString().padStart(2, "0");

  const formattedDate = `${day}${month}${year}${hours}${minutes}${seconds}`;
  // ID / Rut / Tipo documento / Fecha
  const nameFile = `${'IDCompany'}-${PDF_data.rutManager.replace(/[.-]/g, '')}-${PDF_data.registerType.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()}-${formattedDate}`
  // const filePath = `./pdfs/${nameFile}.pdf`;
  const filePath = `./pdfs/certificado.pdf`;

  fs.writeFile(filePath, doc.output(), function (error) {
    if (error) {
      console.error("Error al guardar el archivo:", error);
    } else {
      console.log("El archivo se ha guardado correctamente en:", filePath);
    }
  });
}

generatePDF(CONTENIDO);
