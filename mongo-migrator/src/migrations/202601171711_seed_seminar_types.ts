import type { Connection } from "mongoose";

export const up = async (db: Connection) => {
  const mongoCollectionName = "tipovi_seminara";

  try {
    const mongoCollection = db.collection(mongoCollectionName);

    const tipoviSeminara = [
      "Bezbednost i zdravlje na radu",
      "Javne nabavke",
      "Finansijsko poslovanje",
      "Poresko zakonodavstvo",
      "Računovodstvo javni sektor",
      "Računovodstvo privatni sektor",
      "Sprečavanje pranja novca i finansiranja terorizma",
      "Ljudski resursi",
      "Radno-pravni odnosi",
      "Spoljna trgovina",
      "Carinsko poslovanje",
      "Soft skills",
      "Informatičko poslovne veštine",
      "Elektronsko poslovanje (digitalizacija, portali i e-servisi)",
      "Menadžment i usklađenost poslovanja",
      "Javne finansije",
      "Kadrovski poslovi (dosijei zaposlenih, arhiviranje, ugovori, otkazi, bolovanja)",
      "Bezbednost hrane i HACCP sistemi",
      "Sanitarni nadzor i zdravstvena bezbednost proizvoda",
      "Upravljanje otpadom i zaštita životne sredine",
    ];

    const documents = tipoviSeminara.map((t) => ({ tipSeminara: t }));
    await mongoCollection.insertMany(documents);
  } catch (error) {
    console.error("Error during migration of seed seminar types:", error);
    throw error;
  }
};
