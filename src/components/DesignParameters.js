import React from 'react'
import PropTypes from 'prop-types'

const DesignParameters = ({
  length,
  onLengthChange,
  youngsModulus,
  onYoungsModulusChange,
  secondMomentOfInertia,
  onSecondMomentOfInertiaChange
}) => {
  return (
    <div className='design-inputs-outer-div'>
      <div className='support-div-title'>Design Parameters</div>
      <div className='design-inputs-inner-div'>
        <div className='label-div'>Length:</div>
        <div className='dropdown-div'>
          <input
            type='number'
            value={length}
            onChange={(event) =>
              onLengthChange(Number.parseFloat(event.target.value))
            }
            required
          />
        </div>
        <div className='label-div'>Young's Modulus:</div>
        <div className='dropdown-div'>
          <input
            type='number'
            value={youngsModulus}
            onChange={(event) =>
              onYoungsModulusChange(Number.parseFloat(event.target.value))
            }
            required
          />
        </div>
        <div className='label-div'>Second Moment of Inertia:</div>
        <div className='dropdown-div'>
          <input
            type='number'
            value={secondMomentOfInertia}
            onChange={(event) =>
              onSecondMomentOfInertiaChange(
                Number.parseFloat(event.target.value)
              )
            }
            required
          />
        </div>
      </div>
    </div>
  )
}

DesignParameters.propTypes = {
  length: PropTypes.number.isRequired,
  onLengthChange: PropTypes.number.isRequired,
  youngsModulus: PropTypes.number.isRequired,
  onYoungsModulusChange: PropTypes.number.isRequired,
  secondMomentOfInertia: PropTypes.number.isRequired,
  onSecondMomentOfInertiaChange: PropTypes.number.isRequired
}

export default DesignParameters
