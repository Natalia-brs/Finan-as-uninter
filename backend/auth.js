const crypto = require('crypto');

const VALIDADE_TOKEN_MS = 30 * 24 * 60 * 60 * 1000;

let SEGREDO = process.env.AUTH_SECRET;
if (!SEGREDO) {
    SEGREDO = crypto.randomBytes(32).toString('hex');
    console.warn('⚠️  AUTH_SECRET não definido: usando um segredo temporário.');
}

function gerarHash(senha) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(senha, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function conferirSenha(senha, senhaHash) {
    const [salt, hash] = senhaHash.split(':');
    const calculado = crypto.scryptSync(senha, salt, 64);
    return crypto.timingSafeEqual(calculado, Buffer.from(hash, 'hex'));
}

function assinar(dados) {
    return crypto.createHmac('sha256', SEGREDO).update(dados).digest('base64url');
}

function gerarToken(login) {
    const dados = Buffer.from(JSON.stringify({ login, exp: Date.now() + VALIDADE_TOKEN_MS })).toString('base64url');
    return `${dados}.${assinar(dados)}`;
}

function lerToken(token) {
    if (typeof token !== 'string' || !token.includes('.')) return null;
    const [dados, assinatura] = token.split('.');
    const esperada = Buffer.from(assinar(dados));
    const recebida = Buffer.from(assinatura || '');
    if (esperada.length !== recebida.length || !crypto.timingSafeEqual(esperada, recebida)) return null;
    try {
        const { login, exp } = JSON.parse(Buffer.from(dados, 'base64url').toString());
        return exp > Date.now() ? login : null;
    } catch {
        return null;
    }
}

module.exports = { gerarHash, conferirSenha, gerarToken, lerToken };
