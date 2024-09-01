import { mongoDbConnection } from '../config';

const stanja = ['stecaj', 'likvidacija', 'blokada', 'odjava'] as const;

const propertyMap = {
  stecaj: 'Stečaj',
  likvidacija: 'Likvidacija',
  blokada: 'Blokada',
  odjava: 'Odjava',
  neZnam: 'Ne znam',
};

export const up = async () => {
  const mongoDb = await mongoDbConnection();
  const firmasCollection = mongoDb.collection('firmas');

  try {
    const firmasCursor = firmasCollection.find({});

    while (await firmasCursor.hasNext()) {
      const firma = await firmasCursor.next();

      if (!firma) {
        continue;
      }
      const stanjeFirme: string[] = [];

      stanja.forEach((item) => {
        if (firma[item] === 1) {
          stanjeFirme.push(propertyMap[item]);
        }
      });

      if (stanjeFirme.length === 0) {
        stanjeFirme.push(propertyMap.neZnam);
      }

      const unsetFields = {
        stecaj: '',
        likvidacija: '',
        blokada: '',
        odjava: '',
      };

      await firmasCollection.updateOne(
        { _id: firma?._id },
        { $set: { stanje_firme: stanjeFirme }, $unset: unsetFields }
      );
    }
  } catch (error) {
    console.error('Error during migration:', error);
  }
};
