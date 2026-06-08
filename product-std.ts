import {fixMTImgContentURLs, getZDXEAPI, isMTM, parseCookie, parseImgs, sleep} from "./common"
import {walk} from "./json"
import {ImgContent} from "./product-img-content"
import {OfficialProduct, SKU} from "./product-list"
import {BaseShop, getLock} from "./shop"

export interface StdProduct {
    name: string
    isSp: number
    spId: number
    categoryId: string
    categoryIdPath: string
    categoryName: string
    categoryNamePath: string
    imgContent: ImgContent
    imgs: string[]
    skus: SKU[]
}
export function assignStd(product: OfficialProduct, std: StdProduct) {
    product.std = std
    product.isSp = std.isSp
    product.spId = std.spId
    product.categoryId = std.categoryId
    product.categoryIdPath = std.categoryIdPath
    product.categoryName = std.categoryName
    product.categoryNamePath = std.categoryNamePath
    if (
        product.imgContent === undefined
    ) {
        product.imgContent = std.imgContent
    } else {
        product.imgContent.map = std.imgContent.map
        product.imgContent.quaImgs = std.imgContent.quaImgs
        product.imgContent.quaEffectiveDate = std.imgContent.quaEffectiveDate
        product.imgContent.quaApprovalDate = std.imgContent.quaApprovalDate
        if (
            product.imgContent.imgs.length === 0
        ) {
            product.imgContent.imgs = std.imgContent.imgs
        }
    }
    // product.imgs = std.imgs
    const sku = product.skus[0]
    const stdSKU = std.skus[0]
    stdSKU.id = sku.id
    stdSKU.sourceFoodCode = sku.sourceFoodCode
    stdSKU.minOrderCount = sku.minOrderCount
    stdSKU.price = sku.price
    stdSKU.stock = sku.stock
    product.skus[0] = stdSKU
}
export async function testAndAssignStd(product: OfficialProduct, baseShop: BaseShop) {
    for (const sku of product.skus) {
        if (
            sku.upc.length > 0
            || sku.skipUpcImg.length > 0
            || product.imgs.length === 0
        ) {
            continue
        }
        if (
            product.imgs.length === 1
        ) {
            sku.skipUpcImg = `${product.imgs[0]},${product.imgs[0]}`
            continue
        }
        sku.skipUpcImg = `${product.imgs[0]},${product.imgs[1]}`
    }
    if (
        product.std !== undefined
    ) {
        assignStd(product, product.std)
        return true
    }
    if (
        product.skus.length === 0
    ) {
        return true
    }
    const {upc} = product.skus[0]
    if (
        upc.length === 0
    ) {
        // if (
        //     isMTM(baseShop.cookie)
        // ) {
        //     product.categoryId = '400000836'
        //     product.categoryIdPath = '400000834,400000835,400000836'
        // }
        return true
    }
    await getLock()
    const std = await getProductStd(baseShop, upc)
    if (
        std === undefined
    ) {
        console.error(`Fail to get std for ${upc}`)
        return
    }
    assignStd(product, std)
    return true
}
async function mtRetail(baseShop: BaseShop, upc: string) {
    const {cookie, officialId} = baseShop
    const jar = parseCookie(cookie)
    const token = jar.get('token')
    const region_id = jar.get('region_id')
    const region_version = jar.get('region_version')
    const acctId = jar.get('acctId')
    if (
        token === undefined
        || region_id === undefined
        || region_version === undefined
        || acctId === undefined
    ) {
        return
    }
    const shopCategory = jar.get('shopCategory')
    let baseURL: string
    if (
        shopCategory === 'medicine'
    ) {
        baseURL = 'https://yiyao.meituan.com/reuse/health/product/retail/r/getSpDetailByEanWithStatus'
    } else {
        baseURL = 'https://shangoue.meituan.com/reuse/sc/product/retail/r/getSpDetailByEan'
    }
    try {
        const zdxEAPI = await getZDXEAPI()
        if (
            zdxEAPI === undefined
        ) {
            return
        }
        const {fetch} = zdxEAPI
        const res = await fetch(`${baseURL}?region_id=${region_id}&region_version=${region_version}`, {
            "headers": {
                "accept": "application/json, text/plain, */*",
                "content-type": "application/x-www-form-urlencoded",
                "m-appkey": shopCategory === 'medicine' ? "fe_com.sankuai.medicine.eproduct.vue" : "fe_waimai_sc_fe_product",
                cookie,
            },
            "body": `ean=${upc}&wmPoiId=${officialId}`,
            "method": "POST"
        })
        if (
            typeof res !== 'string'
        ) {
            console.error(res)
            return
        }
        const json = walk({
            "data": {
                "product": {
                    "isSp": 0,
                    "spId": 0,
                    "ean": "",
                    "name": "盒",
                    "pic": "",
                    "category": {
                        "id": '1',
                        "idPath": '1',
                        "name": "套",
                        "namePath": "成人用品(药),安全避孕,避孕套/安全套",
                    },
                    "categoryAttrMap": [
                        {
                            "attrId": 1200001126,
                            "attrName": "款式特色",
                            "attrType": 3,
                            "inputType": 1,
                            "sequence": 6,
                            "isRequired": 2,
                            "valueList": [
                                {
                                    "value": "韩式花束",
                                    "valueIdPath": "",
                                    "valuePath": "",
                                    "selected": 1,
                                }
                            ],
                        }
                    ],
                    "skus": [
                        {
                            "spec": "",
                            // "limitStock": 0,
                            "unit": "",
                            "weight": 0,
                            "weightUnit": "",
                            "boxPrice": 0,
                            "boxNum": 0,
                            "upcCode": "",
                            "minOrderCount": 0,
                        }
                    ],
                    "spPicContent": "",
                    "quaPictures": [],
                    "quaEffectiveDate": '',
                    "quaApprovalDate": '',
                    // "expPeriod": 0,
                    // "expUnit": 1,
                }
            }
        }, JSON.parse(res))
        if (
            json === undefined
        ) {
            console.error(res)
            return
        }
        const {product} = json.data
        const map: {
            [key: string]: typeof product.categoryAttrMap[0]
        } = {}
        for (const item of product.categoryAttrMap) {
            map[item.attrId.toString()] = item
            item.valueList = item.valueList.filter(value => value.selected === 1)
        }
        const out: StdProduct = {
            name: product.name,
            isSp: product.isSp,
            spId: product.spId,
            categoryId: product.category.id,
            categoryIdPath: product.category.idPath,
            categoryName: product.category.name,
            categoryNamePath: product.category.namePath,
            imgContent: {
                map: JSON.stringify(map),
                imgs: await fixMTImgContentURLs(parseImgs(product.spPicContent)),
                taxBearingType: '',
                quaImgs: product.quaPictures,
                quaApprovalDate: product.quaApprovalDate,
                quaEffectiveDate: product.quaEffectiveDate,
                expirationDate: '',
                skus: []
            },
            imgs: parseImgs(product.pic),
            skus: product.skus.map(value => {
                return {
                    id: '',
                    spec: value.spec,
                    price: 0,
                    stock: 0,
                    unit: value.unit,
                    weight: value.weight,
                    weightUnit: value.weightUnit,
                    boxPrice: value.boxPrice,
                    boxNum: value.boxNum,
                    upc: value.upcCode,
                    sourceFoodCode: '',
                    minOrderCount: value.minOrderCount,
                    skipUpcImg: ''
                }
            })
        }
        return out
    } catch (err) {
        console.error(err)
    }
}
export async function getProductStd(baseShop: BaseShop, upc: string) {
    if (
        baseShop.type === 3
    ) {
        return await mtRetail(baseShop, upc)
    }
}
