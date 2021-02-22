import React, {useCallback} from 'react';
import { string, number, shape } from 'prop-types';
import { Link, resourceUrl } from '@magento/venia-drivers';
import {Price, useDropdown} from '@magento/peregrine';
import { transparentPlaceholder } from '@magento/peregrine/lib/util/images';
import { UNCONSTRAINED_SIZE_KEY } from '@magento/peregrine/lib/talons/Image/useImage';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import Image from '@magento/venia-ui/lib/components/Image';
import defaultClasses from './item.css';
import Popup from "reactjs-popup";
import Button from "@magento/venia-ui/lib/components/Button";
import {Form} from "informed";
import {useHistory} from "react-router-dom";
import {useUserContext} from "@magento/peregrine/lib/context/user";

import {useAuthBar} from "@magento/peregrine/lib/talons/AuthBar/useAuthBar";
import {useAccountTrigger} from "@magento/peregrine/lib/talons/Header/useAccountTrigger";
import AccountMenu from "@magento/venia-ui/lib/components/AccountMenu";

// The placeholder image is 4:5, so we should make sure to size our product
// images appropriately.
const IMAGE_WIDTH = 300;
const IMAGE_HEIGHT = 375;

// Gallery switches from two columns to three at 640px.
const IMAGE_WIDTHS = new Map()
    .set(640, IMAGE_WIDTH)
    .set(UNCONSTRAINED_SIZE_KEY, 840);

const ItemPlaceholder = ({ classes }) => (
    <div className={classes.root_pending}>
        <div className={classes.images_pending}>
            <Image
                alt="Placeholder for gallery item image"
                classes={{
                    image: classes.image_pending,
                    root: classes.imageContainer
                }}
                src={transparentPlaceholder}
            />
        </div>
        <div className={classes.name_pending} />
        <div className={classes.price_pending} />
    </div>
);

const GalleryItem = props => {
    const { item } = props;
    const contentStyle = {
        maxWidth: "600px",
        width: "90%",
        height: "600px"
    };

    const [{ isSignedIn: isUserSignedIn }] = useUserContext();

    const classes = mergeClasses(defaultClasses, props.classes);

    const {
        accountMenuIsOpen,
        accountMenuRef,
        accountMenuTriggerRef,
        setAccountMenuIsOpen,
        handleTriggerClick
    } = useAccountTrigger();

    if (!item) {
        return <ItemPlaceholder classes={classes} />;
    }
    let history = useHistory();

    const { name, price, small_image, url_key, url_suffix, mp_callforprice_rule } = item;
    console.log(mp_callforprice_rule)
    const productLink = resourceUrl(`/${url_key}${url_suffix}`);

    if(mp_callforprice_rule.action == "popup_quote_form"){
        return (
            <div className={classes.root}>
                <Link to={productLink} className={classes.images}>
                    <Image
                        alt={name}
                        classes={{
                            image: classes.image,
                            root: classes.imageContainer
                        }}
                        height={IMAGE_HEIGHT}
                        resource={small_image}
                        widths={IMAGE_WIDTHS}
                    />
                </Link>
                <Link to={productLink} className={classes.name}>
                    <span>{name}</span>
                </Link>
                <section className={classes.cartActions}>
                    <Popup trigger={
                        <Button
                            priority="high"
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

                                    <label htmlFor="uname"><b>Username</b></label>
                                    <input id="name" type="text" placeholder="Enter Username"/>

                                    <label htmlFor="phone"><b>Phone</b></label>
                                    <input id="phone" type="text" placeholder="Enter Phone Number"/>

                                    <label htmlFor="email"><b>Email</b></label>
                                    <input id="email" type="text" placeholder="Enter Your Email"/>

                                    <label htmlFor="note"><b>Note</b></label>
                                    <input id="note" type="text" placeholder="Enter Your Note"/>
                                    <button className={classes.btn} type="submit" onClick={close}>Submit</button>
                                </Form>
                            </div>
                        )}
                    </Popup>
                </section>

            </div>
        );
    }
    else if(mp_callforprice_rule.action == "login_see_price"){
        if(!isUserSignedIn){
            return (
                <div className={classes.root}>
                    <Link to={productLink} className={classes.images}>
                        <Image
                            alt={name}
                            classes={{
                                image: classes.image,
                                root: classes.imageContainer
                            }}
                            height={IMAGE_HEIGHT}
                            resource={small_image}
                            widths={IMAGE_WIDTHS}
                        />
                    </Link>
                    <Link to={productLink} className={classes.name}>
                        <span>{name}</span>
                    </Link>
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

                </div>
            );
        }
    }
    else if(mp_callforprice_rule.action == "redirect_url"){
        const redirect = () => {
            let url_redirect = item.mp_callforprice_rule.url_redirect
            if (url_redirect.includes('http'))
                window.location.href = url_redirect;
            else
                history.push(url_redirect)
        }
        return (
            <div className={classes.root}>
                <Link to={productLink} className={classes.images}>
                    <Image
                        alt={name}
                        classes={{
                            image: classes.image,
                            root: classes.imageContainer
                        }}
                        height={IMAGE_HEIGHT}
                        resource={small_image}
                        widths={IMAGE_WIDTHS}
                    />
                </Link>
                <Link to={productLink} className={classes.name}>
                    <span>{name}</span>
                </Link>
                <section className={classes.cartActions}>
                    <Button
                        priority="high"
                        onClick={()=>redirect()}
                    >
                        {item.mp_callforprice_rule.button_label}
                    </Button>
                </section>

            </div>
        );
    }
    return (
        <div className={classes.root}>
            <Link to={productLink} className={classes.images}>
                <Image
                    alt={name}
                    classes={{
                        image: classes.image,
                        root: classes.imageContainer
                    }}
                    height={IMAGE_HEIGHT}
                    resource={small_image}
                    widths={IMAGE_WIDTHS}
                />
            </Link>
            <Link to={productLink} className={classes.name}>
                <span>{name}</span>
            </Link>
            <div className={classes.price}>
                <Price
                    value={price.regularPrice.amount.value}
                    currencyCode={price.regularPrice.amount.currency}
                />
            </div>
        </div>
    );
};

GalleryItem.propTypes = {
    classes: shape({
        image: string,
        imageContainer: string,
        imagePlaceholder: string,
        image_pending: string,
        images: string,
        images_pending: string,
        name: string,
        name_pending: string,
        price: string,
        price_pending: string,
        root: string,
        root_pending: string
    }),
    item: shape({
        id: number.isRequired,
        name: string.isRequired,
        small_image: string.isRequired,
        url_key: string.isRequired,
        price: shape({
            regularPrice: shape({
                amount: shape({
                    value: number.isRequired,
                    currency: string.isRequired
                }).isRequired
            }).isRequired
        }).isRequired
    })
};

export default GalleryItem;
