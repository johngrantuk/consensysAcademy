import React from 'react';

export default class ItemList extends React.Component {
    constructor(props) {
      super(props);
    }

    render() {
      const items = this.props.items;

      return (
        <div>
          {items.map(item =>
            item.name
          )}
        </div>
      );
    }
}
