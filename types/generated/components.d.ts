import type { Schema, Struct } from '@strapi/strapi';

export interface BannerBanner extends Struct.ComponentSchema {
  collectionName: 'components_banner_banners';
  info: {
    description: '';
    displayName: 'banner';
    icon: 'apps';
  };
  attributes: {
    description: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface BannerFlight extends Struct.ComponentSchema {
  collectionName: 'components_banner_flights';
  info: {
    displayName: 'flight';
  };
  attributes: {
    airline_name: Schema.Attribute.String;
    arrival_detail: Schema.Attribute.String;
    baggage_kg: Schema.Attribute.Decimal;
    departure_detail: Schema.Attribute.String;
    flight_included: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    flight_type: Schema.Attribute.Enumeration<['Direct', 'Connecting']>;
    seat_type: Schema.Attribute.Enumeration<
      [
        'Window',
        'Aisle',
        'Middle',
        'Front',
        'Rear',
        'Exit_Row',
        'Bulkhead',
        'VIP',
        'Economy',
        'Business',
        'First_Class',
      ]
    > &
      Schema.Attribute.DefaultTo<'Economy'>;
    transit_city: Schema.Attribute.String;
  };
}

export interface BannerHotelDetails extends Struct.ComponentSchema {
  collectionName: 'components_banner_hotel_details';
  info: {
    displayName: 'hotel_details';
  };
  attributes: {
    address: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    distance: Schema.Attribute.String;
    google_rating: Schema.Attribute.Decimal;
    lat: Schema.Attribute.Decimal;
    lng: Schema.Attribute.Decimal;
    name: Schema.Attribute.String;
    nights: Schema.Attribute.Integer;
    phone: Schema.Attribute.String;
    photo_references: Schema.Attribute.JSON;
    place_id: Schema.Attribute.String;
    rating: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        ['1-star', '2-star', '3-star', '4-star', '5-star', '6-star', '7-star']
      > &
      Schema.Attribute.SetMinMax<
        {
          max: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<'[]'>;
    walking_time: Schema.Attribute.String;
    website: Schema.Attribute.String;
  };
}

export interface BannerMetaTags extends Struct.ComponentSchema {
  collectionName: 'components_banner_meta_tags';
  info: {
    displayName: 'meta_tags';
  };
  attributes: {
    description: Schema.Attribute.Text;
    keywords: Schema.Attribute.Text;
    og_image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
    title: Schema.Attribute.String;
  };
}

export interface BannerMpBanner extends Struct.ComponentSchema {
  collectionName: 'components_banner_mp_banners';
  info: {
    displayName: 'mp_banner';
  };
  attributes: {
    description: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

export interface BannerTransport extends Struct.ComponentSchema {
  collectionName: 'components_banner_transports';
  info: {
    displayName: 'transport';
  };
  attributes: {
    ac_transport: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    makkah_to_madina: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    transport_type: Schema.Attribute.JSON &
      Schema.Attribute.CustomField<
        'plugin::multi-select.multi-select',
        ['Bus', 'Private Car', 'Luxury Coach']
      > &
      Schema.Attribute.DefaultTo<'[]'>;
  };
}

export interface LinksLinks extends Struct.ComponentSchema {
  collectionName: 'components_links_links';
  info: {
    displayName: 'Links';
  };
  attributes: {
    categories: Schema.Attribute.Relation<
      'oneToMany',
      'api::category.category'
    >;
    cities: Schema.Attribute.Relation<'oneToMany', 'api::city.city'>;
    pages: Schema.Attribute.Relation<'oneToMany', 'api::page.page'>;
    settings: Schema.Attribute.Relation<'oneToMany', 'api::setting.setting'>;
  };
}

export interface LinksLocation extends Struct.ComponentSchema {
  collectionName: 'components_links_locations';
  info: {
    displayName: 'location';
    icon: 'pinMap';
  };
  attributes: {
    latitude: Schema.Attribute.String;
    longitude: Schema.Attribute.String;
  };
}

export interface LinksSettingBanner extends Struct.ComponentSchema {
  collectionName: 'components_links_setting_banners';
  info: {
    displayName: 'setting_banner';
  };
  attributes: {
    description: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images' | 'files' | 'videos' | 'audios'>;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'banner.banner': BannerBanner;
      'banner.flight': BannerFlight;
      'banner.hotel-details': BannerHotelDetails;
      'banner.meta-tags': BannerMetaTags;
      'banner.mp-banner': BannerMpBanner;
      'banner.transport': BannerTransport;
      'links.links': LinksLinks;
      'links.location': LinksLocation;
      'links.setting-banner': LinksSettingBanner;
    }
  }
}
