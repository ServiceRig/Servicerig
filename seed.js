// seed.js
const admin = require("firebase-admin");
const fs = require("fs");

admin.initializeApp({
  credential: admin.credential.applicationDefault(), // Or use serviceAccountKey.json
});

const db = admin.firestore();

async function importCollection(filePath, collectionName) {
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  for (const [id, doc] of Object.entries(data)) {
    await db.collection(collectionName).doc(id).set(doc);
    console.log(`Imported ${collectionName}/${id}`);
  }
}

async function main() {
  await importCollection("/home/user/studio/firestore-seed/jobs.json", "jobs");
  await importCollection("/home/user/studio/firestore-seed/customers.json", "customers");
  await importCollection("/home/user/studio/firestore-seed/purchaseOrders.json", "purchaseOrders");
  await importCollection("/home/user/studio/firestore-seed/pricebook.json", "pricebook");
  await importCollection("/home/user/studio/firestore-seed/forms.json", "forms");
  await importCollection("/home/user/studio/firestore-seed/gbbEstimates.json", "gbbEstimates");
  await importCollection("/home/user/studio/firestore-seed/automations.json", "automations");
  await importCollection("/home/user/studio/firestore-seed/timesheets.json", "timesheets");
}

main();