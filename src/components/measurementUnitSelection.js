import React from 'react';


//m, mm, in, ft

const MeasurementUnitSelection = ({ value, onChange }) => {
    return (
        <select value={value} onChange={onChange}>
            <option value="millimeter">Meter (m)</option>
            <option value="centimeter">Millimeter (mm)</option>
            <option value="decimeter">Feet (ft)</option>
            <option value="meter">Inch (in)</option>
        </select>
    )
}

export default MeasurementUnitSelection