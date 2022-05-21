/**************************
This is a utility file which is used to import the development data present in the ./dev-data/data/__.json file

**************************/
require('dotenv').config();
const fs = require('fs');
const mongoose = require('mongoose');
const Tour = require('./../models/tour');
const User = require('./../models/user');
const Review = require('./../models/reviewModel');
const util = require('util');
const slug = require('slug');
//STEP-1 : import the fs module {default} and use readFile function to store the file content in the variable

let n = 0;
const dbConfig = async function () {
    try {
        await mongoose.connect(process.env.DATABASE);
        console.log('conected to network');
    } catch (e) {
        console.log(e.message);
        if (n < 10) {
            dbConfig();
            n++;
        } else {
            server.close(() => {
                console.log('server closed');
                process.exit(1);
            });
        }
    }
};

dbConfig();
n = 0;

const promisifiedReadFile = util.promisify(fs.readFile);

const read = async function () {
    try {
        const importData = await promisifiedReadFile(
            `${__dirname}/../dev-data/data/tours.json`,
            'utf-8'
        );
        const json = JSON.parse(importData);
        //console.log(json[0]);
        json.forEach((item) => {
            item.slug = slug(item.name, { lower: true });
        });
        // console.log(json[0]);

        // const tours = await Tour.create(json, { validateBeforeSave: false });
        console.log(' Successfully imported data ');
        process.exit();
    } catch (e) {
        console.log(e);
    }
};

read();
