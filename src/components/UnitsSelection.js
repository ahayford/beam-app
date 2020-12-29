import React from "react";
import PropTypes from "prop-types";

const UnitsSelection = ({
  measurementUnits,
  onMeasurementUnitsChange,
  forceUnits,
  onForceUnitsChange
}) => (
  <div className='units-outer-div'>
    <div className='support-div-title'>Units</div>
    <div className='units-inner-div'>
      <div className='label-div'>Measurement Units:</div>
      <div className='dropdown-div'>
        <select
          value={measurementUnits}
          onChange={(event) => onMeasurementUnitsChange(event.target.value)}
          required
        >
          <option value='millimeter'>Meter (m)</option>
          <option value='centimeter'>Millimeter (mm)</option>
          <option value='decimeter'>Feet (ft)</option>
          <option value='meter'>Inch (in)</option>
        </select>
      </div>
      <div className='label-div'>Force Units:</div>
      <div className='dropdown-div'>
        <select
          value={forceUnits}
          onChange={(event) => onForceUnitsChange(event.target.value)}
          required
        >
          <option value='kN'>kN (kilonewton)</option>
          <option value='N'>N (newton)</option>
          <option value='lb'>Pound (lb)</option>
          <option value='kip'>Kilopound (kip)</option>
        </select>
      </div>
    </div>
  </div>
)

UnitsSelection.propTypes = {
  measurementUnits: PropTypes.oneOf([
    'millimeter',
    'centimeter',
    'decimeter',
    'meter'
  ]),
  onMeasurementUnitsChange: PropTypes.func.isRequired,
  forceUnits: PropTypes.oneOf(['kN', 'N', 'lb', 'kip']),
  onForceUnitsChange: PropTypes.func.isRequired
}

export default UnitsSelection
