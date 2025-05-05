const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');
const { assertFails, assertSucceeds } = require('@firebase/rules-unit-testing');
const { setLogLevel } = require('firebase/firestore');
const firebase = require('firebase/app');
require('firebase/firestore');

const testEnv = await initializeTestEnvironment({
  projectId: 'sunday-service-vr',
  firestore: {
    rules: fs.readFileSync('firestore.rules', 'utf8'),
  },
});

describe('Firestore security rules', () => {
  let db;

  beforeAll(async () => {
    db = testEnv.authenticatedContext('user_id', { roles: ['admin'] }).firestore();
  });

  afterAll(async () => {
    await testEnv.cleanup();
  });

  test('Allow read for authenticated users', async () => {
    const docRef = db.collection('testCollection').doc('testDoc');
    await assertSucceeds(docRef.get());
  });

  test('Deny write for non-admin users', async () => {
    const nonAdminDb = testEnv.authenticatedContext('user_id', { roles: [] }).firestore();
    const docRef = nonAdminDb.collection('testCollection').doc('testDoc');
    await assertFails(docRef.set({ test: 'data' }));
  });

  test('Allow write for admin users', async () => {
    const docRef = db.collection('testCollection').doc('testDoc');
    await assertSucceeds(docRef.set({ test: 'data' }));
  });
});