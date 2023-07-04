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
  const PAGE_HEIGHT = doc.internal.pageSize.getHeight();
  const MARGIN_LEFT = 18;
  const MARGIN_RIGHT = 18;
  const MARGIN_TOP = 30;
  const BORDER_WIDTH = 0.5;
  const TABLE_WIDTH = PAGE_WIDTH - (MARGIN_LEFT + MARGIN_RIGHT);
  const fontSize_PDF = 10;
  doc.setTextColor(0, 0, 0);

  let currentY = MARGIN_TOP; // varible que indica donde se genera el elemento (box, texto) en el eje Y

  let sumTonNotDangerous = 0;
  let sumTonDangerous = 0;
  let totalTonNotDangerous = 0;
  let totalTonDangerous = 0;

  const formatNumber = (number) => {

    if (isNaN(number)) {
      return number
    }

    const formattedNumber = Number(number).toLocaleString('es-CL');
    return formattedNumber
  }

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

  const tableBody = (registerType, data, fontSize, numberOfColumns, sizeBoxes, boxHeight) => {
    doc.setFontSize(fontSize);

    for (const row of data) {
      const {
        nameSubCategory,
        nameClassificationMaterial,
        nameMaterial,
        tonNotDangerous,
        priceNotDangerous,
        tonDangerous,
        priceDangerous,
      } = row;

      const tonNotDangerous_priceNotDangerous = tonNotDangerous * priceNotDangerous;
      const tonDangerous_priceDangerous = tonNotDangerous * priceNotDangerous;

      let columnTexts = [];
      if ('proyeccion' === registerType || 'correccion proyeccion' === registerType) {
        columnTexts.push(
          nameSubCategory,
          nameClassificationMaterial,
          nameMaterial,
          tonNotDangerous.toString(),
          tonDangerous.toString()
        );
      } else {
        columnTexts.push(
          nameSubCategory,
          nameClassificationMaterial,
          nameMaterial,
          tonNotDangerous.toString(),
          priceNotDangerous.toString(),
          (tonNotDangerous_priceNotDangerous).toFixed(2), // Total
          tonDangerous.toString(),
          priceDangerous.toString(),
          (tonDangerous_priceDangerous).toFixed(2), // Total,
        );
      }


      sumTonNotDangerous += tonNotDangerous;
      sumTonDangerous += tonDangerous;
      totalTonNotDangerous += tonNotDangerous_priceNotDangerous;
      totalTonDangerous += tonDangerous_priceDangerous;


      let boxPositionOn_X = MARGIN_LEFT;

      // TODO refactor
      for (let i = 0; i < numberOfColumns; i++) {
        doc.setFillColor(236, 240, 241)
        doc.rect(boxPositionOn_X, currentY, sizeBoxes[i], boxHeight, "F");

        const centerTextVertically = currentY + (boxHeight / 2);

        if (i == 0) {
          const splitText = doc.splitTextToSize(columnTexts[i], sizeBoxes[i]);
          const isMultipleLines = splitText.length > 1;

          for (let j = 0; j < splitText.length; j++) {
            const textWidth = doc.getStringUnitWidth(splitText[j]) * fontSize;
            doc.text(splitText[j], ((sizeBoxes[i] - textWidth) / 2 + boxPositionOn_X), (isMultipleLines ? centerTextVertically + j * 5 : centerTextVertically + 2))
          }

        } else if (i == 2) {
          const splitText = doc.splitTextToSize(columnTexts[i], (sizeBoxes[i] - 10));
          const isMultipleLines = splitText.length > 1;
          doc.text(splitText, boxPositionOn_X + 5, (isMultipleLines ? centerTextVertically - 1.2 : centerTextVertically + 2)); //textAlign -> Left

        } else if (i == 1) {
          const textWidth = doc.getStringUnitWidth(columnTexts[i]) * fontSize;
          const textAlign = ((sizeBoxes[i] - textWidth) / 2 + boxPositionOn_X) //textAlign -> Center
          doc.text(columnTexts[i], textAlign, centerTextVertically + 2);
        } else if (i >= 3) {
          const textWidth = doc.getStringUnitWidth(columnTexts[i]) * fontSize;
          const textAlign = ((sizeBoxes[i] - textWidth) / 2 + boxPositionOn_X) //textAlign -> Center
          doc.text(formatNumber(columnTexts[i]), textAlign, centerTextVertically + 2);
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

  const rowTableTotal = (numberOfColumns, withBoxes, data) => {

    const fontSize = 5;
    const boxHeight = 15;
    const widthRowTableTotalMinusBorders = TABLE_WIDTH - ((numberOfColumns - 1) * BORDER_WIDTH);
    const sizeBoxesData = widthRowTableTotalMinusBorders * withBoxes;

    let boxPositionOn_X = (widthRowTableTotalMinusBorders + MARGIN_LEFT) - (sizeBoxesData * numberOfColumns);
    const centerTextVertically = currentY + (boxHeight / 2);

    doc.setFontSize(fontSize);

    const boxTitleWith = 70;
    const TitleBoxPositionOn_X = boxPositionOn_X - boxTitleWith - BORDER_WIDTH;
    const title = 'Totales';
    doc.setFillColor(220, 220, 220);
    doc.rect(TitleBoxPositionOn_X, currentY, boxTitleWith, boxHeight, "F");

    const textWidth = doc.getStringUnitWidth(title) * fontSize;
    const textAlign = ((boxTitleWith - textWidth) / 2 + TitleBoxPositionOn_X) //textAlign -> Center
    doc.text(title, textAlign, centerTextVertically + 2);

    for (let i = 0; i < numberOfColumns; i++) {
      doc.setFillColor(220, 220, 220);
      doc.rect(boxPositionOn_X, currentY, sizeBoxesData, boxHeight, "F");

      const textWidth = doc.getStringUnitWidth(data[i].toString()) * fontSize;
      const textAlign = ((sizeBoxesData - textWidth) / 2 + boxPositionOn_X) //textAlign -> Center
      doc.text(formatNumber(data[i]), textAlign, centerTextVertically + 2);

      boxPositionOn_X += sizeBoxesData + BORDER_WIDTH;
    }
  }

  const createTable = (type, title, data) => {
    const isProjection = 'proyeccion' === type || 'correccion proyeccion' === type;

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

    // [text, sizeText]
    let contentBoxes_arrayTitles = [];

    if (isProjection) {
      contentBoxes_arrayTitles.push(
        [["Subcategoría", 7]],
        [["Clasificación", 7], ["Materiales", 7]],
        [["Materiales", 7]],
        [["Cantidad", 7], ["(Toneladas)", 6]],
        [["Cantidad", 7], ["(Toneladas)", 6]]
      )
    } else {
      contentBoxes_arrayTitles.push(
        [["Subcategoría", 7]],
        [["Clasificación", 7], ["Materiales", 7]],
        [["Materiales", 7]],
        [["Cantidad", 7], ["(Toneladas)", 6]],
        [["Tarifa", 7], ["(UF)", 6]],
        [["Total", 7], ["(UF)", 6]],
        [["Cantidad", 7], ["(Toneladas)", 6]],
        [["Tarifa", 7], ["(UF)", 6]],
        [["Total", 7], ["(UF)", 6]]
      )
    }
    const header3_boxHeight = 19;
    const contentBoxes_numberOfColumns = contentBoxes_arrayTitles.length;
    const contentBoxes_widthTableMinusBorders = TABLE_WIDTH - ((contentBoxes_numberOfColumns - 1) * BORDER_WIDTH);

    let contentSizeBoxes = [];

    if (isProjection) {
      contentSizeBoxes.push(
        contentBoxes_widthTableMinusBorders * 0.1,
        contentBoxes_widthTableMinusBorders * 0.1,
        contentBoxes_widthTableMinusBorders * 0.32,
        contentBoxes_widthTableMinusBorders * 0.24,
        contentBoxes_widthTableMinusBorders * 0.24,
      )
    } else {
      contentSizeBoxes.push(
        contentBoxes_widthTableMinusBorders * 0.1,
        contentBoxes_widthTableMinusBorders * 0.1,
        contentBoxes_widthTableMinusBorders * 0.32,
        contentBoxes_widthTableMinusBorders * 0.08,
        contentBoxes_widthTableMinusBorders * 0.08,
        contentBoxes_widthTableMinusBorders * 0.08,
        contentBoxes_widthTableMinusBorders * 0.08,
        contentBoxes_widthTableMinusBorders * 0.08,
        contentBoxes_widthTableMinusBorders * 0.08
      )
    }

    tableHeader3(contentBoxes_arrayTitles, contentBoxes_numberOfColumns, contentSizeBoxes, header3_boxHeight)
    currentY += header3_boxHeight + BORDER_WIDTH;


    // ----- Table body -----
    const body_fontSize = 5;
    const body_boxHeight = 15;

    tableBody(registerType, data, body_fontSize, contentBoxes_numberOfColumns, contentSizeBoxes, body_boxHeight);

    const rowTotal = isProjection ? [totalTonNotDangerous.toFixed(2), totalTonDangerous.toFixed(2)] : [sumTonNotDangerous.toFixed(2), '-', totalTonNotDangerous.toFixed(2), sumTonDangerous.toFixed(2), '-', totalTonDangerous.toFixed(2)]
    rowTableTotal((isProjection ? 2 : 6), (isProjection ? 0.24 : 0.08), rowTotal)
  }

  const tableTotal = (data) => {
    const fontSize = 9;
    doc.setFontSize(fontSize);

    const boxHeight = 21;
    const boxWidth = 125;
    const boxPositionOn_X = MARGIN_LEFT;

    for (let i = 0; i < data.length; i++) {
      // -- First Box --
      doc.setFillColor(220, 220, 220);
      doc.rect(boxPositionOn_X, currentY, boxWidth, boxHeight, "F");

      let textWidth = doc.getStringUnitWidth(data[i][0]) * fontSize;
      let textAlign = ((boxWidth - textWidth) / 2 + boxPositionOn_X) // textAlign -> Center
      const centerTextVertically = currentY + (boxHeight / 2) + 3;
      doc.text(data[i][0], textAlign, centerTextVertically);

      // -- Second Box --
      doc.setFillColor(236, 240, 241)
      doc.rect((boxPositionOn_X + boxWidth + BORDER_WIDTH), currentY, boxWidth, boxHeight, "F");

      textWidth = doc.getStringUnitWidth(data[i][1]) * fontSize;
      textAlign = ((boxWidth - textWidth) / 2 + (boxPositionOn_X + boxWidth + BORDER_WIDTH)) // textAlign -> Center
      doc.text(formatNumber(data[i][1]), textAlign, centerTextVertically);

      currentY += boxHeight + BORDER_WIDTH;
    }
  }

  const paymentMethodsTable = (numberInstallments, date = 'xx-xx-xxxx', totalAmount) => {

    // -- Header 1 Table --
    const header1_fontSize = 11;
    const header1_boxHeight = 21;
    tableHeader1('Forma de Pago', header1_fontSize, header1_boxHeight);
    currentY += header1_boxHeight + BORDER_WIDTH;

    const header2_fontSize = 7;
    const header2_boxHeight = 19;
    const header2_numberOfColumns = 3;
    const header2_widthTableMinusBorders = TABLE_WIDTH - ((header2_numberOfColumns - 1) * BORDER_WIDTH);

    const sizeBoxes = header2_widthTableMinusBorders / header2_numberOfColumns;
    const header2_sizeBoxes = [
      sizeBoxes,
      sizeBoxes,
      sizeBoxes
    ];

    // -- Header 2 Table --
    tableHeader2(["N° Cuotas", "Fecha", "Total (UF)"], header2_fontSize, header2_numberOfColumns, header2_sizeBoxes, header2_boxHeight);
    currentY += header2_boxHeight + BORDER_WIDTH;


    // -- Body Table --
    const fontSize = 7;
    const body_boxHeight = 19;
    const numberOfColumns = 3;


    doc.setFontSize(fontSize);

    const paymentsArray = [];
    // Calcula el monto a pagar en cada cuota
    const amountPerInstallment = totalAmount / numberInstallments;

    // Crea el array con los datos de cada cuota
    for (let i = 1; i <= numberInstallments; i++) {
      const date = 'fecha Desconocida';
      const total = amountPerInstallment.toFixed(2);

      const cuotaData = [i, date, total];
      paymentsArray.push(cuotaData);
    }

    for (const row of paymentsArray) {
      let boxPositionOn_X = MARGIN_LEFT;
      const centerTextVertically = currentY + (body_boxHeight / 2) + 3;

      for (let j = 0; j < numberOfColumns; j++) {
        doc.setFillColor(236, 240, 241)
        doc.rect(boxPositionOn_X, currentY, header2_sizeBoxes[j], body_boxHeight, "F");

        const textWidth = doc.getStringUnitWidth(row[j].toString()) * fontSize;
        const textAlign = ((header2_sizeBoxes[j] - textWidth) / 2 + boxPositionOn_X) //textAlign -> Center
        doc.text(row[j].toString(), textAlign, centerTextVertically);
        boxPositionOn_X += header2_sizeBoxes[j] + BORDER_WIDTH;
      }

      currentY += body_boxHeight + BORDER_WIDTH;
    }
  }

  // ----------------------------- Certificate PDF creation -----------------------------

  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, "0");
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const year = currentDate.getFullYear();
  const hours = currentDate.getHours().toString().padStart(2, "0");
  const minutes = currentDate.getMinutes().toString().padStart(2, "0");
  const seconds = currentDate.getSeconds().toString().padStart(2, "0");

  const registerType = PDF_data.registerType.normalize("NFD").replaceAll(/[\u0300-\u036f]/g, "").toLowerCase()


  CertificateHeader('64a30e37b945e1778bbfdb8f', PDF_data.rutManager, PDF_data.registerType, currentDate)
  currentY += 40;

  createTable(registerType, 'Categoría Domiciliaria', PDF_data.domiciliary)

  doc.addPage(); // Se crea nueva pagina
  currentY = MARGIN_TOP; // Se reinicia currentY

  createTable(registerType, 'Categoría No Domiciliaria', PDF_data.noDomiciliary)
  currentY += 15;


  if ('real' === registerType || 'real proyeccion' === registerType) {
    doc.addPage(); // Se crea nueva pagina
    currentY = MARGIN_TOP + 20; // Se reinicia currentY

    // -- Title page 2 --
    const fontSizeTitle = 15;
    const titlePage2 = 'Resumen de Declaración'
    doc.setFontSize(fontSizeTitle);
    const textWidth = doc.getStringUnitWidth(titlePage2) * fontSizeTitle;
    const textAlign = (PAGE_WIDTH - textWidth) / 2; //textAlign -> Center
    doc.text(titlePage2, textAlign, currentY);

    currentY += 50;

    tableTotal([
      ['Total Domiciliaria (UF)', totalTonDangerous.toFixed(2).toString()],
      ['Total No Domiciliaria (UF)', totalTonNotDangerous.toFixed(2).toString()],
      [`Total ${year} (UF)`, (totalTonDangerous + totalTonNotDangerous).toFixed(2).toString()]
    ])

    currentY += 50;
    paymentMethodsTable(4, 'xxx-xxx-xxx', (totalTonDangerous + totalTonNotDangerous).toFixed(2))
  }


  currentY = PAGE_HEIGHT - 80
  CertificateFooter()


  // --------------- Write File ---------------

  const formattedDate = `${day}${month}${year}${hours}${minutes}${seconds}`;
  // ID / Rut / Tipo documento / Fecha
  const nameFile = `${'IDCompany'}-${PDF_data.rutManager.replaceAll(/[.-]/g, '')}-${registerType}-${formattedDate}`
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
