const crypto = require('crypto');
dotenv = require('dotenv');
dotenv.config();

const secretKey = process.env.SECRET_KEY;
// Generate a 32-byte key from your string
const key = crypto.createHash('sha256').update(secretKey).digest('base64').substr(0, 32);
console.log('Key:', key);

const iv = crypto.randomBytes(16); // IV must be 16 bytes for AES-256-CBC

function encrypt(text) {
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}

// Example usage
const encrypted = encrypt('Some sensitive data');
console.log('Encrypted:', encrypted);

const decrypted = decrypt(encrypted);
console.log('Decrypted:', decrypted);
