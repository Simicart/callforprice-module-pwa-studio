/**
 * Mappings for overwrites
 * example: [`@magento/venia-ui/lib/components/Main/main.js`]: './lib/components/Main/main.js'
 */
module.exports = componentOverride = {
    ['@magento/venia-ui/lib/components/ProductFullDetail/productFullDetail.js']: '@simicart/CallForPrice/src/override/ProductDetail/productFullDetail.js',
    ['@magento/venia-ui/lib/components/Gallery/gallery.js']: '@simicart/CallForPrice/src/override/Gallery/gallery.js',
    ['@magento/venia-ui/lib/RootComponents/Category/category.js']: '@simicart/CallForPrice/src/override/Category/category.js',
    ['@magento/venia-ui/lib/queries/getCustomer.graphql']: '@simicart/CallForPrice/src/override/Category/getCustomer.graphql'
};
