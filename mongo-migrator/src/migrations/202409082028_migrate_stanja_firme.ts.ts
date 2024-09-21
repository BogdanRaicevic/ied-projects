import { mongoDbConnection } from '../config';

const stanja = ['stecaj', 'likvidacija', 'blokada'] as const;

const propertyMap = {
  stecaj: 'Stečaj',
  likvidacija: 'Likvidacija',
  blokada: 'Blokada',
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
      const current: string[] = [];

      stanja.forEach((item) => {
        if (firma[item] === 1) {
          current.push(propertyMap[item]);
        }
      });

      if (current.length === 0) {
        current.push(propertyMap.neZnam);
      }

      let finalResult =
        current.length >= 2
          ? current.includes(propertyMap.stecaj)
            ? propertyMap.stecaj
            : current[0]
          : current[0];

      const unsetFields = {
        stecaj: '',
        likvidacija: '',
        blokada: '',
      };

      await firmasCollection.updateOne(
        { _id: firma?._id },
        { $set: { stanje_firme: finalResult }, $unset: unsetFields }
      );
    }
  } catch (error) {
    console.error('Error during migration:', error);
  }
};
