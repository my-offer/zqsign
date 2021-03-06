
const test = require('ava')

const fs = require('fs')
const path = require('path')
const http = require('http')

const querystring = require('querystring')

const ZQSign = require('../lib/zqsign').ZQSign

const url = 'http://test.sign.zqsign.com:8081'
const webIdentifyUrl = 'http://test.sign.zqsign.com'
const zqid = 'ZQABA206A379B342FB987B8DCCBA679549'
const privateKey = fs.readFileSync(path.join(__dirname, './key/zq-1-private-key.test.pem')).toString()
const publicKey = fs.readFileSync(path.join(__dirname, './key/zq-1-public-key.test.pub.pem')).toString()

const sign = new ZQSign(url, zqid, privateKey, publicKey, {
    alg: 'RSA-SHA1',
    webIdentifyUrl: webIdentifyUrl,
    return_url: 'http://myoffer.cn/zqsign/notify_url',
    notify_url: 'http://myoffer.cn/zqsign/return_url',
})

const faker = require('faker')

faker.locale = "zh_CN"

function fakeId() {
    return faker.random.uuid()
}

const user = {
    user_code: '573043088c213602adcb8770',
    name: '名字必须是汉字',
    id_card_no: '666888200101010000',
    mobile: '13000000000',
}

test.before('注册用户', async (t) => {
    try {
        await sign.personReg(user.user_code, user.name, user.id_card_no, user.mobile)
    }
    catch (err) {
        
    }
    t.pass()
})

const contract = {
    no: fakeId(),
    name: '合同协议书'
}

test.before('上传合同', async (t) => {
    const pdfFileContent = fs.readFileSync(path.join(__dirname, './fixtures/contract.pdf'))
    const pdfFileContentBase64 = Buffer.from(pdfFileContent).toString('base64')
    const result = await sign.uploadPdf(contract.no, contract.name, pdfFileContentBase64)
    t.is(result.code, '0')
})

test.only('personReg', async (t) => {
    const result = await sign.personReg(fakeId(), '杨正祥', '533527198909210238', user.mobile)
    t.is(result.code, '0')
})

test('personRegNV', async (t) => {
    const result = await sign.personReg(fakeId(), user.name, user.id_card_no, user.mobile)
    t.is(result.code, '0')
})

test('personUpdate', async (t) => {
    const result = await sign.personUpdate(user.user_code, user.name + '更新', user.id_card_no, user.mobile)
    t.is(result.code, '0')
})

test('personUpdateNV', async (t) => {
    const result = await sign.personUpdateNV(user.user_code, user.name + '更新', user.id_card_no, user.mobile)
    t.is(result.code, '0')
})

test('pdfTemplate', async (t) => {
    const t_no = 'bf4a24f22da44afaba254918febd7ce9'
    const no = fakeId()
    const contract_val = JSON.stringify({
        jsonVal: [
            {Signer1: '', Signer2: '', 承租方: '张三', 出租方: '李四'}
        ]
    })
    const result = await sign.pdfTemplate(no, '合同协议书', t_no, contract_val)
    t.is(result.code, '0')

    const r = await sign.getPdfUrl(no)
    t.is(r.code, '0')
})

test('signAuto', async (t) => {
    const result = await sign.signAuto(contract.no, [user.user_code])
    t.is(result.code, '0')
})

test('signAutoNI', async (t) => {
    const result = await sign.signAutoNI(contract.no, [user.user_code])
    t.is(result.code, '0')
})

test('signCheckMark', async (t) => {
    const result = await sign.signCheckMark(contract.no, [user.user_code])
    t.is(result.code, '0')
})

test.skip('signView', async (t) => {
    sign.signView(contract.no, user.user_code, ZQSign.SIGN_TYPE.CODE)
    t.pass()
})

test.skip('mobileSignView', async (t) => {
    sign.mobileSignView(contract.no, user.user_code, ZQSign.SIGN_TYPE.CODE)
    t.pass()
})

test('getImg', async (t) => {
    const result = await sign.getImg(contract.no)
    t.is(result.code, '0')
})

test('getPdfUrl', async (t) => {
    const result = await sign.getPdfUrl(contract.no)
    t.is(result.code, '0')
})

test('completionContract', async (t) => {
    const result = await sign.completionContract(contract.no)
    t.is(result.code, '0')
})

test('a2e', async (t) => {
    // t.is(await sign.a2e('任无你好啊', '150203199512020462', 1, '/zqsign-web-identify/test/a2e'), true)
    t.is(await sign.a2e('杨正祥', '533527198909210238', 3, '/a2e'), true)
})
