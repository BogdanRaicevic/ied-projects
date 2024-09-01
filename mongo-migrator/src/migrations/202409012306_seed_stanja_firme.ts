import { mongoDbConnection } from '../config';

const stanja = [
  { stanje_firme: 'Ne znam' },
  { stanje_firme: 'Likvidna' },
  { stanje_firme: 'Bankrot' },
  { stanje_firme: 'U blokadi' },
];

export const up = async () => {
  const mongoDb = await mongoDbConnection();
  const mongoCollectionName = 'stanja_firme';

  try {
    const mongoCollection = mongoDb.collection(mongoCollectionName);
    (await mongoCollection).insertMany(stanja);
  } catch (error) {
    console.error('Error during migration:', error);
  }
};
