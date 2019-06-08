'use strict';

const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const fs = require('fs');
const simpleParser = require('mailparser').simpleParser;
const hummus = require('hummus');

module.exports.extractFirstPage = async (event) => {
  console.log(JSON.stringify(event));
  try {
    const record = event.Records[0];
    const objectKey = record.s3.object.key;
    const emailObject = await fetchObject(record.s3.bucket.name, objectKey);
    const email = await simpleParser(emailObject);

    const fullPdf = email.attachments[0].content;
    const firstPage = extractFirstPage(fullPdf);

    const targetBucket = process.env.S3_OUTPUT_BUCKET;
    const targetPrefix = formatYearMonth(email.date);
    const targetKey = `${formatDate(email.date)}-${process.env.COMPANY}-Factuur.pdf`;

    await s3.putObject({
      Bucket: targetBucket,
      Key: [targetPrefix, targetKey].join('/'),
      ContentType: 'binary',
      Body: firstPage,
    }).promise();

    console.log(`First page saved to s3://${[targetBucket, targetPrefix, targetKey].join('/')}`)

    return { status: 'success' };
  } catch (Error) {
    console.log(Error, Error.stack);
    return Error;
  }
};

async function fetchObject(bucket, objectKey) {
  return s3.getObject({Bucket: bucket, Key: objectKey}).promise()
    .then(object => object.Body);
}

function extractFirstPage(contents) {
  const tmpFile = `/tmp/${new Date().getTime()}-${contents.length}`;
  const inStream = new hummus.PDFRStreamForBuffer(contents);
  const pdfReader = hummus.createReader(inStream);
  const pdfWriter = hummus.createWriter(tmpFile);
  pdfWriter.createPDFCopyingContext(pdfReader).appendPDFPageFromPDF(0);
  pdfWriter.end();
  return fs.readFileSync(tmpFile);
}

function lpad(n) {
  if (n < 10) {
    return '0' + n;
  } else {
    return n;
  }
}

function formatYearMonth(date) {
  return `${date.getFullYear()}${lpad(date.getMonth() + 1)}`;
}

function formatDate(date) {
  return `${formatYearMonth(date)}${lpad(date.getDate())}`;
}
