import fs from "fs";
import path from "path";
import commandLineArgs from "command-line-args";
import { csvToObj } from "csv-to-js-parser";

function indentString(str, count, indent = " ") {
  return str.replace(/^/gm, indent.repeat(count));
}

function swapExt(file, ext) {
  file = file.split(".");
  file[file.length - 1] = ext;
  return file.join(".");
}

function fromDir(startPath, filter) {
  console.log("Start Path: ", startPath);
  console.log(`Finding .${filter} files.`);

  let foundFiles = [];
  if (!fs.existsSync(startPath)) {
    console.log("no dir ", startPath);
    return;
  }

  var files = fs.readdirSync(startPath);
  for (var i = 0; i < files.length; i++) {
    var filename = path.join(startPath, files[i]);
    var stat = fs.lstatSync(filename);
    if (stat.isDirectory()) {
      console.log("Obtaining files from: ", filename);
      foundFiles = foundFiles.concat(fromDir(filename, filter)); //recurse
    } else if (filename.endsWith(filter)) {
      foundFiles.push(filename);
    }
  }
  return foundFiles;
}

const optionDefinitions = [
  { name: "project", type: String, defaultOption: "./" },
  { name: "product", type: String, defaultOption: "" },
  { name: "branch", type: String, defaultOption: "main" },
];

function buildJS(tables) {
  const tablesString = JSON.stringify(tables, null, 2);
  const fileTemplate = `module.exports = ${tablesString}`;
  return fileTemplate;
}

const options = commandLineArgs(optionDefinitions);

const project = options.project;
//let product = options.product;
let branch = options.branch ? options.branch : options.product;

let tablesPath = `${project}/scripts/${branch}/tables`;
if (options.project == "local") {
  tablesPath = `./tables`;
}
const tables = fromDir(tablesPath, "csv");
console.log(tables);

let bundleFile = `${tablesPath}/processed-tables.js`;
for (const table of tables) {
  let tableObj = csvToObj(fs.readFileSync(table).toString());
  const tableReference = path
    .relative(tablesPath, swapExt(table, null))
    .replaceAll("/", "--");
  tablesObj[tableReference] = tableObj;
}

if (fs.existsSync(bundleFile)) {
  console.log(`Clearing: ${bundleFile}`);
  fs.truncateSync(bundleFile, 0, function () {});
}

console.log(`Writing: ${bundleFile}`);
fs.writeFileSync(bundleFile, buildJS(tablesObj), {
  encoding: "utf8",
  flag: "a+",
});
