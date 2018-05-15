
const crypto = require('crypto')

const queryStrinifyAndSort = require('./utils').queryStrinifyAndSort

class Signer {
    constructor (privateKey, publicKey, options = {}) {
        this.privateKey = privateKey
        this.passphrase = options.passphrase
        this.publicKey = publicKey
        this.alg = options.alg || 'RSA-SHA256'
        this.signtureFormat = options.signtureFormat || 'base64'
    }

    sign(content) {
        const signIns = crypto.createSign(this.alg)
        signIns.update(content)
        return signIns.sign({key: this.privateKey, passphrase: this.passphrase}, this.signtureFormat)
    }

    signQuery(query) {
        return this.sign(queryStrinifyAndSort(query))
    }

    verify(content, signture) {
        const verifyIns = crypto.createVerify(this.alg)
        verifyIns.update(content)
        return verifyIns.verify({key: this.publicKey}, signture, this.signtureFormat)
    }

    verifyQuery(query, signture) {
        return this.verify(queryStrinifyAndSort(query), signture)
    }
}
exports.Signer = Signer
