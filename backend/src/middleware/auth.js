require('dotenv').config();
const { auth } = require('express-oauth2-jwt-bearer');

const verifyJwt = auth({
  issuerBaseURL: `https://${process.env.AUTH0_DOMAIN}/`,
  audience:      process.env.AUTH0_AUDIENCE,
  tokenSigningAlg: 'RS256',
});

module.exports = { verifyJwt };
