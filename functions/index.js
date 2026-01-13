const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize the Admin SDK
admin.initializeApp();

/**
 * Callable function to create a front-desk staff user.
 * Only callable by the admin user (checked by email here).
 * Request data: { email, password, displayName }
 */
exports.createStaff = functions.https.onCall(async (data, context) => {
  // Authentication check
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const callerEmail = (context.auth.token && context.auth.token.email) ? String(context.auth.token.email).toLowerCase() : '';
  if (!callerEmail || callerEmail !== 'admin@ali-autos.com') {
    throw new functions.https.HttpsError('permission-denied', 'Only the admin may create staff accounts.');
  }

  const { email, password, displayName } = data || {};
  if (!email || !password) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required fields: email and password');
  }

  try {
    // Create the user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: displayName || ''
    });

    // Set custom claim and write role to Firestore
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'front_desk' });

    const db = admin.firestore();
    await db.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName || displayName || '',
      role: 'front_desk',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });

    // Also add a staff document for reference
    await db.collection('staff').add({
      uid: userRecord.uid,
      email: userRecord.email,
      name: userRecord.displayName || displayName || '',
      role: 'front_desk',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      createdBy: callerEmail
    });

    return { uid: userRecord.uid, email: userRecord.email };
  } catch (err) {
    // Map admin SDK errors to HttpsError
    console.error('createStaff error:', err);
    throw new functions.https.HttpsError('internal', err.message || String(err));
  }
});
