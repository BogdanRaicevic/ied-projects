import { mongoDbConnection } from '../config';

export const up = async () => {
  const mongoDb = await mongoDbConnection();
  const mongoCollectionName = 'firmas';

  try {
    const mongoCollection = mongoDb.collection(mongoCollectionName);

    const cursor = mongoCollection.find();

    while (await cursor.hasNext()) {
      const document: any = await cursor.next();

      let oldPib = (document.PIB as string).toLowerCase();
      if (oldPib.includes('mb:')) {
        let pibParts = oldPib.split('mb:');
        let pibPart = pibParts[0].trim().replace(/,/g, '');
        let mbPart = pibParts[1].trim();

        let numberRegex = /^\d*$/;

        if (!numberRegex.test(pibPart) || !numberRegex.test(mbPart)) {
          console.error(
            'Invalid pib or mb, company name: ',
            document.naziv_firme,
            'pib:',
            pibPart,
            'mb:',
            mbPart
          );
          continue;
        }

        await mongoCollection.updateOne(
          {
            _id: document._id,
          },
          { $set: { maticni_broj: mbPart, PIB: pibPart } }
        );
      }
    }
  } catch (error) {
    console.error('Error during migration of maticni broj:', error);
  }
};
