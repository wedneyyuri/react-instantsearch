import React from 'react';
import ReactDOM from 'react-dom';
import { createApp } from './createApp';

const { App, props } = createApp();

const initialState = window.__APP_INITIAL_STATE__;

delete window.__APP_INITIAL_STATE__;

ReactDOM.hydrate(
  <App {...props} {...initialState} />,
  document.getElementById('root')
);
