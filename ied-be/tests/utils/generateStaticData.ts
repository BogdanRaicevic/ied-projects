import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { seedTestDatabase } from "./seedData";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateStaticData() {
  console.log("Starting MongoDB memory server...");
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  console.log("Generating test data...");
  const seededData = await seedTestDatabase();

  console.log("Converting to JSON...");
  const staticData = {
    tipoviSeminara: seededData.tipoviSeminara,
    seminari: seededData.seminari,
    firme: seededData.firme,
    mesta: seededData.mesta,
    delatnosti: seededData.delatnosti,
    tipoviFirme: seededData.tipoviFirme,
    velicineFirme: seededData.velicineFirme,
    stanjaFirme: seededData.stanjaFirme,
    radnaMesta: seededData.radnaMesta,
  };

  const outputPath = join(__dirname, "../fixtures/staticTestData.json");
  writeFileSync(outputPath, JSON.stringify(staticData, null, 2));

  console.log(`✅ Static test data generated at: ${outputPath}`);
  console.log(`   - Firme: ${staticData.firme.length}`);
  console.log(`   - Seminari: ${staticData.seminari.length}`);
  console.log(`   - Tipovi Seminara: ${staticData.tipoviSeminara.length}`);
  console.log(`   - Mesta: ${staticData.mesta.length}`);
  console.log(`   - Delatnosti: ${staticData.delatnosti.length}`);
  console.log(`   - Tipovi Firme: ${staticData.tipoviFirme.length}`);
  console.log(`   - Velicine Firme: ${staticData.velicineFirme.length}`);
  console.log(`   - Stanja Firme: ${staticData.stanjaFirme.length}`);
  console.log(`   - Radna Mesta: ${staticData.radnaMesta.length}`);

  await mongoose.disconnect();
  await mongoServer.stop();
  console.log("Done!");
}

generateStaticData().catch((error) => {
  console.error("Error generating static data:", error);
  process.exit(1);
});
