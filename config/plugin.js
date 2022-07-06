'use strict';

/** @type Egg.EggPlugin */
exports.sequelize = {
  enable: true,
  package: 'egg-sequelize'
}

exports.redis = {
  enable: true,
  package: 'egg-redis',
  };
  exports.cors = {
    enable: true,
    package: 'egg-cors'
}


exports.validate = {
  enable: true,
  package: 'egg-validate',
};

