import { gql } from '@apollo/client';

import { CartTriggerFragment } from '@magento/venia-ui/lib/components/Header/cartTriggerFragments.gql';
import { MiniCartFragment } from '@magento/venia-ui/lib/components/MiniCart/miniCart.gql';

export const SUBMIT_POPUP_FORM = gql`
    mutation mpCallForPriceRequest(
        $product_id: Int!
        $store_ids: String!
        $name: String!
        $email: String!
        $phone: String!
        $customer_note: String!
    ) {
        mpCallForPriceRequest(
            input: {
                product_id:$product_id
                 store_ids: $store_ids
                 name:$name
                 email:$email
                 phone:$phone
                 customer_note:$customer_note
            }
        ) {
            request_id
            created_at
            sku
            product_id
            item_product
            store_ids
            customer_group_ids
            status
            name
            email
            phone
            customer_note
            internal_note
            rank_request
        }
    }
`;

export const CALL_FOR_PRICE_RULE = gql`
    query cfpRule(
        $sku: String!
    ) {
        products(
            filter: {sku: {eq: $sku}}
        ) {
            items {
               name
               id
               mp_callforprice_rule{
                    rule_id
                    name
                    rule_content
                    store_ids
                    customer_group_ids
                    action
                    url_redirect
                    quote_heading
                    quote_description
                    status
                    show_fields
                    required_fields
                    conditions_serialized
                    attribute_code
                    button_label
                    priority
                    to_date
                    created_at
                    rule_description
                    enable_terms
                    url_terms
                    from_date
               }
            }
        }
    }
`;


export const ADD_CONFIGURABLE_MUTATION = gql`
    mutation addConfigurableProductToCart(
        $cartId: String!
        $quantity: Float!
        $sku: String!
        $parentSku: String!
    ) {
        addConfigurableProductsToCart(
            input: {
                cart_id: $cartId
                cart_items: [
                    {
                        data: { quantity: $quantity, sku: $sku }
                        parent_sku: $parentSku
                    }
                ]
            }
        ) @connection(key: "addConfigurableProductsToCart") {
            cart {
                id
                # Update the cart trigger when adding an item.
                ...CartTriggerFragment
                # Update the mini cart when adding an item.
                ...MiniCartFragment
            }
        }
    }
    ${CartTriggerFragment}
    ${MiniCartFragment}
`;


export const ADD_SIMPLE_MUTATION = gql`
    mutation addSimpleProductToCart(
        $cartId: String!
        $quantity: Float!
        $sku: String!
    ) {
        addSimpleProductsToCart(
            input: {
                cart_id: $cartId
                cart_items: [{ data: { quantity: $quantity, sku: $sku } }]
            }
        ) @connection(key: "addSimpleProductsToCart") {
            cart {
                id
                # Update the cart trigger when adding an item.
                ...CartTriggerFragment
                # Update the mini cart when adding an item.
                ...MiniCartFragment
            }
        }
    }
    ${CartTriggerFragment}
    ${MiniCartFragment}
`;
