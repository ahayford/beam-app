import React from 'react'
import PropTypes from 'prop-types'

const MeasurementUnitSelection = ({ value, onChange }) => {
  return (
    <select value={value} onChange={onChange}>
      <option value='millimeter'>Meter (m)</option>
      <option value='centimeter'>Millimeter (mm)</option>
      <option value='decimeter'>Feet (ft)</option>
      <option value='meter'>Inch (in)</option>
    </select>
  )
}

MeasurementUnitSelection.propTypes = {
  value: PropTypes.oneOf([
    'millimeter',
    'centimeter',
    'decimeter',
    'meter'
  ]),
  onChange: PropTypes.func.isRequired
}

export default MeasurementUnitSelection
