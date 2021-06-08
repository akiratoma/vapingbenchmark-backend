import { MongoClient, ObjectID } from 'mongodb';

const getResolvers = (mongoClient: MongoClient) => {
  const collection = mongoClient.db('vapingProject').collection('devices');
  return {
    Query: {
      devices: async (_root: any, args: any) => {
        const { ref, ids, nextID, limit } = args;
        const mongoLimit = limit || 5;
        const matchFilter: any = { $match: {} };
        if (ref) {
          matchFilter.$match.deviceName = new RegExp(ref, 'gi');
        } else if (ids) {
          matchFilter.$match.deviceID = { $in: ids };
        }
        if (nextID) {
          matchFilter.$match._id = { $gte: new ObjectID(nextID) };
        };
        const devicesCursor = collection.aggregate([matchFilter].concat([
          { $sort: { _id: 1 } },
          { $limit: mongoLimit + 1 },
          { $lookup: { from: 'upload_file', localField: 'images', foreignField: '_id', as: 'urls' } },
          {
            $project: {
              _id: 1,
              deviceID: 1,
              deviceName: 1,
              rating: 1,
              reviewsCount: 1,
              dimensions: 1,
              battery: 1,
              wattage: 1,
              resistances: '$resistances.values',
              capacity: 1,
              material: 1,
              drawActivation: 1,
              manualActivation: 1,
              port: 1,
              urls: { $map: { input: '$urls', as: 'urlObj', in: '$$urlObj.url' } },
              previewUrl: { $first: { $map: { input: '$urls', as: 'urlobj', in: '$$urlobj.formats.thumbnail.url' } } }
            }
          }
        ]));
        const devices = await devicesCursor.toArray();
        const next = devices.length < mongoLimit + 1 ? null : devices[devices.length - 1]._id;
        const devicesToSend = devices.length === mongoLimit + 1 ? devices.slice(0, -1) : devices;
        return {
          nextID: next,
          data: devicesToSend
        };
      }
    }
  };
};

export default getResolvers;
