// Usage:
//   node server/scripts/update-room-fields.js <roomId> \
//     --rules "Rule 1;Rule 2" \
//     --nearby "name=Cho;distance=300m;type=market|name=Dai hoc BK;distance=800m;type=university"
// If no args provided, a sample payload will be used.

const { MongoClient, ObjectId } = require('mongodb');

// Reuse the same connection string as app config
const uri = "mongodb+srv://ducyberxdev:ducyberxdev@phongtrovn.tqxpcgt.mongodb.net/PhongTroVN?retryWrites=true&w=majority&appName=PhongTroVN";

function parseArgs() {
  const args = process.argv.slice(2);
  const result = { roomId: undefined, rules: undefined, nearby: undefined };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (!result.roomId && a && !a.startsWith('--')) {
      result.roomId = a;
      continue;
    }
    if (a === '--rules') {
      result.rules = (args[i + 1] || '').split(';').map(s => s.trim()).filter(Boolean);
      i++;
    } else if (a === '--nearby') {
      // Format: key=value;key=value|key=value;...
      const raw = (args[i + 1] || '').split('|').filter(Boolean);
      result.nearby = raw.map(item => {
        const obj = {};
        item.split(';').forEach(pair => {
          const [k, v] = pair.split('=');
          if (k && v) obj[k.trim()] = v.trim();
        });
        return obj;
      });
      i++;
    }
  }
  return result;
}

async function main() {
  const { roomId, rules, nearby } = parseArgs();
  if (!roomId) {
    console.log('No roomId provided. Using sample data.');
  }

  const sampleRoomId = roomId || '68daa889a9e782ad4226afa8';
  const sampleRules = rules || ['Không hút thuốc', 'Không ồn ào sau 22h'];
  const sampleNearby = nearby || [
    { name: 'Chợ', distance: '300m', type: 'market' },
    { name: 'ĐH Bách Khoa', distance: '800m', type: 'university' }
  ];

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('PhongTroVN');
    const rooms = db.collection('rooms');

    const _id = new ObjectId(sampleRoomId);
    const update = {
      $set: {
        rules: sampleRules,
        nearbyPlaces: sampleNearby,
        updatedAt: new Date()
      }
    };

    const res = await rooms.updateOne({ _id }, update);
    console.log('Matched:', res.matchedCount, 'Modified:', res.modifiedCount);

    const doc = await rooms.findOne({ _id }, { projection: { rules: 1, nearbyPlaces: 1 } });
    console.log('Current fields:', JSON.stringify(doc, null, 2));
  } catch (e) {
    console.error('Update failed:', e);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

main();


