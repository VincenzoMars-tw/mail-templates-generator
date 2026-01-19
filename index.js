const pug = require("pug");
const fs = require("fs");
const path = require("path");

const TEMPLATE_NAME = "gigya.password-reset";

const compiledFunction = pug.compileFile(`./templates/${TEMPLATE_NAME}.pug`);

const mailsData = require(`./data/${TEMPLATE_NAME}.json`);
const baseData = require(`./data/gigya.base-data.json`);

const outputDir = path.join(__dirname, "output");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const mailTemplatesOutputDir = path.join(outputDir, TEMPLATE_NAME);
if (!fs.existsSync(mailTemplatesOutputDir)) {
  fs.mkdirSync(mailTemplatesOutputDir, { recursive: true });
}

mailsData.forEach((mailData) => {
  const html = compiledFunction({ ...baseData, ...mailData });
  fs.writeFileSync(`output/${TEMPLATE_NAME}/${mailData.locale}.html`, html);
});

console.log(
  `Generated ${mailsData.length} email templates base on '${TEMPLATE_NAME}' pug template!`,
);
