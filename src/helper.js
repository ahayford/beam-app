export function onLoadSideChoose(loadLocationInput, length) {

  if (loadLocationInput < 0) loadLocationInput = 0;
  if (loadLocationInput > length) loadLocationInput = length;

  let loadDistance;

  if (loadLocationInput === 'LHS') {
    loadDistance = 0;
  } else if (loadLocationInput === 'RHS') {
    loadDistance = length;
  } else {
    loadDistance = loadLocationInput
  }

  return loadDistance;
  // this.setState({loadOrMomentDistance: loadDistance})
}


export function setLoadDirection(directionInput) {

  let loadDirection;

  if (directionInput === 'up' || directionInput === 'CCW') {
    loadDirection = 'positive'
  } else if (directionInput === 'down' || directionInput === 'CW') {
    loadDirection = 'negative'
  } else if (directionInput === 'angle') {
    loadDirection = 'angle'
  }

  return loadDirection;
  // this.setState({loadDirection: loadDirection})
}


export function addNewPointOrMomentLoad(loadType, distance, magnitude,
                                        direction, angle, loads) {

  //this.state.selectedLoadType, this.state.loads

  // checkWhetherLoadsExist (loads)
  let generateLoad;

  let terms = generateLoadTerms(loadType, loads)

  generateLoad = {
    type: loadType,
    distance: distance,
    magnitude: magnitude,
    loadDirection: direction,
    loadAngle: angle,
    loadTerms: terms
  }

  return generateLoad;
  // this.setState({loads: [...this.state.loads, generateLoad]})

}


// export function checkWhetherLoadsExist (loads) {
//   // checks if loads array is empty or does not exist
//   if (!Array.isArray(loads) || !loads) {
//     this.setState({showSelectedLoadDiv: false})
//   } else {
//     this.setState({showSelectedLoadDiv: true})
//   }
// }

export function defineDistrLoadMagnitude (parameter, magnitude) {

  if (magnitude < 0) magnitude = 0;

  let loadMagnitude = {};
  loadMagnitude = {parameter: undefined};

  //set the start and end position
  // if (parameter === 'startMagnitude') {
  //   loadMagnitude.parameter = magnitude;
  //   this.setState({distrLoadStartMagnitude: magnitude})
  // } else if (parameter === 'endMagnitude') {
  //   this.setState({distrLoadEndMagnitude: magnitude})
  // } else {
  //   this.setState({loadMagnitude: magnitude})
  // }

  return loadMagnitude;
  // this.setState({distrLoadStartMagnitude: magnitude})
  // this.setState({distrLoadEndMagnitude: magnitude})
  // this.setState({loadMagnitude: magnitude})

}


export function defineDistrLoadPosition(parameter, distance, value) {

  if (value < 0) value = 0;
  if (value > this.state.length) value = this.state.length;
  let startPosition, endPosition;

  //set the start position
  if (parameter === 'startPosition' && distance === 'atDist') {
    startPosition = value;
  } else if (parameter === 'startPosition' && distance === 'LHS') {
    startPosition = 0;
  } else if (parameter === 'startPosition' && distance === 'RHS') {
    startPosition = this.state.length;
  }

  //set the end position
  if (parameter === 'endPosition' && distance === 'atDist') {
    endPosition = value;
  } else if (parameter === 'endPosition' && distance === 'LHS') {
    endPosition = 0;
  } else if (parameter === 'endPosition' && distance === 'RHS') {
    endPosition = this.state.length;
  }

  return {startPosition: startPosition,
    endPosition: endPosition};
  // this.setState({distrLoadStartPosition: this.state.length})
  // this.setState({distrLoadEndPosition: this.state.length})

}

export function addNewDistributedLoad(loadType,
                                      startDistance,
                                      endDistance,
                                      startMagnitude,
                                      endMagnitude,
                                      loads) {

  // checkWhetherLoadsExist (loads)

  let equivalentTriDistance, equivalentRectDistance
  let equivalentTriLoad, equivalentRectLoad
  let loadTermArray;
  let rectLoadResult, triLoadResult, trapezoidalLoadResult;
  let distrLoadType;

  loadTermArray = generateLoadTerms(loadType, loads)

  //redefine the distributed load

  if (startMagnitude === endMagnitude) { //for rectangular load

    rectLoadResult = this.calculateEquivalentRectLoad(startDistance,
        endDistance,
        startMagnitude,
        endMagnitude)

    distrLoadType = rectLoadResult.distrLoadType;
    equivalentTriDistance = null;
    equivalentTriLoad = null;
    equivalentRectDistance = rectLoadResult.equivalentDistance;
    equivalentRectLoad = rectLoadResult.equivalentPointLoad;


  } else if (startMagnitude === 0 || endMagnitude === 0) { //for triangular load

    triLoadResult = this.calculateEquivalentTriLoad(startDistance,
        endDistance,
        startMagnitude,
        endMagnitude)

    distrLoadType = rectLoadResult.distrLoadType;
    equivalentTriDistance = triLoadResult.equivalentDistance
    equivalentTriLoad = triLoadResult.equivalentDistance
    equivalentRectDistance = null;
    equivalentRectLoad = null;

  } else { //for trapezoidal load

    trapezoidalLoadResult = this.calculateTrapezoidalLoad(startDistance,
        endDistance,
        startMagnitude,
        endMagnitude)

    distrLoadType = trapezoidalLoadResult.distrLoadType;
    equivalentTriDistance = trapezoidalLoadResult.triLoadPortion.equivalentDistance
    equivalentTriLoad = trapezoidalLoadResult.triLoadPortion.equivalentDistance
    equivalentRectDistance = trapezoidalLoadResult.triLoadPortion.equivalentDistance;
    equivalentRectLoad = trapezoidalLoadResult.triLoadPortion.equivalentPointLoad;
  }

  let generateLoad = {
    type: loadType,
    distrLoadType: distrLoadType,

    distrLoadStartPosition: startDistance,
    distrLoadEndPosition: endDistance,
    distrLoadStartMagnitude: startMagnitude,
    distrLoadEndMagnitude: endMagnitude,

    distrLoadDirection: this.state.loadDirection,

    equivalentTriDistance: equivalentTriDistance,
    equivalentTriLoad: equivalentTriLoad,
    equivalentRectDistance: equivalentRectDistance,
    equivalentRectLoad: equivalentRectLoad,

    loadTerms: loadTermArray,
  }

  return generateLoad;

}

export function calculateTrapezoidalLoad (startDistance,
                            endDistance,
                            startMagnitude,
                            endMagnitude) {

  let triangularPortion;
  let triLoadPortionResult, rectLoadPortionResult;

  if (startMagnitude > endMagnitude) {

    triangularPortion = startMagnitude - endMagnitude;

    triLoadPortionResult = this.calculateEquivalentTriLoad(startDistance, endDistance, triangularPortion, 0);
    rectLoadPortionResult = this.calculateEquivalentRectLoad(startDistance, endDistance, endMagnitude, endMagnitude);

  } else if (endMagnitude > startMagnitude) {

    triangularPortion = endMagnitude - startMagnitude;

    triLoadPortionResult = this.calculateEquivalentTriLoad(startDistance, endDistance, 0, triangularPortion);
    rectLoadPortionResult = this.calculateEquivalentRectLoad(startDistance, endDistance, startMagnitude, startMagnitude);

  }

  return {
    distrLoadType: 'trapezoidal',
    triLoadPortion: triLoadPortionResult,
    rectLoadPortion: rectLoadPortionResult
  }


}

export function calculateEquivalentRectLoad (startDistance,
                               endDistance,
                               startMagnitude,
                               endMagnitude) {

  let totalLoad = (endDistance - startDistance) * (startMagnitude);
  let eqvDistance = 0.5 * (endDistance - startDistance) + startDistance;

  return {
    distrLoadType: 'rectangular',
    equivalentDistance: eqvDistance,
    equivalentPointLoad: totalLoad,
  }

}

export function calculateEquivalentTriLoad (startDistance,
                              endDistance,
                              startMagnitude,
                              endMagnitude) {

  let totalLoad, eqvDistance;

  if (startMagnitude > endMagnitude) {
    eqvDistance = (1 / 3) * (endDistance - startDistance) + startDistance;
    totalLoad = (1 / 2) * ((endDistance - startDistance) * (startMagnitude));
  } else {
    eqvDistance = (2 / 3) * (endDistance - startDistance) + startDistance;
    totalLoad = (1 / 2) * ((endDistance - startDistance) * (endMagnitude));
  }

  return {
    distrLoadType: 'triangular',
    equivalentDistance: eqvDistance,
    equivalentPointLoad: totalLoad,
  }

}


export function generateLoadTerms(loadType, loads) {
  let point;
  let x, y, M, equivY;

  if (loadType === 'pointLoad') {
    point = loads.filter((load) => (load.type === 'pointLoad')).length + 1;
    x = null;
    y = 'P' + point + 'y';
    M = null;
    equivY = null;
  } else if (loadType === 'moment') {
    point = loads.filter((load) => (load.type === 'moment')).length + 1;
    x = null;
    y = null;
    M = 'M' + point;
    equivY = null;
  } else {
    point = loads.filter((load) => (load.type === 'distrLoad')).length + 1;
    x = null;
    y = 'q' + point + 'y';
    M = null;
    equivY = 'Q' + point + 'y';
  }

  return {
    pointID: point,
    x: x,
    y: y,
    M: M,
    equivY: equivY
  }
}


export function showLoads(loads) {

  if (loads.length === 0) {
    return null;
  }

  return (
      <div className="selected-loads-wrapper">


        <div className={"load-col1"}>
          {
            loads
                .filter((load) => (load.type === 'pointLoad'))
                .map((load, index) => (
                    <div key={index} className={"load-row"}>
                      {load.type === 'pointLoad' ?
                          <p>{load.type + ' ' + load.loadDirection + ' at x=' + load.distance + 'm '}
                            <button onClick={() => this.editLoad(index)} type="button">{'edit'}</button>
                            <button onClick={() => this.deleteLoad(index)} type="button">{'x'}</button>
                          </p> : null}
                    </div>
                ))
          }
        </div>

        <div className="load-col2">
          {
            loads
                .filter((load) => (load.type === 'moment'))
                .map((load, index) => (
                    <div key={index} className={"load-row"}>
                      {load.loadDirection === 'CCW' || load.loadDirection === 'CW' ?
                          <p>{load.type + ' ' + load.loadDirection + ' at x=' + load.distance + 'm '}
                            <button onClick={() => this.editLoad(index)} type="button">{'edit'}</button>
                            <button onClick={() => this.deleteLoad(index)} type="button">{'x'}</button>
                          </p> : null}
                    </div>
                ))
          }
        </div>

        <div className="load-col3">
          {loads
              .filter((load) => (load.type === 'distrLoad')) //filter for distributed loads
              .map((load, index) => (
                  <div key={index} className={"load-row"}>
                    {load.type === 'distrLoad' ?
                        <p>{load.type + ' ' + load.distrLoadDirection + ' at x=' + load.distrLoadStartPosition + 'm '}
                          <button onClick={() => this.editLoad(index)} type="button">{'edit'}</button>
                          <button onClick={() => this.deleteLoad(index)} type="button">{'x'}</button>
                        </p> : null}
                  </div>
              ))
          }

        </div>


      </div>
  )

}

