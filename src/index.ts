import fs from "fs";
import inquirer from "inquirer";
import path from "path";
import pug from "pug";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateTemplates() {
  // Usa __dirname per andare alla root del progetto
  const rootDir = path.join(__dirname, "..");
  const templatesDir = path.join(rootDir, "templates");
  const templateFiles = fs
    .readdirSync(templatesDir)
    .filter((file: string) => file.endsWith(".pug"))
    .map((file: string) => file.replace(".pug", ""));

  if (templateFiles.length === 0) {
    console.error("No template found in templates/ folder");
    process.exit(1);
  }

  const dataDir = path.join(rootDir, "data");
  const baseDataFiles = fs
    .readdirSync(dataDir)
    .filter((file: string) => file.endsWith(".base-data.json"))
    .map((file: string) => file.replace(".json", ""));

  const prompts: any[] = [
    {
      type: "list",
      name: "templateName",
      message:
        "Select the template to compile (choosing this will be selected also the json in data/ with the same name):",
      choices: templateFiles,
    },
  ];

  if (baseDataFiles.length > 0) {
    prompts.push({
      type: "list",
      name: "baseDataName",
      message: "Select the base data file (optional):",
      choices: ["None", ...baseDataFiles],
    });
  }

  const answers = await inquirer.prompt(prompts);
  const { templateName, baseDataName } = answers;

  const compiledFunction = pug.compileFile(
    path.join(templatesDir, `${templateName}.pug`),
  );

  // Leggi i JSON file usando fs.readFileSync invece di require
  const mailsData = JSON.parse(
    fs.readFileSync(path.join(dataDir, `${templateName}.json`), "utf-8"),
  );

  let baseData = {};

  if (baseDataName && baseDataName !== "None") {
    baseData = JSON.parse(
      fs.readFileSync(path.join(dataDir, `${baseDataName}.json`), "utf-8"),
    );
  }

  const outputDir = path.join(rootDir, "out");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const mailTemplatesOutputDir = path.join(outputDir, templateName);
  if (!fs.existsSync(mailTemplatesOutputDir)) {
    fs.mkdirSync(mailTemplatesOutputDir, { recursive: true });
  }

  mailsData.forEach((mailData: { locale: any }) => {
    const html = compiledFunction({ ...baseData, ...mailData });
    fs.writeFileSync(
      path.join(mailTemplatesOutputDir, `${mailData.locale}.html`),
      html,
    );
  });

  const baseDataMessage =
    baseDataName && baseDataName !== "None"
      ? ` with '${baseDataName}' base data`
      : "";

  console.log(
    `Generated ${mailsData.length} email templates base on '${templateName}' pug template${baseDataMessage}!`,
  );
}

generateTemplates().catch(console.error);
