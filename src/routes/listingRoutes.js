/*
Author: Soheil Ansari, Cory Lewis
Date: 4/30/19
Description: These routes are specifically for listings. POST '/' route updates filters
*/
const express = require('express');
const listingRoutes = express.Router();
const db = require('../model/database.js');

// listing tpye id - temp
const listing_type = {
  apartment: 1,
  bungalow: 2,
  room: 3,
};

// default listing/index.ejs landing page for site, Cory, Junwei, 4/1/19
listingRoutes.route('/')
  .get((req, res) => {
    db.query('SELECT listings.id, listings.title, listings.description, listings.price, '
      + 'listings.address, listings.thumb, listings.num_bed, listings.num_bath, listing_commute.value '
      + 'FROM listings LEFT JOIN listing_commute '
      + 'ON listings.id = listing_commute.listing_id '
      + 'ORDER BY listings.id')
      .then(([results, fields]) => {
        // if (error) throw error;
        res.render('listing/index', {
          objectArrayFromDb: results,
          body: req.body,
        });
      });
  })
// search query based on title, price, address, description using % Like search
  .post((req, res) => {
    let sql = 'SELECT * FROM listings LEFT JOIN listing_commute ON listings.id = listing_commute.listing_id';
    const conditions = [];


    // listing type id - temp solution
    if (req.body.listingType !== '') {
      const id = listing_type[req.body.listingType];
      conditions.push(`listings.listing_type_id = ${id}`);
    }

    if (req.body.keyword !== '') {
      const k = db.escape(`%${req.body.keyword}%`);
      conditions.push(`(listings.title LIKE ${k} OR listings.price LIKE ${k} OR listings.address LIKE ${k} OR listings.description LIKE ${k})`);
    }

    //Prices
    const prices = [];
    if (typeof (req.body.price1) !== 'undefined') prices.push('listings.price <= 500');
    if (typeof (req.body.price2) !== 'undefined') prices.push('listings.price >= 500 AND listings.price <= 1000');
    if (typeof (req.body.price3) !== 'undefined') prices.push('listings.price >= 1000 AND listings.price <= 1500');
    if (typeof (req.body.price4) !== 'undefined') prices.push('listings.price >= 1500 AND listings.price <= 2000');
    if (typeof (req.body.price5) !== 'undefined') prices.push('listings.price >= 2000 AND listings.price <= 2500');
    if (typeof (req.body.price6) !== 'undefined') prices.push('listings.price >= 2500 AND listings.price <= 3000');
    if (typeof (req.body.price7) !== 'undefined') prices.push('listings.price >= 3000');
    const priceSql = prices.join(' OR ');
    if (priceSql !== '') conditions.push(priceSql);

    //Bedroom
    const bedrooms = [];
    if (typeof (req.body.bed1) !== 'undefined') bedrooms.push('listings.num_bed = 1');
    if (typeof (req.body.bed2) !== 'undefined') bedrooms.push('listings.num_bed = 2');
    if (typeof (req.body.bed3) !== 'undefined') bedrooms.push('listings.num_bed = 3');
    if (typeof (req.body.bed4) !== 'undefined') bedrooms.push('listings.num_bed = 4');
    if (typeof (req.body.bed5) !== 'undefined') bedrooms.push('listings.num_bed >= 5');
    const bedroomSql = bedrooms.join(' OR ');
    if (bedroomSql !== '') conditions.push(bedroomSql);

    //Bathroom
    const bathrooms = [];
    if (typeof (req.body.bath1) !== 'undefined') bathrooms.push('listings.num_bath = 1');
    if (typeof (req.body.bath2) !== 'undefined') bathrooms.push('listings.num_bath = 2');
    if (typeof (req.body.bath3) !== 'undefined') bathrooms.push('listings.num_bath = 3');
    if (typeof (req.body.bath4) !== 'undefined') bathrooms.push('listings.num_bath >= 4');
    const bathroomSql = bathrooms.join(' OR ');
    if (bathroomSql !== '') conditions.push(bathroomSql);

    // //Distance
    // const distances = [];
    // if (typeof (req.body.distance1) !== 'undefined') distances.push('listings.price <= 500');
    // if (typeof (req.body.distance2) !== 'undefined') distances.push('listings.price >= 500 AND listings.price <= 1000');
    // if (typeof (req.body.distance3) !== 'undefined') distances.push('listings.price >= 1000 AND listings.price <= 1500');
    // if (typeof (req.body.distance4) !== 'undefined') distances.push('listings.price >= 1500 AND listings.price <= 2000');
    // if (typeof (req.body.distance5) !== 'undefined') distances.push('listings.price >= 2000 AND listings.price <= 2500');
    // if (typeof (req.body.distance6) !== 'undefined') distances.push('listings.price >= 2500 AND listings.price <= 3000');
    // if (typeof (req.body.distance7) !== 'undefined') distances.push('listings.price >= 3000');
    // const distanceSql = distances.join(' OR ');
    // if (distanceSql !== '') conditions.push(distanceSql);

    // Put all the conditions together
    if (conditions.length !== 0) {
      sql += ' WHERE ';
      sql += conditions.join(' AND ');
    }
    console.log(sql);
    db.query(sql)
      .then(([results, _]) => {
        res.render('listing/index', {
          body: req.body,
          objectArrayFromDb: results,
        });
      });
  }); // end of post

// load item page and pass listing data from id, (\\d+) one or more integers, Soheil, Poorva, 4/2/19
listingRoutes.route('/:id(\\d+)')
  .get((req, res) => {
    db.query('SELECT * '
    + 'FROM listings '
    + 'WHERE id = ?', req.params.id).then(([results, fields]) => {
      res.render('listing/item', { objectArrayFromDb: results });
    });
  });

// load listing index page given a listing_type for selected listing {ex| bungalow, apartment, house}, Soheil, Poorva,  4/2/19
listingRoutes.route('/:slug/')
  .get((req, res) => {
    db.query('SELECT listings.id, listings.title, listings.price, listings.address, listings.description, thumb '
      + 'FROM listings JOIN listing_type ON listings.listing_type_id = listing_type.id '
      + 'WHERE slug = ?', req.params.slug)
      .then(([results, fields]) => {
        res.render('listing/index', { objectArrayFromDb: results });
      });
  });

module.exports = listingRoutes;
