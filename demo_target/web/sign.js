const crypto = require('crypto');

function fingerprint(s) {
  return crypto.createHash('md5').update(s).digest('hex');
}

function sign(data, pem) {
  const signer = crypto.createSign('RSA-SHA256');
  signer.update(data);
  return signer.sign(pem, 'base64');
}

module.exports = { fingerprint, sign };
