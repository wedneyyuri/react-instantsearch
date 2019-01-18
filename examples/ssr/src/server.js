import path from 'path';
import express from 'express';
import React from 'react';
import ReactDOM from 'react-dom/server';
import { findResultsState } from 'react-instantsearch-dom/server';
import { createApp } from './App/createApp';
import template from './template';

const server = express();

server.use('/assets', express.static(path.join(__dirname, 'assets')));

server.get('/', async (req, res) => {
  const { App, props } = createApp();

  // URLSync
  const searchState = {
    query: 'iPhone',
    refinementList: {
      brand: ['Apple'],
    },
  };

  const resultsState = await findResultsState(App, {
    ...props,
    searchState,
  });

  const initialState = {
    resultsState,
    searchState,
  };

  const body = ReactDOM.renderToString(<App {...props} {...initialState} />);

  res.send(
    template({
      title: 'Hello World from the server',
      initialState: JSON.stringify(initialState),
      body,
    })
  );
});

server.listen(8080);

/* eslint-disable no-console */
console.log('listening on 8080');
/* eslint-enable no-console */
