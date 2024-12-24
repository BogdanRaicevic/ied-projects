import { RowDataPacket } from "mysql2/promise";
import { mongoDbConnection, mysqlConnection } from "../config";

export const up = async () => {
  const monogDb = await mongoDbConnection();
  const mysqlDb = await mysqlConnection();
  const mongoCollectionName = "firmas";

  try {
    // Check if the collection exists
    const collections = await monogDb.listCollections();
    const collectionNames = collections.map((col) => col.name);

    if (!collectionNames.includes(mongoCollectionName)) {
      await (await mongoDbConnection()).createCollection(mongoCollectionName);
      console.log(`Collection '${mongoCollectionName}' created`);
    }

    const mongoCollection = monogDb.collection(mongoCollectionName);

    // Fetch data from MySQL
    const d1 = `
    SELECT 
      f.*,
      ko.ID_kontakt_osoba AS ko_ID_kontakt_osoba,
      ko.ime AS ko_ime,
      ko.prezime AS ko_prezime,
      ko.radno_mesto AS ko_radno_mesto,
      ko.telefon AS ko_telefon,
      ko.faks AS ko_faks,
      ko.e_mail AS ko_e_mail,
      ko.kontaktiran_puta AS ko_kontaktiran_puta,
      ko.ucesce_na_seminarima AS ko_ucesce_na_seminarima,
      ko.komentar AS ko_komentar,
      ko.created_at AS ko_created_at,
      ko.updated_at AS ko_updated_at,
      ko.created_by AS ko_created_by,
      ko.updated_by AS ko_updated_by,
      m.naziv_mesto as mesto,
      m.postanski_broj as postanski_broj,
      vf.velicina
    FROM 
      firma f
    LEFT JOIN 
      radi_u ru ON f.ID_firma = ru.FK_FIRMA_ID_firma
    LEFT JOIN 
      kontakt_osoba ko ON ru.FK_KONTAKT_OSOBA_ID_kontakt_osoba = ko.ID_kontakt_osoba
    LEFT JOIN 
      mesto m ON f.FK_MESTO_ID_mesto = m.ID_mesto
    LEFT JOIN 
      velicina_firme vf ON f.FK_VELICINA_FIRME_ID_velicina_firme = vf.ID_velicina_firme
    
    UNION
    SELECT 
      f.*,
      ko.*,
      m.naziv_mesto as mesto,
      m.postanski_broj as postanski_broj,
      vf.velicina
    FROM 
      firma f
    RIGHT JOIN 
      radi_u ru ON f.ID_firma = ru.FK_FIRMA_ID_firma
    RIGHT JOIN 
      kontakt_osoba ko ON ru.FK_KONTAKT_OSOBA_ID_kontakt_osoba = ko.ID_kontakt_osoba
    LEFT JOIN 
      mesto m ON f.FK_MESTO_ID_mesto = m.ID_mesto
    LEFT JOIN 
      velicina_firme vf ON f.FK_VELICINA_FIRME_ID_velicina_firme = vf.ID_velicina_firme
    `;

    const [rows] = await mysqlDb.execute<RowDataPacket[]>(d1);

    const processedFirmaIds = new Set<Number>();
    let groupedFirmas = new Map<Number, any>();

    for (const row of rows) {
      delete row.FK_MESTO_ID_mesto;
      delete row.FK_VELICINA_FIRME_ID_velicina_firme;

      if (processedFirmaIds.has(row.ID_firma)) {
        const zaposleniData = extractZaposleniData(row);
        let b = groupedFirmas.get(row.ID_firma);

        b.zaposleni.push(zaposleniData);

        groupedFirmas.set(row.ID_firma, b);
      } else {
        processedFirmaIds.add(row.ID_firma);
        groupedFirmas.set(row.ID_firma, moveZaposleniToArray(row));
      }
    }

    const dataToSave = Array.from(groupedFirmas.values());

    await mongoCollection.insertMany(dataToSave);
  } catch (error) {
    console.error("Error during migration:", error);
  }
};

const extractZaposleniData = (
  row: RowDataPacket
): {
  ID_kontakt_osoba: any;
  ime: any;
  prezime: any;
  radno_mesto: any;
  telefon: any;
  faks: any;
  e_mail: any;
  kontaktiran_puta: any;
  ucesce_na_seminarima: any;
  komentar: any;
  created_at: any;
  updated_at: any;
  created_by: any;
  updated_by: any;
} => ({
  ID_kontakt_osoba: row.ko_ID_kontakt_osoba,
  ime: row.ko_ime,
  prezime: row.ko_prezime,
  radno_mesto: row.ko_radno_mesto,
  telefon: row.ko_telefon,
  faks: row.ko_faks,
  e_mail: row.ko_e_mail,
  kontaktiran_puta: row.ko_kontaktiran_puta,
  ucesce_na_seminarima: row.ko_ucesce_na_seminarima,
  komentar: row.ko_komentar,
  created_at: row.ko_created_at,
  updated_at: row.ko_updated_at,
  created_by: row.ko_created_by,
  updated_by: row.ko_updated_by,
});

function moveZaposleniToArray(firma: RowDataPacket) {
  let kontanktOsoba: any = {};
  firma.zaposleni = [];

  Object.keys(firma).forEach((key) => {
    if (key.startsWith("ko_")) {
      const keyNameWithout_ko_ = key.slice(3);
      kontanktOsoba[keyNameWithout_ko_] = firma[key];

      delete firma[key];
    }
  });

  firma.zaposleni.push(kontanktOsoba);

  return firma;
}
