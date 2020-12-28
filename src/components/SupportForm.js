
import React from 'react';


class SupportForm extends React.Component {

//don't allow pressing down on enter for text box fields
  onKeyDown = (keyEvent) => {
    if ((keyEvent.charCode || keyEvent.keyCode) === 13) {
      keyEvent.preventDefault();
    }
  }


}

render()
{
  return (

  )
}

export default SupportForm