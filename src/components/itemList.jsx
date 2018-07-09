import React from 'react';
import Item from './item'

export default class ItemList extends React.Component {

    render() {
      const items = this.props.items;

      return (
        <div>
          {items.map(item =>
            <Item itemInfo={item} key={item.name}></Item>
          )}
        </div>
      );
    }
}
