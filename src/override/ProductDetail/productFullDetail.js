import React, {Fragment, Suspense, useCallback, useEffect, useState} from 'react';
import {arrayOf, bool, number, shape, string} from 'prop-types';
import {Form} from 'informed';
import {useProductFullDetail} from '@magento/peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import {isProductConfigurable} from '@magento/peregrine/lib/util/isProductConfigurable';

import {mergeClasses} from '@magento/venia-ui/lib/classify';
import Breadcrumbs from '@magento/venia-ui/lib/components/Breadcrumbs';
import Button from '@magento/venia-ui/lib/components/Button';
import Carousel from '@magento/venia-ui/lib/components/ProductImageCarousel';
import FormError from '@magento/venia-ui/lib/components/FormError';
import {fullPageLoadingIndicator} from '@magento/venia-ui/lib/components/LoadingIndicator';
import Quantity from '@magento/venia-ui/lib/components/ProductQuantity';
import RichText from '@magento/venia-ui/lib/components/RichText';
import Popup from "reactjs-popup";
import { useHistory } from 'react-router-dom';
import {useMutation, useQuery} from "@apollo/client";

import defaultClasses from './productFullDetail.css';
import {ADD_CONFIGURABLE_MUTATION, ADD_SIMPLE_MUTATION, CALL_FOR_PRICE_RULE, SUBMIT_POPUP_FORM} from './productFullDetail.gql';
import {Price} from "@magento/peregrine";
import {useUserContext} from "@magento/peregrine/lib/context/user";
import {useAuthBar} from "@magento/peregrine/lib/talons/AuthBar/useAuthBar";
import {useAccountTrigger} from "@magento/peregrine/lib/talons/Header/useAccountTrigger";
import {useHeader} from "@magento/peregrine/lib/talons/Header/useHeader";
import AccountMenu from "@magento/venia-ui/lib/components/AccountMenu";

const Options = React.lazy(() => import('@magento/venia-ui/lib/components/ProductOptions'));

// Correlate a GQL error message to a field. GQL could return a longer error
// string but it may contain contextual info such as product id. We can use
// parts of the string to check for which field to apply the error.
const ERROR_MESSAGE_TO_FIELD_MAPPING = {
    'The requested qty is not available': 'quantity',
    'Product that you are trying to add is not available.': 'quantity',
    "The product that was requested doesn't exist.": 'quantity'
};

// Field level error messages for rendering.
const ERROR_FIELD_TO_MESSAGE_MAPPING = {
    quantity: 'The requested quantity is not available.'
};

const ProductFullDetail = props => {
    const { product } = props;

    const [{ isSignedIn: isUserSignedIn, currentUser: currentUser }] = useUserContext();

    console.log(currentUser)

    const talonProps = useProductFullDetail({
        addConfigurableProductToCartMutation: ADD_CONFIGURABLE_MUTATION,
        addSimpleProductToCartMutation: ADD_SIMPLE_MUTATION,
        product
    });


    const {
        breadcrumbCategoryId,
        errorMessage,
        handleAddToCart,
        handleSelectionChange,
        handleSetQuantity,
        isAddToCartDisabled,
        mediaGalleryEntries,
        productDetails,
        quantity
    } = talonProps;

    const {
        accountMenuIsOpen,
        accountMenuRef,
        accountMenuTriggerRef,
        setAccountMenuIsOpen,
        handleTriggerClick
    } = useAccountTrigger();

    const [mpCallForPriceRequest, {data}] = useMutation(SUBMIT_POPUP_FORM);

    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [customer_note, setCustomer_note] = useState('');

    const classes = mergeClasses(defaultClasses, props.classes);


    const options = isProductConfigurable(product) ? (
        <Suspense fallback={fullPageLoadingIndicator}>
            <Options
                onSelectionChange={handleSelectionChange}
                options={product.configurable_options}
            />
        </Suspense>
    ) : null;

    const breadcrumbs = breadcrumbCategoryId ? (
        <Breadcrumbs
            categoryId={breadcrumbCategoryId}
            currentProduct={productDetails.name}
        />
    ) : null;

    const errors = new Map();
    if (errorMessage) {
        Object.keys(ERROR_MESSAGE_TO_FIELD_MAPPING).forEach(key => {
            if (errorMessage.includes(key)) {
                const target = ERROR_MESSAGE_TO_FIELD_MAPPING[key];
                const message = ERROR_FIELD_TO_MESSAGE_MAPPING[target];
                errors.set(target, message);
            }
        });

        // Handle cases where a user token is invalid or expired. Preferably
        // this would be handled elsewhere with an error code and not a string.
        if (errorMessage.includes('The current user cannot')) {
            errors.set('form', [
                new Error(
                    'There was a problem with your cart. Please sign in again and try adding the item once more.'
                )
            ]);
        }

        // Handle cases where a cart wasn't created properly.
        if (
            errorMessage.includes('Variable "$cartId" got invalid value null')
        ) {
            errors.set('form', [
                new Error(
                    'There was a problem with your cart. Please refresh the page and try adding the item once more.'
                )
            ]);
        }

        // An unknown error should still present a readable message.
        if (!errors.size) {
            errors.set('form', [
                new Error(
                    'Could not add item to cart. Please check required options and try again.'
                )
            ]);
        }
    }

    const {
        data: brandsData,
    } = useQuery(CALL_FOR_PRICE_RULE, {
        variables: {
            sku: productDetails.sku
        }
    });
    let history = useHistory();

    const contentStyle = {
        maxWidth: "600px",
        width: "90%",
        height: "600px"
    };
    console.log(brandsData)

    function getRule(item){
        if(item.mp_callforprice_rule.action == "popup_quote_form"){
            return (
                <Fragment>
                    {breadcrumbs}
                    <Form className={classes.root}>
                        <section className={classes.title}>
                            <h1 className={classes.productName}>
                                {productDetails.name}
                            </h1>
                        </section>
                        <section className={classes.imageCarousel}>
                            <Carousel images={mediaGalleryEntries} />
                        </section>
                        <FormError
                            classes={{
                                root: classes.formErrors
                            }}
                            errors={errors.get('form') || []}
                        />
                        <section className={classes.options}>{options}</section>
                        <section className={classes.quantity}>
                            <h2 className={classes.quantityTitle}>Quantity</h2>
                            <Quantity
                                initialValue={quantity}
                                onValueChange={handleSetQuantity}
                                message={errors.get('quantity')}
                            />
                        </section>
                        <section className={classes.cartActions}>
                            <Popup trigger={
                                <Button
                                    priority="high"
                                    disabled={isAddToCartDisabled}
                                >
                                    {item.mp_callforprice_rule.button_label}
                                </Button>
                            } modal contentStyle={contentStyle}>
                                {close => (
                                    <div className={classes.modal}>
                                        <a className={classes.modalClose} onClick={close}>
                                            &times;
                                        </a>
                                        <div className={classes.modalHeader}>
                                            {item.mp_callforprice_rule.quote_heading}
                                        </div>
                                        <div className={classes.modalContent}>
                                            {item.mp_callforprice_rule.quote_description}
                                        </div>
                                        <Form className={classes.container}>

                                            <label><b>Username</b></label>
                                            <input onChange={e => setName(e.target.value)} id="name" type="text" placeholder="Enter Username"/>

                                            <label htmlFor="phone"><b>Phone</b></label>
                                            <input onChange={e => setPhone(e.target.value)} id="phone" type="text" placeholder="Enter Phone Number"/>

                                            <label htmlFor="email"><b>Email</b></label>
                                            <input onChange={e => setEmail(e.target.value)} id="email" type="text" placeholder="Enter Your Email"/>

                                            <label htmlFor="note"><b>Note</b></label>
                                            <input onChange={e => setCustomer_note(e.target.value)} id="customer_note" type="text" placeholder="Enter Your Note"/>

                                            <button className={classes.btn} onClick={()=> {
                                                mpCallForPriceRequest({variables: {product_id: item.id, store_ids: item.mp_callforprice_rule.store_ids, name, phone, email, customer_note}})
                                                }
                                            }>Submit</button>
                                        </Form>
                                    </div>
                                )}
                            </Popup>
                        </section>
                        <section className={classes.description}>
                            <h2 className={classes.descriptionTitle}>
                                Product Description
                            </h2>
                            <RichText content={productDetails.description} />
                        </section>
                        <section className={classes.details}>
                            <h2 className={classes.detailsTitle}>SKU</h2>
                            <strong>{productDetails.sku}</strong>
                        </section>
                    </Form>
                </Fragment>
            );
        }
        else if(item.mp_callforprice_rule.action == "login_see_price"){
            if(isUserSignedIn){
                return (
                    <Fragment>
                        {breadcrumbs}
                        <Form className={classes.root}>
                            <section className={classes.title}>
                                <h1 className={classes.productName}>
                                    {productDetails.name}
                                </h1>
                                <p className={classes.productPrice}>
                                    <Price
                                        currencyCode={productDetails.price.currency}
                                        value={productDetails.price.value}
                                    />
                                </p>
                            </section>
                            <section className={classes.imageCarousel}>
                                <Carousel images={mediaGalleryEntries} />
                            </section>
                            <FormError
                                classes={{
                                    root: classes.formErrors
                                }}
                                errors={errors.get('form') || []}
                            />
                            <section className={classes.options}>{options}</section>
                            <section className={classes.quantity}>
                                <h2 className={classes.quantityTitle}>Quantity</h2>
                                <Quantity
                                    initialValue={quantity}
                                    onValueChange={handleSetQuantity}
                                    message={errors.get('quantity')}
                                />
                            </section>
                            <section className={classes.cartActions}>
                                <Button
                                    priority="high"
                                    onClick={handleAddToCart}
                                    disabled={isAddToCartDisabled}
                                >
                                    Add to Cart
                                </Button>
                            </section>
                            <section className={classes.description}>
                                <h2 className={classes.descriptionTitle}>
                                    Product Description
                                </h2>
                                <RichText content={productDetails.description} />
                            </section>
                            <section className={classes.details}>
                                <h2 className={classes.detailsTitle}>SKU</h2>
                                <strong>{productDetails.sku}</strong>
                            </section>
                        </Form>
                    </Fragment>
                );
            }
            return (
                <Fragment>
                    {breadcrumbs}
                    <Form className={classes.root}>
                        <section className={classes.title}>
                            <h1 className={classes.productName}>
                                {productDetails.name}
                            </h1>
                        </section>
                        <section className={classes.imageCarousel}>
                            <Carousel images={mediaGalleryEntries} />
                        </section>
                        <FormError
                            classes={{
                                root: classes.formErrors
                            }}
                            errors={errors.get('form') || []}
                        />
                        <section className={classes.options}>{options}</section>
                        <section className={classes.quantity}>
                            <h2 className={classes.quantityTitle}>Quantity</h2>
                            <Quantity
                                initialValue={quantity}
                                onValueChange={handleSetQuantity}
                                message={errors.get('quantity')}
                            />
                        </section>
                        <section className={classes.cartActions}>
                            <div ref={accountMenuTriggerRef}>
                                <Button
                                    priority="high"
                                    onClick={handleTriggerClick}
                                >
                                    {item.mp_callforprice_rule.button_label}
                                </Button>
                            </div>
                            <AccountMenu
                                ref={accountMenuRef}
                                accountMenuIsOpen={accountMenuIsOpen}
                                setAccountMenuIsOpen={setAccountMenuIsOpen}
                            />
                        </section>
                        <section className={classes.description}>
                            <h2 className={classes.descriptionTitle}>
                                Product Description
                            </h2>
                            <RichText content={productDetails.description} />
                        </section>
                        <section className={classes.details}>
                            <h2 className={classes.detailsTitle}>SKU</h2>
                            <strong>{productDetails.sku}</strong>
                        </section>
                    </Form>
                </Fragment>
            );
        }
        else if(item.mp_callforprice_rule.action == "redirect_url"){
            const redirect = () => {
                let url_redirect = item.mp_callforprice_rule.url_redirect
                if (url_redirect.includes('http'))
                    window.location.href = url_redirect;
                else
                    history.push(url_redirect)
            }
            return (
                <Fragment>
                    {breadcrumbs}
                    <Form className={classes.root}>
                        <section className={classes.title}>
                            <h1 className={classes.productName}>
                                {productDetails.name}
                            </h1>
                        </section>
                        <section className={classes.imageCarousel}>
                            <Carousel images={mediaGalleryEntries} />
                        </section>
                        <FormError
                            classes={{
                                root: classes.formErrors
                            }}
                            errors={errors.get('form') || []}
                        />
                        <section className={classes.options}>{options}</section>
                        <section className={classes.quantity}>
                            <h2 className={classes.quantityTitle}>Quantity</h2>
                            <Quantity
                                initialValue={quantity}
                                onValueChange={handleSetQuantity}
                                message={errors.get('quantity')}
                            />
                        </section>
                        <section className={classes.cartActions}>
                            <Button
                                priority="high"
                                onClick={()=>redirect()}
                            >
                                {item.mp_callforprice_rule.button_label}
                            </Button>
                        </section>
                        <section className={classes.description}>
                            <h2 className={classes.descriptionTitle}>
                                Product Description
                            </h2>
                            <RichText content={productDetails.description} />
                        </section>
                        <section className={classes.details}>
                            <h2 className={classes.detailsTitle}>SKU</h2>
                            <strong>{productDetails.sku}</strong>
                        </section>
                    </Form>
                </Fragment>
            );

        }
        else if(item.mp_callforprice_rule.action == "hide_add_to_cart"){
            return (
                <Fragment>
                    {breadcrumbs}
                    <Form className={classes.root}>
                        <section className={classes.title}>
                            <h1 className={classes.productName}>
                                {productDetails.name}
                            </h1>
                            <p className={classes.productPrice}>
                                <Price
                                    currencyCode={productDetails.price.currency}
                                    value={productDetails.price.value}
                                />
                            </p>
                        </section>
                        <section className={classes.imageCarousel}>
                            <Carousel images={mediaGalleryEntries} />
                        </section>
                        <FormError
                            classes={{
                                root: classes.formErrors
                            }}
                            errors={errors.get('form') || []}
                        />
                        <section className={classes.options}>{options}</section>
                        <section className={classes.quantity}>
                            <h2 className={classes.quantityTitle}>Quantity</h2>
                            <Quantity
                                initialValue={quantity}
                                onValueChange={handleSetQuantity}
                                message={errors.get('quantity')}
                            />
                        </section>

                        <section className={classes.description}>
                            <h2 className={classes.descriptionTitle}>
                                Product Description
                            </h2>
                            <RichText content={productDetails.description} />
                        </section>
                        <section className={classes.details}>
                            <h2 className={classes.detailsTitle}>SKU</h2>
                            <strong>{productDetails.sku}</strong>
                        </section>
                    </Form>
                </Fragment>
            );
        }
        else{
            return (
                <Fragment>
                    {breadcrumbs}
                    <Form className={classes.root}>
                        <section className={classes.title}>
                            <h1 className={classes.productName}>
                                {productDetails.name}
                            </h1>
                            <p className={classes.productPrice}>
                                <Price
                                    currencyCode={productDetails.price.currency}
                                    value={productDetails.price.value}
                                />
                            </p>
                        </section>
                        <section className={classes.imageCarousel}>
                            <Carousel images={mediaGalleryEntries} />
                        </section>
                        <FormError
                            classes={{
                                root: classes.formErrors
                            }}
                            errors={errors.get('form') || []}
                        />
                        <section className={classes.options}>{options}</section>
                        <section className={classes.quantity}>
                            <h2 className={classes.quantityTitle}>Quantity</h2>
                            <Quantity
                                initialValue={quantity}
                                onValueChange={handleSetQuantity}
                                message={errors.get('quantity')}
                            />
                        </section>
                        <section className={classes.cartActions}>
                            <Button
                                priority="high"
                                onClick={handleAddToCart}
                                disabled={isAddToCartDisabled}
                            >
                                Add to Cart
                            </Button>
                        </section>
                        <section className={classes.description}>
                            <h2 className={classes.descriptionTitle}>
                                Product Description
                            </h2>
                            <RichText content={productDetails.description} />
                        </section>
                        <section className={classes.details}>
                            <h2 className={classes.detailsTitle}>SKU</h2>
                            <strong>{productDetails.sku}</strong>
                        </section>
                    </Form>
                </Fragment>
            );
        }

    }
    if (!brandsData)
        return ''
    return brandsData.products.items.map(getRule);

};

ProductFullDetail.propTypes = {
    classes: shape({
        cartActions: string,
        description: string,
        descriptionTitle: string,
        details: string,
        detailsTitle: string,
        imageCarousel: string,
        options: string,
        productName: string,
        productPrice: string,
        quantity: string,
        quantityTitle: string,
        root: string,
        title: string
    }),
    product: shape({
        __typename: string,
        id: number,
        sku: string.isRequired,
        price: shape({
            regularPrice: shape({
                amount: shape({
                    currency: string.isRequired,
                    value: number.isRequired
                })
            }).isRequired
        }).isRequired,
        media_gallery_entries: arrayOf(
            shape({
                label: string,
                position: number,
                disabled: bool,
                file: string.isRequired
            })
        ),
        description: string
    }).isRequired
};

export default ProductFullDetail;
