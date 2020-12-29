import React from 'react'

const ModalComponent = ({ children, isShowing, onToggle }) => {
  if (!isShowing) {
    return <></>
  }

  return (
    <div className='modal'>
      <div className='modal-content'>
        <span className='close' onClick={onToggle}>
          &times;
        </span>
        {children}
      </div>
    </div>
  )
}

export default ModalComponent
