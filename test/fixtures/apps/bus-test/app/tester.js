'use strict';

let payload = null;

const getPayload = () => payload;

const setPayload = value => {
  payload = value;
};

module.exports = { getPayload, setPayload };
