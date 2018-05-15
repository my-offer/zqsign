# README

## Example

```js
const fs = require('fs')
const path = require('path')
const http = require('http')

const querystring = require('querystring')

const ZQSign = require('./lib/zqsign').ZQSign

const zqurl = 'http://test.sign.zqsign.com:8081'
const zqid = 'ZQABA206A379B342FB987B8DCCBA679549'
const privateKey = fs.readFileSync(path.join(__dirname, './zq-1-private-key.test.pem')).toString()
const publicKey = fs.readFileSync(path.join(__dirname, './zq-1-public-key.test.pub.pem')).toString()

const sign = new ZQSign(zqurl, zqid, privateKey, publicKey, {alg: 'RSA-SHA1'})

sign.personReg(user.user_code, user.name, user.id_card_no, user.mobile).then((result) => {

}).catch((err) => {

})
```
