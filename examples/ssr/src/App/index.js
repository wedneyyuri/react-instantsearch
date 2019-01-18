import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  InstantSearch,
  RefinementList,
  SearchBox,
  Hits,
  Configure,
} from 'react-instantsearch-dom';

class App extends Component {
  state = {
    searchState: this.props.searchState,
  };

  onSearchStateChange = searchState =>
    this.setState(() => ({
      searchState,
    }));

  render() {
    const { searchState } = this.state;

    return (
      <InstantSearch
        {...this.props}
        searchState={searchState}
        onSearchStateChange={this.onSearchStateChange}
      >
        <Configure hitsPerPage={3} />
        <RefinementList attribute="brand" />
        <SearchBox />
        <Hits />
      </InstantSearch>
    );
  }
}

App.propTypes = {
  searchState: PropTypes.object.isRequired,
};

export default App;
