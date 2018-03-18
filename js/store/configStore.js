import { applyMiddleware, createStore } from 'redux';
import createLogger from 'redux-logger';
import rootReducer from '../reducers/root';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../sagas/rootSaga';

export const isDebuggingInChrome = __DEV__ && !!window.navigator.userAgent;
const sagaMiddleware = createSagaMiddleware();
const logger = createLogger({
  predicate: (getState, action) => isDebuggingInChrome,
  collapsed: true,
  duration: true,
});

function configStore(onComplete: ?() => void) {
  const store = createStore(
    rootReducer,
    applyMiddleware(logger, sagaMiddleware)
  );

  sagaMiddleware.run(rootSaga, store.dispatch);

  if (isDebuggingInChrome) {
    window.store = store;
  }

  return store;
};


export default configStore;
