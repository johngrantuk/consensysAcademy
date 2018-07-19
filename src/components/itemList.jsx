import React from 'react';
import Item from './item'

export default class ItemList extends React.Component {

    render() {
      const items = this.props.items;

      return (
        <div>
          {items.map(item =>
            <Item
              key={item.itemNo}
              itemInfo={item}
              contract={this.props.contract}
              account={this.props.account}
              web3={this.props.web3}
              />
          )}
        </div>
      );
    }
}
