# Call For Price  module for Magento PWA Studio

This module acts as an add-on for [Mageplaza's Call For Price extension](https://www.mageplaza.com/magento-2-call-for-price/) to make it work with Magento PWA Studio.

End result: https://callforprice.pwa-commerce.com/

## Requirements

- Magento version 2.4.* or >= 2.3.5
- Got [Mageplaza Call For Price extension](https://www.mageplaza.com/magento-2-call-for-price/) and [Call For Price GraphQL](https://github.com/mageplaza/magento-2-call-for-price-graphql) installed

## Installation

### 1. Init project
```
npm init @magento/pwa@1.1.2
```

Fill in your project information and `cd` into it.

### 2. Start the project

From the root directory of the project you created above, clone the repository:

```
  git clone https://github.com/Simicart/callforprice-module-pwa-studio ./@simicart/callforprice
```

### 3. Modify .env

Change the .env MAGENTO_BACKEND_URL with your Magento site URL, or use our demo URL:

```
  MAGENTO_BACKEND_URL=https://mpmed.pwa-commerce.com/
```
### 4. Modify package.json

Modify the dependencies of your project to add Shop By Brand extension.

```
  "dependencies": {
    "@magento/pwa-buildpack": "~7.0.0",
    "@simicart/callforprice": "link:./@simicart/callforprice"
  },
```

### 5. Install and Start Project

```
  yarn install && yarn watch
```
