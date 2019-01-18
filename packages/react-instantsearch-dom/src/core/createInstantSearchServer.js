import { isEmpty, zipWith } from 'lodash';
import React from 'react';
import { renderToString } from 'react-dom/server';
import algoliasearchHelper from 'algoliasearch-helper';
import { HIGHLIGHT_TAGS } from 'react-instantsearch-core';

const getIndexId = context =>
  context && context.multiIndexContext
    ? context.multiIndexContext.targetedIndex
    : context.ais.mainTargetedIndex;

const hasMultipleIndices = context => context && context.multiIndexContext;

const getSearchParameters = (indexName, searchParameters) => {
  const sharedParameters = searchParameters
    .filter(searchParameter => !hasMultipleIndices(searchParameter.context))
    .reduce(
      (acc, searchParameter) =>
        searchParameter.getSearchParameters(
          acc,
          searchParameter.props,
          searchParameter.searchState
        ),
      new algoliasearchHelper.SearchParameters({
        ...HIGHLIGHT_TAGS,
        index: indexName,
      })
    );

  const derivedParameters = searchParameters
    .filter(searchParameter => hasMultipleIndices(searchParameter.context))
    .reduce((acc, searchParameter) => {
      const indexId = getIndexId(searchParameter.context);

      return {
        ...acc,
        [indexId]: searchParameter.getSearchParameters(
          acc[indexId] || sharedParameters,
          searchParameter.props,
          searchParameter.searchState
        ),
      };
    }, {});

  return {
    sharedParameters,
    derivedParameters,
  };
};

const singleIndexSearch = (helper, parameters) => helper.searchOnce(parameters);

const multiIndexSearch = (
  indexName,
  client,
  helper,
  sharedParameters,
  { [indexName]: mainParameters, ...derivedParameters }
) => {
  const search = [
    helper.searchOnce({
      ...sharedParameters,
      ...mainParameters,
    }),
  ];

  const indexIds = Object.keys(derivedParameters);

  search.push(
    ...indexIds.map(indexId => {
      const parameters = derivedParameters[indexId];

      return algoliasearchHelper(client, parameters.index).searchOnce(
        parameters
      );
    })
  );

  return Promise.all(search).then(results =>
    zipWith([indexName, ...indexIds], results, (indexId, result) =>
      // We attach `indexId` on the results to be able to reconstruct the
      // object client side. We cannot rely on `state.index` anymore because
      // we may have multiple times the same index.
      ({
        ...result,
        _internalIndexId: indexId,
      })
    )
  );
};

const createOnSearchParameters = collector => (
  getWidgetSearchParameters,
  context,
  props,
  searchState
) => {
  collector.push({
    getSearchParameters: getWidgetSearchParameters,
    index: getIndexId(context),
    context,
    props,
    searchState,
  });
};

export const findResultsState = function(App, props) {
  const { indexName, searchClient } = props;

  const searchParameters = [];

  renderToString(
    <App
      {...props}
      onSearchParameters={createOnSearchParameters(searchParameters)}
    />
  );

  const { sharedParameters, derivedParameters } = getSearchParameters(
    indexName,
    searchParameters
  );

  const helper = algoliasearchHelper(searchClient, sharedParameters.index);

  if (isEmpty(derivedParameters)) {
    return singleIndexSearch(helper, sharedParameters);
  }

  return multiIndexSearch(
    indexName,
    searchClient,
    helper,
    sharedParameters,
    derivedParameters
  );
};
