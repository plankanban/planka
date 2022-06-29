const bcrypt = require('bcrypt');
const validator = require('validator');
const ldap = require('ldapjs');
const createUser = require('../users/create');
const { NULL } = require('node-sass');

const Errors = {
  INVALID_EMAIL_OR_USERNAME: {
    invalidEmailOrUsername: 'Invalid email or username',
  },
  INVALID_PASSWORD: {
    invalidPassword: 'Invalid password',
  },
  INVALID_LDAP: {
    invalidLdap: 'Ldap authentication failed',
  },
};

module.exports = {
  inputs: {
    emailOrUsername: {
      type: 'string',
      custom: (value) =>
        value.includes('@')
          ? validator.isEmail(value)
          : value.length >= 3 &&
            value.length <= 16 &&
            /^[a-zA-Z0-9]+((_|\.)?[a-zA-Z0-9])*$/.test(value),
      required: true,
    },
    password: {
      type: 'string',
      required: true,
    },
  },

  exits: {
    invalidEmailOrUsername: {
      responseType: 'unauthorized',
    },
    invalidPassword: {
      responseType: 'unauthorized',
    },
    invalidLdap: {
      responseType: 'unauthorized',
    },
  },

 

  async fn(inputs) {

    if(process.env.LDAP_SERVER){
      console.log('AUTH mode : LDAP');

      const server = process.env.LDAP_SERVER;
      const client = ldap.createClient({
          url: `ldap://${server}`
      });
  
      var token_value = new Promise((resolve) => { client.bind(inputs.emailOrUsername, inputs.password, async (err) => {
        var user;
        var token;
        if(!err){
          console.log('AD connection success');
          user = await sails.helpers.users.getOneByEmailOrUsername(inputs.emailOrUsername);
          if (!user) {
            console.log('Non-existent Planka user: creation in progress');
            await createUser.fn({
              "email": inputs.emailOrUsername,
              "password": inputs.password,
              "isAdmin": false,
              "name": inputs.emailOrUsername,
              "subscribeToOwnCards": false,
              "createdAt": "date",
              "updatedAt": "date"
            });
            user = await sails.helpers.users.getOneByEmailOrUsername(inputs.emailOrUsername);
          }
          token = await sails.helpers.utils.signToken(user.id);
          resolve(token);
        }if(err){
          console.log('AD connection failure');
          token = '';
          resolve(token);
        } 
      })});
  
      // ADMIN CONNEXION
      if (await token_value==''){ 
        if(inputs.emailOrUsername=='admin' || inputs.emailOrUsername=='admin@admin.admin') {

          console.log('ADMIN CONNEXION');

          var user = await sails.helpers.users.getOneByEmailOrUsername(inputs.emailOrUsername);
    
          if (!user) {
            throw Errors.INVALID_EMAIL_OR_USERNAME;
          }
      
          if (!bcrypt.compareSync(inputs.password, user.password)) {
            throw Errors.INVALID_PASSWORD;
          }
      
          return {
            item: sails.helpers.utils.signToken(user.id),
          };
        }
        throw Errors.INVALID_LDAP;
      }

  
      return {
        item:  await token_value,
      };



    }else{ // NO LDAP AUTH in .env
      console.log('AUTH mode : Normal DB');

      const user = await sails.helpers.users.getOneByEmailOrUsername(inputs.emailOrUsername);

      if (!user) {
        throw Errors.INVALID_EMAIL_OR_USERNAME;
      }
  
      if (!bcrypt.compareSync(inputs.password, user.password)) {
        throw Errors.INVALID_PASSWORD;
      }
  
      return {
        item: sails.helpers.utils.signToken(user.id),
      };


    } 
    
    

  },
};