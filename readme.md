# Rest api project 
# build using express , mongoose, ejs template engine

# File/Folder structure
<img src="/temp/tourGit.png">
<hr>

## package.json 
<p>

this file is created by running the " npm init -y " , containes the app running scripts , description,dependencies and dev dependencies 

* execute npm run  to get all the scripts present to run the app
</p>


## package-lock.json
<p>
this file is also created by running the " npm init -y " , contains a more elaborated description of dependencies and dev dependencies 

</p>

## index.js 

<p>

This file contains all the configuration of the app all the required packages , user created modules , mounting of routes

configurtion info:
* requiring env config , built in modules , express , ejs packages (line : 1-8)
* including security pkgs : express-rate-limit , helmet , express-mongo-sanitize ,xss-clean , hpp (line : 10-14)
* including the logger pkg (morgan) , utilities such as error class, usser created modules (for routes) (line : 16-23)
* config related to security pkgs, using express built in body populates(express.urlencoded,express.json),setting view engine to ejs,serving static files , config express-rate-limiter (line : 25-62)
* mounting of the required routes (line : 64-79)
* configuring the built in error handler provided by express (line : 85-102)
* exporting app using module.exports = app; (line: 103)
</p>

## server.js
<p>

1. This file contains all the config related to the server and the database
2. database connection is monitored using catching the events " connected, disconnected , error " using mongoose.connection.on('event name',()=>{});  see (line : 33-35)

3. handling of unhandledRejection and uncaughtExceptions (line: 39-50)

</p>

# controllers directory

This directory contains the controlling functionalities of the middleware used in files in <strong> routes directory </strong>

content :

* authControl.js
* handleFactory.js
* reviewControl.js
* tours.js
* users.js
* viewControl.js

## authControl.js file

<p>
This file deals with all the functionality related to user Authentication using <strong> JWT tokens </strong>
<strong> Functionalities </strong>

* creating new user  : using User.create({}) and issuing a login jwt token to the user (line: 12-54)

* logging in user :  handled using exports.login function (line: 56-113)

* logout user : handled using exports.logout function (line: 115-123)

* protecting the paths : handled using exports.protect function (line: 127-175)

working of protect middleware:

1. obtain the JWT token from the req.headers.authorization or req.cookies 
2. decode the token using decode function provided by jsonwebtoken npm pkg
3. find the user using the info provided in decoded jwt
4. check if the user recently changed the password using the passwordChangedAt field provided on user 
5. if any error originate at any place then call  return next(error) , this will trigger the express error handler

* check user is logged in or not : handled using function exports.isLogged  if user is present then put it in <strong> res.locals </strong> so, now user will be present accross all templates in views directory (line: 177-211)

* authorization : is handled using exports.authorization based on property role on user (line: 213-226) 

* get the current user : handled using exports.me (line: 228-237)

* forgot Password : handled using exports.forgotPassword function this will find the user based on provided email and save a reset token to it and send the email to the user for resetting request (line: 239-264)

working of forgot password 
1. input the user with the registered email
2. check if the user exists
3. generate the password reset token refer to <strong> models/user.js  </strong>
4. send unencrypted token to user and save the encrypted token to database also add an token expiration time to token

* reset Password : handled using exports.resetPassword function (line: 266-312)

working of reset password
1. get the reset token from email and find the user on the basis of it and check for token expiration
2. replace the password with the new one and save the user this time validators must be run so, user.save({validateBeforSave: true})

* update password: handled using exports.updatePassword function (line: 314-356)

working of update password
1. this route must be protected using protect middleware , 
2. get the user from req.user and use User.findById({req.user.id}).select("+password") to show the password
3. obtain new password and password confirm from req.body
4. user.save() , don't use findByIdAndUpdate or findOneAndUpdate as they don't trigger the pre and post middlewares
</p>

## handleFactory.js 

<p>
this file contains 3 function which uses the closures to avoid the repetition of code containing 

* findById
* findByIdAndUpdate
* findByIdAndDelete
</p>

## reviewControl.js

This file contains functionalities related to reviews  the functionalities includes

1. get all reviews (line : 5-18)
2. create a new review (line:20-29)
3. get one review using ID
4. update review
5. delete review 

functionalities 3,4,5 are implemented using functions in <strong>handleFactory.js</strong>

## tours.js 

This file contains functionalities related to tours Model  the functionalities includes

1. get all tours (line : 7-29)
2. create a new review (line:31-44)
3. get one tour using ID
4. update tour based on ID
5. delete tour
6. update by put request  (line : 55-80)
7. aggregation pipeline  (line: 82-100)

functionalities 3,4,5 are implemented using functions in <strong>handleFactory.js</strong>

## users.js 

This file contains functionalities related to user Model  the functionalities includes

1. get all users (line : 11-26)
2. get one user using ID
3. update user info otherthan password (line: 30-77)
4. delete user  (line: 109-118)

## viewControl.js

This file contains functionalities related to template engine for rendering the ejs templates as requirement

<hr>

# models directory

This directory contains the mongoose models for user , tour , review

## reviewModel.js

This file contains the schema design for the reviews have
review : String
createdAt : Date
rating : Number
tourRef : parent referencing
userRef : parent referencing

## tour.js

This file contains the schema design for the tours

## user.js

This file contains the schema design for the users

# utils directory 

## error.js

This file contains the extended error class for better error handling

## features.js

This file contains a class ApiFeatures which handles the functionalities :

1. filtering the instances of models on the basis of mongo query (lt,lte,gt,gte) (line: 6-20)
2. sorting (line: 22-34)
3. selecting the fields required in response (line:36-44)
4. pagination (line:46-54)

## sendEmail.js

This file handles the sending of email using nodemailer npm pkg