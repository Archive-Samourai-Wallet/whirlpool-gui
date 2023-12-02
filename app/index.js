import React from 'react';
import { render } from 'react-dom';
import { AppContainer as ReactHotAppContainer } from 'react-hot-loader';
import unhandled from 'electron-unhandled';
import Root from './containers/Root';
import { configureStore, history } from './store/configureStore';

import './app.global.css';
import { logger } from './utils/logger';

const store = configureStore();

const AppContainer = process.env.PLAIN_HMR ? Fragment : ReactHotAppContainer;

// log unhandled exceptions
unhandled({
  showDialog: process.env.NODE_ENV === 'development',
  logger: (e) => {
    logger.error('[RENDER PROCESS] unhandled exception',e)
  },
});

render(
  <AppContainer>
    <Root store={store} history={history} />
  </AppContainer>,
  document.getElementById('root')
);

if (module.hot) {
  module.hot.accept('./containers/Root', () => {
    // eslint-disable-next-line global-require
    const NextRoot = require('./containers/Root').default;
    render(
      <AppContainer>
        <NextRoot store={store} history={history} />
      </AppContainer>,
      document.getElementById('root')
    );
  });
}
