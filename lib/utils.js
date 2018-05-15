
exports.queryStrinifyAndSort = function queryStrinifyAndSort(query) {
    return Object.keys(query).sort()
        .filter((key) => !(!query[key] || key=='sign'))
        .map((key) => `${key}=${query[key]}`).join('&')
}
