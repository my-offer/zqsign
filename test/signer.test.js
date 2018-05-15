
const fs = require('fs')
const path = require('path')

const test = require('ava')

const Signer = require('../lib/signer').Signer

const privateKey = fs.readFileSync(path.join(__dirname, './key/zq-1-private-key.test.pem')).toString()
const publicKey = fs.readFileSync(path.join(__dirname, './key/zq-1-public-key.test.pub.pem')).toString()


const signer = new Signer(privateKey, publicKey, {alg: 'SHA256', passphrase: 'lyj`123'})

test('sign and verify', (t) => {
    const content = 'a=1&b=2&c=3'
    t.true(signer.verify(content, signer.sign(content)))
})

test('signQuery and verifyQuery', (t) => {
    const query = {a: 1, b: 2, c: 3}
    t.true(signer.verifyQuery(query, signer.signQuery(query)))
})
