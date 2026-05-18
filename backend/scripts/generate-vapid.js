import webpush from 'web-push';

const keys = webpush.generateVAPIDKeys();
console.log('Add these to your .env and frontend environment.production.ts:\n');
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
console.log(`\nvapidPublicKey: '${keys.publicKey}'`);
