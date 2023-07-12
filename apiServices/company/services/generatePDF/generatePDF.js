import fs from "fs";
import path from "path";
import { jsPDF } from "jspdf";
import { MontserratRegularbase64 } from './MontserratRegularBase64.js';
import { generateRandomNamePDF } from '../../utils.js';
import { fileURLToPath } from "url";
import { BlobServiceClient } from '@azure/storage-blob';
import dotenv from 'dotenv';


// TODO: dejar dotenv global para GraphQL
dotenv.config();

// const fontFileContent = fs.readFileSync("C:/Users/DanielCarrasco/Music/resimpleBackTemporal/pruebita/MontserratRegular.ttf");
// const fontBase64 = fontFileContent.toString("base64");
// doc.addFileToVFS("MontserratRegular.woff", fontBase64);
// doc.addFont("MontserratRegular.woff", "MontserratRegular");
// doc.setFont("MontserratRegular");

async function generatePDF(PDF_data) {

  // console.log('PDF DATA', PDF_data)

  const userPassword = PDF_data.rutCompany.replace(/[.-]/g, '').substring(0, 4);

  const doc = new jsPDF({
    orientation: "p",
    unit: "pt",
    format: "letter",
    encryption: {
      userPassword: userPassword,
      ownerPassword: undefined,
      userPermissions: ["print"]
    },
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

  const sumOfRates = {
    noDomiciliary: {
      notDangerous: {
        numberOfTons: 0,
        total: 0
      },
      dangerous: {
        numberOfTons: 0,
        total: 0
      }
    },
    domiciliary: {
      notDangerous: {
        numberOfTons: 0,
        total: 0
      },
      dangerous: {
        numberOfTons: 0,
        total: 0
      }
    }
  }


  const uploadPDFToAzureStorage = async (pdfFilePath, nameFile_blobName) => {

    const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.CONTAINER_NAME;

    const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);

    // Cargar archivo PDF al contenedor
    const blockBlobClient = containerClient.getBlockBlobClient(nameFile_blobName);

    await blockBlobClient.uploadFile(pdfFilePath);
  }

  const formatNumber = (number) => {
    if (isNaN(number)) {
      return number
    }

    return Number(number).toLocaleString('es-CL')
  }

  const createRowTable = (row, boxHeight) => {
    // createRow([
    //    [texto, fontSize, boxWidth, boxBackground],
    //    [otras columnas],
    // ], boxHeight)

    let boxPositionOn_X = MARGIN_LEFT;

    for (const column of row) {
      const [text, fontSize, boxWidth, boxBackground] = column;
      const verticalPositionText = currentY + (boxHeight - fontSize) / 2 + fontSize * 0.9;

      doc.setFillColor(boxBackground[0], boxBackground[1], boxBackground[2]);
      doc.rect(boxPositionOn_X, currentY, boxWidth, boxHeight, "F");

      const textWidth = doc.getStringUnitWidth(text) * fontSize;

      const horizontalPositionText = ((boxWidth - textWidth) / 2) + boxPositionOn_X; //textAlign -> Center

      doc.setFontSize(fontSize);
      doc.text(text, horizontalPositionText, verticalPositionText);

      boxPositionOn_X += boxWidth + BORDER_WIDTH;
    }
  }

  const createRowVariableTextSize = (array_titles, numberOfColumns, boxesWidth, boxHeight, boxBackground) => {
    // createRowVariableTextSize([
    //   [[text, sizeText], [otro texto, otra sizeText]],
    //   [[otroTexto, sizeText], [otro texto, otra sizeText]]
    // ], numero de columnas, array de Width de columnas, boxHeight, boxBackground)

    let boxPositionOn_X = MARGIN_LEFT;

    for (let i = 0; i < numberOfColumns; i++) {
      doc.setFillColor(boxBackground[0], boxBackground[1], boxBackground[2]);
      doc.rect(boxPositionOn_X, currentY, boxesWidth[i], boxHeight, "F");

      const isMultipleLines = array_titles[i].length > 1;
      let nexLine = 0;

      for (const [text, fontSize] of array_titles[i]) {
        const textWidth = doc.getStringUnitWidth(text) * fontSize;
        const horizontalPositionText = ((boxesWidth[i] - textWidth) / 2) + boxPositionOn_X; //textAlign -> Center
        const verticalPositionText = currentY + (boxHeight - fontSize) / 2 + fontSize * (isMultipleLines ? 0.3 : 0.9);

        doc.setFontSize(fontSize);
        doc.text(text, horizontalPositionText, verticalPositionText + nexLine);
        nexLine += doc.getTextDimensions(text).h + 0.5;
      }

      boxPositionOn_X += BORDER_WIDTH + boxesWidth[i];
    }
  }

  const tableBody = (isDomiciliary, isProjection, data, fontSize, numberOfColumns, boxesWidth, boxHeight) => {
    // tableBody(es categoria domiciliaria (true, false), es de tipo proyecion (true, false), registerType, data, fontSize, numberOfColumns, array de Width de columnas, boxHeight)

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
      const tonDangerous_priceDangerous = tonDangerous * priceDangerous;


      if (isDomiciliary) {
        sumOfRates.domiciliary.notDangerous.numberOfTons += tonNotDangerous;
        sumOfRates.domiciliary.notDangerous.total += tonNotDangerous_priceNotDangerous;

        sumOfRates.domiciliary.dangerous.numberOfTons += tonDangerous;
        sumOfRates.domiciliary.dangerous.total += tonDangerous_priceDangerous;

      } else {
        sumOfRates.noDomiciliary.notDangerous.numberOfTons += tonNotDangerous;
        sumOfRates.noDomiciliary.notDangerous.total += tonNotDangerous_priceNotDangerous;

        sumOfRates.noDomiciliary.dangerous.numberOfTons += tonDangerous;
        sumOfRates.noDomiciliary.dangerous.total += tonDangerous_priceDangerous;
      }


      let columnTexts = [];
      if (isProjection) {
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

      let boxPositionOn_X = MARGIN_LEFT;

      for (let i = 0; i < numberOfColumns; i++) {
        doc.setFillColor(236, 240, 241)
        doc.rect(boxPositionOn_X, currentY, boxesWidth[i], boxHeight, "F");

        // TODO: refactorizar
        if (i == 0) {
          const splitText = doc.splitTextToSize(columnTexts[i], boxesWidth[i]);
          const isMultipleLines = splitText.length > 1;
          const verticalPositionText = currentY + (boxHeight - fontSize) / 2 + fontSize * (isMultipleLines ? 0.3 : 0.9);

          let nexLine = 0;

          for (let j = 0; j < splitText.length; j++) {
            const textWidth = doc.getStringUnitWidth(splitText[j]) * fontSize;
            const horizontalPositionText = ((boxesWidth[i] - textWidth) / 2) + boxPositionOn_X; //textAlign -> Center
            doc.text(splitText[j], horizontalPositionText, verticalPositionText + nexLine);

            nexLine += doc.getTextDimensions(splitText[j]).h + 0.5;
          }

        } else if (i == 1) {
          const textWidth = doc.getStringUnitWidth(columnTexts[i]) * fontSize;
          const verticalPositionText = currentY + (boxHeight - fontSize) / 2 + fontSize * 0.9;
          const horizontalPositionText = ((boxesWidth[i] - textWidth) / 2 + boxPositionOn_X); //textAlign -> Center
          doc.text(columnTexts[i], horizontalPositionText, verticalPositionText);

        } else if (i == 2) {
          const splitText = doc.splitTextToSize(columnTexts[i], (boxesWidth[i] - 10));
          const isMultipleLines = splitText.length > 1;
          const verticalPositionText = currentY + (boxHeight / 2) + (isMultipleLines ? - 1.2 : 2);
          doc.text(splitText, boxPositionOn_X + 5, verticalPositionText); //textAlign -> Left

        } else {
          const number = formatNumber(columnTexts[i]);
          const textWidth = doc.getStringUnitWidth(number) * fontSize;
          const verticalPositionText = currentY + (boxHeight - fontSize) / 2 + fontSize * 0.9;
          const horizontalPositionText = ((boxesWidth[i] - textWidth) / 2 + boxPositionOn_X); //textAlign -> Center
          doc.text(number, horizontalPositionText, verticalPositionText);
        }

        boxPositionOn_X += boxesWidth[i] + BORDER_WIDTH;
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
    const datePositionOn_X = PAGE_WIDTH - MARGIN_RIGHT - date_textWidth;
    doc.text(date, datePositionOn_X, currentY);
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
    const certificateTitlePositionOn_X = (PAGE_WIDTH - certificateTitle_textWidth) / 2;

    doc.text(certificateTitle, certificateTitlePositionOn_X, currentY);
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

  const createRowTotales = (numberOfColumns, withBoxes, data) => {

    const fontSize = 5;
    doc.setFontSize(fontSize);

    const boxHeight = 15;
    const widthTableMinusBorders = TABLE_WIDTH - ((numberOfColumns - 1) * BORDER_WIDTH); // tamaño de tabla sin los bordes --> (tamaño_tabla - ((numero_columnas - 1) * tamaño_borde))
    const sizeBoxesData = widthTableMinusBorders * withBoxes;

    let boxPositionOn_X = (widthTableMinusBorders + MARGIN_LEFT) - (sizeBoxesData * numberOfColumns);
    const verticalPositionText = currentY + (boxHeight / 2);

    const boxTitleWith = 70;
    const titleBoxPositionOn_X = boxPositionOn_X - boxTitleWith - BORDER_WIDTH;

    doc.setFillColor(220, 220, 220);
    doc.rect(titleBoxPositionOn_X, currentY, boxTitleWith, boxHeight, "F");

    const title = 'Totales';
    const textWidth = doc.getStringUnitWidth(title) * fontSize;
    const titleHorizontalPositionText = ((boxTitleWith - textWidth) / 2 + titleBoxPositionOn_X) //textAlign -> Center
    doc.text(title, titleHorizontalPositionText, verticalPositionText + 2);

    for (let i = 0; i < numberOfColumns; i++) {
      doc.setFillColor(220, 220, 220);
      doc.rect(boxPositionOn_X, currentY, sizeBoxesData, boxHeight, "F");

      const textWidth = doc.getStringUnitWidth(data[i]) * fontSize;
      const horizontalPositionNumber = ((sizeBoxesData - textWidth) / 2 + boxPositionOn_X) //textAlign -> Center
      doc.text(formatNumber(data[i]), horizontalPositionNumber, verticalPositionText + 2);

      boxPositionOn_X += sizeBoxesData + BORDER_WIDTH;
    }
  }

  const createTable = (isDomiciliary, isProjection, title, data) => {


    // ----- Table Header 1 -----
    createRowTable([[title, 11, TABLE_WIDTH, [220, 220, 220]]], 21)
    currentY += BORDER_WIDTH + 21;  // --> BORDER_WIDTH + boxHeight

    // ----- Table  Header 2 -----
    const header2_widthTableMinusBorders = TABLE_WIDTH - ((3 - 1) * BORDER_WIDTH); // tamaño de tabla sin los bordes --> (tamaño_tabla - ((numero_columnas - 1) * tamaño_borde))
    createRowTable([
      ["Material", 7, (header2_widthTableMinusBorders * 0.52), [220, 220, 220]],
      ["No Peligroso", 7, (header2_widthTableMinusBorders * 0.24), [220, 220, 220]],
      ["Peligrosos", 7, (header2_widthTableMinusBorders * 0.24), [220, 220, 220]]
    ], 19)
    currentY += BORDER_WIDTH + 19;  // --> BORDER_WIDTH + boxHeight


    // ----- Table Header 3 -----

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
        [["Tarifa", 7], ["(UF/Ton)", 6]],
        [["Total", 7], ["(UF)", 6]],
        [["Cantidad", 7], ["(Toneladas)", 6]],
        [["Tarifa", 7], ["(UF/Ton)", 6]],
        [["Total", 7], ["(UF)", 6]]
      )
    }

    const numberOfColumns = contentBoxes_arrayTitles.length
    const contentBoxes_widthTableMinusBorders = TABLE_WIDTH - ((numberOfColumns - 1) * BORDER_WIDTH);  // tamaño de tabla sin los bordes --> (tamaño_tabla - ((numero_columnas - 1) * tamaño_borde))

    let contentBoxesWidth = [];

    if (isProjection) {
      contentBoxesWidth.push(
        contentBoxes_widthTableMinusBorders * 0.1,
        contentBoxes_widthTableMinusBorders * 0.1,
        contentBoxes_widthTableMinusBorders * 0.32,
        contentBoxes_widthTableMinusBorders * 0.24,
        contentBoxes_widthTableMinusBorders * 0.24,
      )
    } else {
      contentBoxesWidth.push(
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

    createRowVariableTextSize(contentBoxes_arrayTitles, numberOfColumns, contentBoxesWidth, 19, [220, 220, 220])
    currentY += 19 + BORDER_WIDTH;


    // ----- Table body -----
    tableBody(isDomiciliary, isProjection, data, 5, numberOfColumns, contentBoxesWidth, 15);

    // ----- Table row total -----

    let rowTotal = [];

    if (isDomiciliary) {
      const domiciliaryRates = sumOfRates.domiciliary;

      if (isProjection) {
        rowTotal.push(domiciliaryRates.notDangerous.total.toFixed(2), domiciliaryRates.dangerous.total.toFixed(2));
      } else {
        rowTotal.push(
          domiciliaryRates.notDangerous.numberOfTons.toFixed(2),
          '-',
          domiciliaryRates.notDangerous.total.toFixed(2),
          domiciliaryRates.dangerous.numberOfTons.toFixed(2),
          '-',
          domiciliaryRates.dangerous.total.toFixed(2)
        )
      }
    } else {
      const noDomiciliaryRates = sumOfRates.noDomiciliary;

      if (isProjection) {
        rowTotal.push(noDomiciliaryRates.notDangerous.total.toFixed(2), noDomiciliaryRates.dangerous.total.toFixed(2));
      } else {
        rowTotal.push(
          noDomiciliaryRates.notDangerous.numberOfTons.toFixed(2),
          '-',
          noDomiciliaryRates.notDangerous.total.toFixed(2),
          noDomiciliaryRates.dangerous.numberOfTons.toFixed(2),
          '-',
          noDomiciliaryRates.dangerous.total.toFixed(2)
        )
      }
    }

    createRowTotales((isProjection ? 2 : 6), (isProjection ? 0.24 : 0.08), rowTotal)
  }

  const paymentMethodsTable = (paymentDates, amountPerInstallment, fontSizeTable) => {

    // -- Header 1 Table --
    createRowTable([['Forma de Pago', fontSizeTable, TABLE_WIDTH, [220, 220, 220]]], 21);
    currentY += 21 + BORDER_WIDTH;  // --> boxHeight + BORDER_WIDTH

    // -- Header 2 Table --
    const header2_widthTableMinusBorders = TABLE_WIDTH - ((3 - 1) * BORDER_WIDTH); // tamaño de tabla sin los bordes --> (tamaño_tabla - ((numero_columnas - 1) * tamaño_borde))
    const sizeBoxes = header2_widthTableMinusBorders / 3;

    createRowTable([
      ["N° Cuotas", fontSizeTable, sizeBoxes, [220, 220, 220]],
      ["Fecha", fontSizeTable, sizeBoxes, [220, 220, 220]],
      ["Total (UF)", fontSizeTable, sizeBoxes, [220, 220, 220]]
    ], 19);
    currentY += 19 + BORDER_WIDTH;  // --> boxHeight + BORDER_WIDTH


    // -- Body Table --

    for (let i = 0; i < paymentDates.length; i++) {
      createRowTable([
        [(i + 1).toString(), fontSizeTable, sizeBoxes, [236, 240, 241]],
        [paymentDates[i], fontSizeTable, sizeBoxes, [236, 240, 241]],
        [amountPerInstallment, fontSizeTable, sizeBoxes, [236, 240, 241]]
      ], 19);

      currentY += 19 + BORDER_WIDTH; // --> boxHeight + BORDER_WIDTH
    }
  }

  const totalTON = () => {
    const noDomiciliaryRates = sumOfRates.noDomiciliary;
    const domiciliaryRates = sumOfRates.domiciliary;

    const tableRates = TABLE_WIDTH - ((4 - 1) * BORDER_WIDTH); // tamaño de tabla sin los bordes --> (tamaño_tabla - ((numero_columnas - 1) * tamaño_borde))
    const tableRatesSizeBoxes = tableRates / 4;

    createRowTable([
      ["Categoria", fontSizeTable, tableRatesSizeBoxes, [220, 220, 220]],
      ["No Peligroso (Ton)", fontSizeTable, tableRatesSizeBoxes, [220, 220, 220]],
      ["Peligrosos (Ton)", fontSizeTable, tableRatesSizeBoxes, [220, 220, 220]],
      ["Total (Ton)", fontSizeTable, tableRatesSizeBoxes, [220, 220, 220]],
    ], 19);
    currentY += 19 + BORDER_WIDTH;  // --> boxHeight + BORDER_WIDTH

    createRowTable([
      ["Domiciliaria", fontSizeTable, tableRatesSizeBoxes, [220, 220, 220]],
      [formatNumber(domiciliaryRates.notDangerous.numberOfTons.toFixed(2)), fontSizeTable, tableRatesSizeBoxes, [236, 240, 241]],
      [formatNumber(domiciliaryRates.dangerous.numberOfTons.toFixed(2)), fontSizeTable, tableRatesSizeBoxes, [236, 240, 241]],
      [formatNumber((domiciliaryRates.notDangerous.numberOfTons + domiciliaryRates.dangerous.numberOfTons).toFixed(2)), fontSizeTable, tableRatesSizeBoxes, [236, 240, 241]],
    ], 19);
    currentY += 19 + BORDER_WIDTH;  // --> boxHeight + BORDER_WIDTH

    createRowTable([
      ["No Domiciliaria", fontSizeTable, tableRatesSizeBoxes, [220, 220, 220]],
      [formatNumber(noDomiciliaryRates.notDangerous.numberOfTons.toFixed(2)), fontSizeTable, tableRatesSizeBoxes, [236, 240, 241]],
      [formatNumber(noDomiciliaryRates.dangerous.numberOfTons.toFixed(2)), fontSizeTable, tableRatesSizeBoxes, [236, 240, 241]],
      [formatNumber((noDomiciliaryRates.notDangerous.numberOfTons + noDomiciliaryRates.dangerous.numberOfTons).toFixed(2)), fontSizeTable, tableRatesSizeBoxes, [236, 240, 241]],
    ], 19);
    currentY += 19 + BORDER_WIDTH;  // --> boxHeight + BORDER_WIDTH

    createRowTable([
      ["Total", fontSizeTable, tableRatesSizeBoxes, [220, 220, 220]],
      [formatNumber((domiciliaryRates.notDangerous.numberOfTons + noDomiciliaryRates.notDangerous.numberOfTons).toFixed(2)), fontSizeTable, tableRatesSizeBoxes, [236, 240, 241]],
      [formatNumber((domiciliaryRates.dangerous.numberOfTons + noDomiciliaryRates.dangerous.total).toFixed(2)), fontSizeTable, tableRatesSizeBoxes, [236, 240, 241]],
      [formatNumber((domiciliaryRates.notDangerous.numberOfTons + domiciliaryRates.dangerous.numberOfTons + noDomiciliaryRates.notDangerous.numberOfTons + noDomiciliaryRates.dangerous.numberOfTons).toFixed(2)), fontSizeTable, tableRatesSizeBoxes, [236, 240, 241]],
    ], 19);
  }

  // ----------------------------- Certificate PDF creation -----------------------------

  const currentDate = new Date();
  const day = currentDate.getDate().toString().padStart(2, "0");
  const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
  const year = currentDate.getFullYear();
  const hours = currentDate.getHours().toString().padStart(2, "0");
  const minutes = currentDate.getMinutes().toString().padStart(2, "0");
  const seconds = currentDate.getSeconds().toString().padStart(2, "0");

  const registerType = PDF_data.registerType.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(); // real, real correccion, proyeccion, proyeccion correcion
  const isProjection = 'proyeccion' === registerType || 'correccion proyeccion' === registerType;

  CertificateHeader(PDF_data.idRETC, PDF_data.rutManager, PDF_data.registerType, currentDate)
  currentY += 40;

  createTable(true, isProjection, 'Categoría Domiciliaria', PDF_data.domiciliary)

  doc.addPage(); // Se crea nueva pagina
  currentY = MARGIN_TOP; // Se reinicia currentY

  createTable(false, isProjection, 'Categoría No Domiciliaria', PDF_data.noDomiciliary)
  currentY += 15;


  const fontSizeTable = 9;
  if (!isProjection) {
    doc.addPage(); // Se crea nueva pagina
    currentY = MARGIN_TOP + 20; // Se reinicia currentY

    const noDomiciliaryRates = sumOfRates.noDomiciliary;
    const domiciliaryRates = sumOfRates.domiciliary;

    const paymentDates = [`31 / Ene / ${year}`, `31 / Mar / ${year}`, `31 / Jul / ${year}`, `30 / Sept / ${year}`];
    const amountPerInstallment = formatNumber(((domiciliaryRates.notDangerous.total + domiciliaryRates.dangerous.total + noDomiciliaryRates.notDangerous.total + noDomiciliaryRates.dangerous.total) / paymentDates.length).toFixed(2));


    // -- Title page 2 --
    const fontSizeTitle = 15;
    const titlePage2 = 'Resumen de Declaración'
    doc.setFontSize(fontSizeTitle);
    const textWidth = doc.getStringUnitWidth(titlePage2) * fontSizeTitle;
    const horizontalPositionText = (PAGE_WIDTH - textWidth) / 2; //textAlign -> Center
    doc.text(titlePage2, horizontalPositionText, currentY);

    currentY += 50;

    // -- tableTotal --
    // createRowTable([
    //   ["Total Domiciliaria (UF)", fontSizeTable, 125, [220, 220, 220]],
    //   [formatNumber((domiciliaryRates.notDangerous.total + domiciliaryRates.dangerous.total).toFixed(2)), fontSizeTable, 125, [236, 240, 241]],
    // ], 21);
    // currentY += 21 + BORDER_WIDTH;  // --> boxHeight + BORDER_WIDTH

    // createRowTable([
    //   ["Total No Domiciliaria (UF)", fontSizeTable, 125, [220, 220, 220]],
    //   [formatNumber((noDomiciliaryRates.notDangerous.total + noDomiciliaryRates.dangerous.total).toFixed(2)), fontSizeTable, 125, [236, 240, 241]],
    // ], 21);
    // currentY += 21 + BORDER_WIDTH;  // --> boxHeight + BORDER_WIDTH

    // createRowTable([
    //   ['Valores Netos', fontSizeTable, 125, [220, 220, 220]],
    //   [amountPerInstallment, fontSizeTable, 125, [236, 240, 241]],
    // ], 21);
    // currentY += 33;

    // doc.setFontSize(7);
    // doc.text('* Valores Netos', MARGIN_LEFT + 15, currentY);

    // -- Cuadro tarifas Toneladas--
    totalTON()

    currentY += 70;


    // -- Cuadro tarifas --
    const tableRates = TABLE_WIDTH - ((4 - 1) * BORDER_WIDTH); // tamaño de tabla sin los bordes --> (tamaño_tabla - ((numero_columnas - 1) * tamaño_borde))
    const tableRatesSizeBoxes = tableRates / 4;

    createRowTable([
      ["Categoria", fontSizeTable, tableRatesSizeBoxes, [220, 220, 220]],
      ["No Peligroso (UF)", fontSizeTable, tableRatesSizeBoxes, [220, 220, 220]],
      ["Peligrosos (UF)", fontSizeTable, tableRatesSizeBoxes, [220, 220, 220]],
      ["Total (UF)", fontSizeTable, tableRatesSizeBoxes, [220, 220, 220]],
    ], 21);
    currentY += 21 + BORDER_WIDTH;  // --> boxHeight + BORDER_WIDTH

    createRowTable([
      ["Domiciliaria", fontSizeTable, tableRatesSizeBoxes, [220, 220, 220]],
      [formatNumber(domiciliaryRates.notDangerous.total.toFixed(2)), fontSizeTable, tableRatesSizeBoxes, [236, 240, 241]],
      [formatNumber(domiciliaryRates.dangerous.total.toFixed(2)), fontSizeTable, tableRatesSizeBoxes, [236, 240, 241]],
      [formatNumber((domiciliaryRates.notDangerous.total + domiciliaryRates.dangerous.total).toFixed(2)), fontSizeTable, tableRatesSizeBoxes, [236, 240, 241]],
    ], 21);
    currentY += 21 + BORDER_WIDTH;  // --> boxHeight + BORDER_WIDTH

    createRowTable([
      ["No Domiciliaria", fontSizeTable, tableRatesSizeBoxes, [220, 220, 220]],
      [formatNumber(noDomiciliaryRates.notDangerous.total.toFixed(2)), fontSizeTable, tableRatesSizeBoxes, [236, 240, 241]],
      [formatNumber(noDomiciliaryRates.dangerous.total.toFixed(2)), fontSizeTable, tableRatesSizeBoxes, [236, 240, 241]],
      [formatNumber((noDomiciliaryRates.notDangerous.total + noDomiciliaryRates.dangerous.total).toFixed(2)), fontSizeTable, tableRatesSizeBoxes, [236, 240, 241]],
    ], 21);
    currentY += 21 + BORDER_WIDTH;  // --> boxHeight + BORDER_WIDTH

    createRowTable([
      ["Total", fontSizeTable, tableRatesSizeBoxes, [220, 220, 220]],
      [formatNumber((domiciliaryRates.notDangerous.total + noDomiciliaryRates.notDangerous.total).toFixed(2)), fontSizeTable, tableRatesSizeBoxes, [236, 240, 241]],
      [formatNumber((domiciliaryRates.dangerous.total + noDomiciliaryRates.dangerous.total).toFixed(2)), fontSizeTable, tableRatesSizeBoxes, [236, 240, 241]],
      [formatNumber((domiciliaryRates.notDangerous.total + domiciliaryRates.dangerous.total + noDomiciliaryRates.notDangerous.total + noDomiciliaryRates.dangerous.total).toFixed(2)), 9, tableRatesSizeBoxes, [236, 240, 241]],
    ], 21);
    currentY += 21 + BORDER_WIDTH + 12;

    doc.setFontSize(7);
    const informativeTextWidth = doc.getStringUnitWidth('* Valores Netos') * 7;
    const horizontalPositionInformativeText = (PAGE_WIDTH - informativeTextWidth) / 2; //textAlign -> Center
    doc.text('* Valores Netos', horizontalPositionInformativeText, currentY);


    // -- Forma de pago --
    currentY += 50;
    paymentMethodsTable(paymentDates, amountPerInstallment, fontSizeTable);

    currentY = PAGE_HEIGHT - 80;
    CertificateFooter()

  } else {

    currentY += 30;

    // -- Cuadro tarifas Toneladas--
    totalTON()
    currentY += 19 + BORDER_WIDTH + 12;


    doc.setFontSize(7);
    const informativeTextWidth = doc.getStringUnitWidth('* Valores Netos') * 7;
    const horizontalPositionInformativeText = (PAGE_WIDTH - informativeTextWidth) / 2; //textAlign -> Center
    doc.text('* Valores Netos', horizontalPositionInformativeText, currentY);

    currentY = PAGE_HEIGHT - 65;
    CertificateFooter()
  }



  // --------------- Write File ---------------
  // Ruta del directorio para guardar los archivos PDF
  const currentFilePath = fileURLToPath(import.meta.url);
  const currentDirectory = path.dirname(currentFilePath);

  const nameRandom = generateRandomNamePDF();
  const formattedDate = `${day}${month}${year}${hours}${minutes}${seconds}`;

  // Fecha / Tipo documento / nameRandom
  const nameFile = `${formattedDate}-${registerType}-${nameRandom}.pdf`;
  const urlpPDF = `${currentDirectory}/pdfs/${nameFile}`;

  doc.save(urlpPDF)


  // -- Guardar Archivo --
  let isUploaded = null;
  await uploadPDFToAzureStorage(urlpPDF, nameFile).then(() => {
    isUploaded = true;
  })
    .catch((error) => {
      isUploaded = false;
    });

  return { nameFile, isUploaded };
}

export default generatePDF;