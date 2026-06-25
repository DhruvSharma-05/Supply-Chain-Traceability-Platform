// Extracts the compiled contract ABI into a committed, frontend-consumable file.
// Run via `npm run export:abi` (compiles first, then writes abi/FoodTraceability.json).
const fs = require("fs");
const path = require("path");

const artifact = require("../artifacts/contracts/FoodTraceability.sol/FoodTraceability.json");

const outDir = path.join(__dirname, "..", "abi");
fs.mkdirSync(outDir, { recursive: true });

const outFile = path.join(outDir, "FoodTraceability.json");
fs.writeFileSync(outFile, JSON.stringify(artifact.abi, null, 2) + "\n");

console.log(`ABI written to ${path.relative(path.join(__dirname, ".."), outFile)}`);
