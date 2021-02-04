import React, { useMemo } from 'react';
import {string, shape, array, func} from 'prop-types';

import { mergeClasses } from '@magento/venia-ui/lib/classify';
import GalleryItem from './item';
import defaultClasses from './gallery.css';


const mapGalleryItem = item => {
    const { small_image } = item;
    return {
        ...item,
        small_image:
            typeof small_image === 'object' ? small_image.url : small_image
    };
};

/**
 * Renders a Gallery of items. If items is an array of nulls Gallery will render
 * a placeholder item for each.
 *
 * @params {Array} props.items an array of items to render
 */
const Gallery = props => {
    const classes = mergeClasses(defaultClasses, props.classes);

    const { items } = props;


    const galleryItems = useMemo(
        () =>
            items.map(item => {
                if (item === null) {
                    return <GalleryItem key={item.id} />;
                }
                return (
                    <GalleryItem key={item.id} item={mapGalleryItem(item)} />
                );
            }),
        [items]
    );
    return (
        <div className={classes.root}>
            <div className={classes.items}>{galleryItems}</div>
        </div>
    );
};

Gallery.propTypes = {
    classes: shape({
        filters: string,
        items: string,
        pagination: string,
        root: string
    }),
    items: array.isRequired
};

export default Gallery;
