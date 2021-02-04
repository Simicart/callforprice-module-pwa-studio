import { gql } from '@apollo/client';

export const POPUP_FORM = gql`
    mutation submitPopupForm(
        $product_id: Int!
        $store_ids: String!
        $name: String!
        $email: String!
        $phone: String!
        $note: String!
    ) {
        popupForm(
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
               id
               name
               price {
                regularPrice {
                    amount {
                        currency
                        value
                    }
                }
               }
               small_image {
                url
               }
               url_key
               url_suffix
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
