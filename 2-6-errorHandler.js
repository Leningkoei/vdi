/// utils.js

let handleError = (error) => console.error(error);

export default {

  foo(f) {

    callWithErrorHandling(f);

  },

  bar(f) {

    callWithErrorHandling(f);

  },

  registerErrorHandler(f) {

    handleError = f;

  }

};

const callWithErrorHandling = (f) => {

  try {

    f && f();

  } catch (error) {

    handleError(error);

  };

};


/// customer

import utils from "utils.js"

utils.registerErrorHandler((error) => {

  console.error(error);

});

utils.foo(() => { /* TODO */ });
utils.bar(() => { /* TODO */ });
