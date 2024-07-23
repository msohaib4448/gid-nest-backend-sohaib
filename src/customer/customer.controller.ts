import { Controller, Injectable } from '@nestjs/common';
import { Customer } from './customer.entity';
import { Crud, CrudRequest, Override, ParsedRequest } from '@dataui/crud';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmCrudService } from '@dataui/crud-typeorm';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.js';

import { readFileSync } from 'fs';
import { createCanvas } from 'canvas';
import { createWorker } from 'tesseract.js';
import { PDFPageProxy } from 'pdfjs-dist/types/web/annotation_layer_builder';

const regex = {
  zipCityPattern: /^[0-9]{5}\s\w+/,
  emailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  regex1MId: /!@#\$%\s*!@#\$%\s*([a-zA-Z]{2}\d{10})/,
  regexMId2: /^\d{7}-\d{5}-\d{2}$/,
  imageId1: /\b\d{7}-\d{5}-\d{2}\b/,
  imageId2: /\b[A-Za-z]{2}\d{10}\b/,
};

@Injectable()
export class CustomerService extends TypeOrmCrudService<Customer> {
  constructor(@InjectRepository(Customer) repo) {
    super(repo);
  }
}

@Crud({
  model: {
    type: Customer,
  },
  routes: {
    updateOneBase: {
      allowParamsOverride: true,
    },
  },
})
@Controller('customer')
export class CustomerController {
  constructor(public service: CustomerService) {}
  @Override()
  async getMany(@ParsedRequest() req: CrudRequest) {
    console.log(req.parsed);
    try {
      console.log(__dirname, '__dirname');
      const data = readFileSync(`${__dirname}/../public/newestTesttt.pdf`);

      const loadingTask = getDocument({
        data,
      });

      const pdfDocument = await loadingTask.promise;

      console.log('# PDF document loaded.');

      const page = await pdfDocument.getPage(1);

      // Apprach 1 using through text content
      const { customerTextDoc, otherTextDoc } =
        await extractDetailsByDocument(page);

      const ExtractedCustomersDataDocument = getAllCustomerDetails(
        customerTextDoc,
        otherTextDoc,
        'document',
      );
      console.log(
        'DATA EXTRACTION FROM DOCUMENT',
        ExtractedCustomersDataDocument,
      );

      /// Approach 2 using image and reading image

      // Render the page to a canvas

      const { customerTextImage, otherTextImage } =
        await extractDetailsByImage(page);

      const ExtractedCustomersDataImage = getAllCustomerDetails(
        customerTextImage,
        otherTextImage,
        'image',
      );
      console.log('DATA EXTRACTION FROM IMAGE', ExtractedCustomersDataImage);

      return { ExtractedCustomersDataDocument, ExtractedCustomersDataImage };
    } catch (error) {
      console.error('Error getting document: ', error);
    }
  }
}

function getMIds(content: string): any | null {
  const regex1MId = /!@#\$%\s*!@#\$%\s*([a-zA-Z]{2}\d{10})/;

  const regexMId2 = /^\d{7}-\d{5}-\d{2}$/;

  const match1Mid = content.match(regex1MId);

  const MId = match1Mid ? match1Mid[1] : null;

  const matchMId2Find = content.match('Auftragsnummer(.*)DKV')[0];

  const matchMId2 = matchMId2Find.split(' !@#$% ')?.filter((el) => el);

  const MId2 = regexMId2.test(matchMId2[1]) ? matchMId2[1] : null;

  return { MId, MId2 };
}

function getMIdsImage(content: string[]): any | null {
  const MId2 = content
    .find((element) => element.match(regex.imageId1))
    ?.match(regex.imageId1)?.[0];
  const MId = content
    .find((element) => element.match(regex.imageId2))
    ?.match(regex.imageId2)?.[0];
  return { MId, MId2 };
}

async function extractDetailsByImage(page: PDFPageProxy) {
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext('2d');

  const renderContext = {
    canvasContext: context,
    viewport: viewport,
  };

  await page.render(renderContext).promise;
  console.log('# Page rendered to canvas.');

  const worker = await createWorker();

  const imageData = canvas.toDataURL();
  const rectangles = [
    { left: 0, top: 490, width: 605, height: 250 }, // Customer Detials
    { left: 450, top: 180, width: 450, height: 540 }, // Other Details
  ];

  const texts: string[] = [];

  for (const rectangle of rectangles) {
    const {
      data: { text },
    } = await worker.recognize(imageData, {
      rectangle,
    });

    texts.push(text);
  }
  await worker.terminate();

  return {
    customerTextImage: texts[0]
      .split('\n')
      .filter((line) => line.length > 0 || null),
    otherTextImage: texts[1]
      .split('\n')
      .filter((line) => line.length > 0 || null),
  };
}

async function extractDetailsByDocument(page: PDFPageProxy) {
  const textContent = await page.getTextContent();

  const extractedText = textContent.items
    .map((item: any) => item.str)
    .join(' !@#$% ');

  try {
    const formattedCustomerText = getSubStringDocumentText(
      extractedText,
      'Lieferanschrift:',
      'Liefertermi',
    );

    return {
      customerTextDoc: formattedCustomerText,
      otherTextDoc: extractedText,
    };
  } catch (error) {
    const formattedCustomerText = getSubStringDocumentText(
      extractedText,
      'Lieferanschrift:',
      'Liefertermin',
    );

    return {
      customerTextDoc: formattedCustomerText,
      otherTextDoc: extractedText,
    };
  }
}

function getAllCustomerDetails(
  customerText: string[],
  otherText: string | string[],
  extractionType: string,
) {
  console.log(
    customerText,
    otherText,
    extractionType,
    'getAllCustomerDetailsInput',
  );
  let customerIDs;
  if (extractionType === 'document') {
    customerIDs = typeof otherText === 'string' && getMIds(otherText);
  } else {
    customerIDs = Array.isArray(otherText) && getMIdsImage(otherText);
  }

  return {
    customerData: extractCustomerData(customerText, customerText[0]),
    customerIDs,
  };
}

function extractCustomerData(customerText: string[], elementOne: string) {
  console.log(
    'customerText: ',
    customerText,
    'elementOne: ',
    elementOne,
    'extractCustomerDataInput',
  );
  if (customerText.length < 8) return false;

  const firstKnownIndex = customerText.indexOf(elementOne);

  const namePrefixIndex = firstKnownIndex + 1;

  if (firstKnownIndex !== 0 || customerText[firstKnownIndex] !== elementOne)
    return false;

  const emailIndex = customerText.findIndex((element) => {
    const cleanedElement = element.replace(/\s+/g, '');
    return regex.emailPattern.test(cleanedElement);
  });

  const name = customerText[namePrefixIndex + 1];
  const streetAddress = customerText.slice(namePrefixIndex + 2, emailIndex - 1);
  const address = streetAddress.join(' ');
  const zipcodeCity = customerText[emailIndex - 1];
  let email = customerText[emailIndex];
  if (/\s/.test(email)) {
    email = email.replace(/\s/g, '');
  }

  if (!name || !address || !zipcodeCity || !email) return false;

  if (
    !regex.zipCityPattern.test(zipcodeCity) ||
    !regex.emailPattern.test(email)
  )
    return false;

  const nameArr = name?.split(' ')?.filter((el) => el);
  const firstName = nameArr[0];
  const lastName = nameArr?.length > 1 && nameArr.splice(1).join(' ');

  const addressArr = zipcodeCity?.split(' ')?.filter((el) => el);
  const zipCode = addressArr[0];
  const cityName = addressArr?.length > 1 && addressArr.splice(1).join(' ');

  return { firstName, lastName, address, zipCode, cityName, email };
}

function formatCustomerTextDynamic(textArray) {
  const formattedText = [];
  let tempString = '';

  for (let i = 0; i < textArray.length; i++) {
    if (textArray[i].trim() === '') {
      continue;
    } else {
      if (i + 1 < textArray.length && textArray[i + 1].trim() === '') {
        tempString += (tempString ? ' ' : '') + textArray[i];
      } else {
        if (tempString) {
          tempString += ' ' + textArray[i];
          formattedText.push(tempString);
          tempString = '';
        } else {
          formattedText.push(textArray[i]);
        }
      }
    }
  }

  return formattedText;
}

function getSubStringDocumentText(extractedText, startText, endText) {
  const customerExtarctedText = extractedText.match(
    `${startText}(.*)${endText}`,
  )[0];
  console.log(customerExtarctedText, 'customerExtarctedText');
  const filteredText = customerExtarctedText
    .split(' !@#$% ')
    ?.filter((el) => el);

  return formatCustomerTextDynamic(filteredText);
}
