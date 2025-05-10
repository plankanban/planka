/**
 * Default model settings
 * (sails.config.models)
 *
 * Your default, project-wide model settings. Can also be overridden on a
 * per-model basis by setting a top-level properties in the model definition.
 *
 * For details about all available model settings, see:
 * https://sailsjs.com/config/models
 *
 * For more general background on Sails model settings, and how to configure
 * them on a project-wide or per-model basis, see:
 * https://sailsjs.com/docs/concepts/models-and-orm/model-settings
 */

module.exports.models = {
  /**
   *
   * Whether model methods like `.create()` and `.update()` should ignore
   * (and refuse to persist) unrecognized data-- i.e. properties other than
   * those explicitly defined by attributes in the model definition.
   *
   * To ease future maintenance of your code base, it is usually a good idea
   * to set this to `true`.
   *
   * > Note that `schema: false` is not supported by every database.
   * > For example, if you are using a SQL database, then relevant models
   * > are always effectively `schema: true`.  And if no `schema` setting is
   * > provided whatsoever, the behavior is left up to the database adapter.
   * >
   * > For more info, see:
   * > https://sailsjs.com/docs/concepts/orm/model-settings#?schema
   *
   */

  // schema: true,

  /**
   *
   * How and whether Sails will attempt to automatically rebuild the
   * tables/collections/etc. in your schema.
   *
   * > Note that, when running in a production environment, this will be
   * > automatically set to `migrate: 'safe'`, no matter what you configure
   * > here.  This is a failsafe to prevent Sails from accidentally running
   * > auto-migrations on your production database.
   * >
   * > For more info, see:
   * > https://sailsjs.com/docs/concepts/orm/model-settings#?migrate
   *
   */

  migrate: 'safe',

  /**
   *
   * Base attributes that are included in all of your models by default.
   * By convention, this is your primary key attribute (`id`), as well as two
   * other timestamp attributes for tracking when records were last created
   * or updated.
   *
   * > For more info, see:
   * > https://sailsjs.com/docs/concepts/orm/model-settings#?attributes
   *
   */

  attributes: {
    id: {
      type: 'string',
      autoIncrement: true,
    },
    createdAt: {
      type: 'ref',
      columnName: 'created_at',
    },
    updatedAt: {
      type: 'ref',
      columnName: 'updated_at',
    },
  },

  beforeCreate(valuesToSet, proceed) {
    valuesToSet.createdAt = new Date().toISOString(); // eslint-disable-line no-param-reassign

    proceed();
  },

  beforeUpdate(valuesToSet, proceed) {
    valuesToSet.updatedAt = new Date().toISOString(); // eslint-disable-line no-param-reassign

    proceed();
  },

  /**
   *
   * The set of DEKs (data encryption keys) for at-rest encryption.
   * i.e. when encrypting/decrypting data for attributes with `encrypt: true`.
   *
   * > The `default` DEK is used for all new encryptions, but multiple DEKs
   * > can be configured to allow for key rotation.  In production, be sure to
   * > manage these keys like you would any other sensitive credential.
   *
   * > For more info, see:
   * > https://sailsjs.com/docs/concepts/orm/model-settings#?dataEncryptionKeys
   *
   */

  dataEncryptionKeys: {
    default: 'fKSf/hPekelUegjM7IyM/EhHbd7HI9Kiec5Lxy2t+7w=',
  },

  /**
   *
   * Whether or not implicit records for associations should be cleaned up
   * automatically using the built-in polyfill.  This is especially useful
   * during development with sails-disk.
   *
   * Depending on which databases you're using, you may want to disable this
   * polyfill in your production environment.
   *
   * (For production configuration, see `config/env/production.js`.)
   *
   */

  // cascadeOnDestroy: true,

  archiveModelIdentity: false,
};
