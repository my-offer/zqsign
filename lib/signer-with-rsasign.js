
const rsa = require('jsrsasign')

class RSASigner {
    constructor (privateKey, publicKey, options = {}) {
        this.privateKey = privateKey
        this.passphrase = options.passphrase
        this.publicKey = publicKey
        this.alg = options.alg || 'MD5withRSA'
        this.signtureFormat = options.signtureFormat || 'base64'
    }

    sign(string) {
        const sig = new rsa.Signature({alg: this.alg, prov: "cryptojs/jsrsa"})
        sig.init(this.privateKey)
        return sig.signString(string)
    }

    verify(string, signture) {
        const sig = new rsa.Signature({alg: this.alg, prov: "cryptojs/jsrsa"})
        sig.init(this.publicKey)
        sig.updateString(string)
        return sig.verify(signture)
    }
}

exports.RSASigner = RSASigner
