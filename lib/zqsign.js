
const assert = require('assert')
const http = require('http')
const querystring = require('querystring')
const request = require('request-promise')
const Promise = require('bluebird')
const lodash = require('lodash')
const retry = require('retry')

const Signer = require('./signer').Signer

// http://doc.sign.zqsign.com/askCode.html
class ZQSign {
    constructor (url, zqid, privateKey, publicKey, options = {}) {
        this.url = url
        this.webIdentifyUrl = options.webIdentifyUrl
        this.zqid = zqid
        this.signer = new Signer(privateKey, publicKey, {alg: 'RSA-SHA1'})
        this.return_url = options.return_url
        this.notify_url = options.notify_url
    }

    markupAndSignFromData(formData) {
        formData.zqid = this.zqid
        const signature = this.signer.signQuery(formData)
        assert.ok(this.signer.verifyQuery(formData, signature), 'isVerified false')
        formData.sign_val = signature
        return formData
    }

    doRequest(options, formData) {
        const fetch = (cb) => {
            const operation = retry.operation({
                retries: 5,
                factor: 3,
                minTimeout: 1 * 1000,
                maxTimeout: 60 * 1000,
                randomize: true,
            })

            operation.attempt(() => {
                const urlKey = options.urlKey || 'url'
                console.log(`${this[urlKey]}${options.path}`)
                return request({
                    method: options.method || 'POST',
                    uri: `${this[urlKey]}${options.path}`,
                    json: true,
                    formData: this.markupAndSignFromData(formData),
                    resolveWithFullResponse: true,
                    followRedirect: false
                }).then((resp) => {
                    if (resp.statusCode >= 500) {
                        operation.retry(new Error(http.STATUS_CODES[resp.statusCode]))
                    }
                    else {
                        if (options.rawResp) {
                            return cb(null, resp)
                        }
                        else if (resp.statusCode === 200 && resp.body.code === '0') {
                            return cb(null, resp.body)
                        }
                        else {
                            const e = new Error(http.STATUS_CODES[resp.statusCode])
                            e.statusCode = resp.statusCode
                            e.body = resp.body
                            return cb(e)
                        }
                    }

                })
            })
        }

        return Promise.promisify(fetch)()
    }

    personReg(user_code, name, id_card_no, mobile) {
        const options = {path: '/personReg'}
        const formData = {
            user_code, name, id_card_no, mobile
        }
        return this.doRequest(options, formData)
    }

    personRegNV(user_code, name, id_card_no, mobile) {
        const options = {path: '/personRegNV'}
        const formData = {
            user_code, name, id_card_no, mobile
        }
        return this.doRequest(options, formData)
    }

    personUpdate(user_code, name, id_card_no, mobile) {
        const options = {path: '/personUpdate'}
        const formData = {
            user_code, name, id_card_no, mobile
        }
        return this.doRequest(options, formData)
    }

    personUpdateNV(user_code, name, id_card_no, mobile) {
        const options = {path: '/personUpdateNV'}
        const formData = {
            user_code, name, id_card_no, mobile
        }
        return this.doRequest(options, formData)
    }

    uploadPdf(no, name, contract) {
        const options = {path: '/uploadPdf'}
        const formData = {
            no, name, contract
        }
        return this.doRequest(options, formData)
    }

    pdfTemplate(no, name, t_no, contract_val) {
        const options = {path: '/pdfTemplate'}
        if (typeof contract_val === 'object') {

        }
        const formData = {
            no, name, t_no, contract_val
        }
        return this.doRequest(options, formData)
    }

    signAuto(no, signers) {
        const options = {path: '/signAuto'}
        const formData = {
            no, signers: Array.isArray(signers) ? signers.join(',') : signers
        }
        return this.doRequest(options, formData)
    }

    signAutoNI(no, signers) {
        const options = {path: '/signAutoNI'}
        const formData = {
            no, signers: Array.isArray(signers) ? signers.join(',') : signers
        }

        return this.doRequest(options, formData)
    }

    signCheckMark(no, signers) {
        const options = {path: '/signCheckMark'}
        const formData = {
            no, signers: Array.isArray(signers) ? signers.join(',') : signers
        }

        return this.doRequest(options, formData)
    }

    // 此接口由前端访问，FORM表达数据由后端返回
    signView(no, user_code, sign_type) {
        const options = {path: '/signView'}
        const formData = {
            no, user_code, sign_type, notify_url: this.notify_url, return_url: this.return_url
        }

        return this.doRequest(options, formData)
    }

    signViewData(no, user_code, sign_type, return_url) {
        const formData = {
            no, user_code, sign_type, notify_url: this.notify_url, return_url: return_url
        }

        return this.markupAndSignFromData(formData)
    }

    mobileSignView(no, user_code, sign_type) {
        const options = {path: '/mobileSignView'}
        const formData = {
            no, user_code, sign_type, notify_url: this.notify_url, return_url: this.return_url
        }

        return this.doRequest(options, formData)
    }

    videoSignView() {

    }

    videoAuthSignView() {

    }

    getImg(no) {
        const options = {path: '/getImg'}
        const formData = {no}

        return this.doRequest(options, formData)
    }

    getPdfUrl(no) {
        const options = {path: '/getPdfUrl'}
        const formData = {no}

        return this.doRequest(options, formData)
    }

    getPdf(no) {
        const options = {path: '/getPdf'}
        const formData = {no}

        return this.doRequest(options, formData)
    }

    undoSign(no) {
        const options = {path: '/undoSign'}
        const formData = {no}

        return this.doRequest(options, formData)
    }

    completionContract(no) {
        const options = {path: '/completionContract'}
        const formData = {no}

        return this.doRequest(options, formData)
    }

    // http://test.sign.zqsign.com/zqsign-web-identify/test/a2e
    a2e(name, idcard, order_no) {
        console.log(name, idcard, order_no)
        const options = {urlKey: 'webIdentifyUrl', path: '/zqsign-web-identify/test/a2e', rawResp: true}
        const formData = {name, idcard, order_no}

        return this.doRequest(options, formData).then((resp) => {
            console.log(resp.statusCode, resp.body)
            if (resp.statusCode === 200 && resp.body.status === 200) {
                if (resp.body.data.result_code === '1') {
                    return true
                }
                else if (resp.body.data.result_code === '600002') {
                    return false
                }
                else {
                    const e = new Error(http.STATUS_CODES[resp.statusCode])
                    e.statusCode = resp.statusCode
                    e.body = resp.body
                    return Promise.reject(e)
                }
            }
        })
    }
}

ZQSign.SIGN_TYPE = {
    SIGNATURE: 'SIGNATURE',
    SIGNATURECODE: 'SIGNATURECODE',
    WRITTEN: 'WRITTEN',
    WRITTENCODE: 'WRITTENCODE',
    CODE: 'CODE',
}

exports.ZQSign = ZQSign
