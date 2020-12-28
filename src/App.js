import './App.css';
import React from "react";

import MeasurementUnitSelection from "./components/measurementUnitSelection";
import ForceUnitSelection from "./components/forceUnitSelection";
import ModalComponent from "./components/ModalComponent";

import { onLoadSideChoose } from "./helper";
import { setLoadDirection } from "./helper";
import { addNewPointOrMomentLoad } from "./helper"; //
import { defineDistrLoadMagnitude } from "./helper"; //
import { defineDistrLoadPosition } from "./helper"; //
import { addNewDistributedLoad } from "./helper"; //
import { calculateTrapezoidalLoad } from "./helper";
import { calculateEquivalentRectLoad } from "./helper";
import { calculateEquivalentTriLoad } from "./helper";
import { generateLoadTerms } from "./helper";
import { showLoads } from "./helper";


class App extends React.Component {


  constructor(props) {
    super(props);

    this.state = {
      // Units
      measurementUnits: 'millimeter', //m, mm, in, ft
      forceUnits: 'millimeter', //kN, N, lb, kip

      //Design parameters
      length: 90,
      youngsModulus: 10,
      secondMomentOfInertia: 10,

      supportLocation: undefined, // LHS is left, RHS is right
      supportDistance: undefined,

      //Possible support choices: 'fixed' | 'pin' | 'roller'
      selectedSupportType: undefined,

      //Possible load choices: 'pointLoad' | 'moment' | 'distrLoad'
      selectedLoadType: undefined,

      //point load parameters
      loadOrMomentDistance: undefined,
      loadDirection: undefined, //possible choices: up, down, angle (degrees)
      loadMagnitude: undefined,
      loadAngle: undefined,

      loadMultiplier: undefined,

      //distributed load parameters
      distrLoadStartPosition: undefined,
      distrLoadEndPosition: undefined,
      distrLoadStartMagnitude: undefined,
      distrLoadEndMagnitude: undefined,

      //show modal pop-up windows
      showSupportModal: false,
      showLoadModal: false,

      showDistanceBox: false,
      showSelectedSupportDiv: false,
      showLoadDiv: false,
      showSelectedLoadDiv: false,

      supports: [],
      loads: [],
      eqvlDistrLoads: []

    }
  }


  //don't allow pressing down on enter for text box fields
  onKeyDown = (keyEvent) => {
    if ((keyEvent.charCode || keyEvent.keyCode) === 13) {
      keyEvent.preventDefault();
    }
  }




  onSupportTypeChoose = (supportType) => {

    this.setState({
      selectedSupportType: supportType,
      showSupportModal: true,
      showDistanceBox: false
    })
  }

  onLoadTypeChoose = (loadType) => {

    this.setState({
      selectedLoadType: loadType,
      showLoadModal: true,
    })
  }

  generateSupportReactionTerms = (selectedSupportType) => {

    let i = this.state.supports.length;
    let point = String.fromCharCode(i + 65).toLowerCase()

    const reactionTermArray = {
      x: null,
      y: null,
      M: null
    }

    if (selectedSupportType === 'fixed') {
      reactionTermArray.x = 'R' + point + 'x';
      reactionTermArray.y = 'R' + point + 'y';
      reactionTermArray.M = 'M' + point;
    } else if (selectedSupportType === 'roller') {
      reactionTermArray.y = 'R' + point + 'y';
    } else if (selectedSupportType === 'pin') {
      reactionTermArray.x = 'R' + point + 'x';
      reactionTermArray.y = 'R' + point + 'y';
    }

    return reactionTermArray;
  }


  onSupportLocationChoose = (supportLocation) => {

    if (supportLocation < 0) supportLocation = 0;
    if (supportLocation > this.state.length) supportLocation = this.state.length;

    let supportDistance;

    if (supportLocation === 'LHS') {
      this.setState({showDistanceBox: false})
      supportDistance = 0;
    } else if (supportLocation === 'RHS') {
      this.setState({showDistanceBox: false})
      supportDistance = this.state.length;
    } else {
      this.setState({showDistanceBox: true})
    }

    if (supportLocation === 'atDist' && supportDistance > this.state.length) {
      throw new Error('Distance cannot be beyond beam length')
    }

    this.setState({
      supportLocation: supportLocation,
      supportDistance: supportDistance,
    })


  }

  addNewSupport = () => {

    let reactionTermObj = this.generateSupportReactionTerms(this.state.selectedSupportType)

    let supportID = this.state.supports.length + 1;

    let newSupportType = this.state.selectedSupportType;
    let newSupportDistance = this.state.supportDistance;

    const generateSupport = {
      type: newSupportType,
      distance: newSupportDistance,
      reactions: reactionTermObj,
      supportID: supportID
    }

    this.setState({
      supports: [...this.state.supports, generateSupport],
    })

    if (!Array.isArray(this.state.supports) || !this.state.supports) {
      //checks if array is empty or does not exist
      this.setState({showSelectedSupportDiv: false})
    } else {
      this.setState({showSelectedSupportDiv: true})
    }


  }


  // setLoadDirection = (directionInput) => {
  //
  //   if (directionInput === 'up' || directionInput === 'CCW') {
  //     this.setState({loadDirection: 'positive'})
  //   } else if (directionInput === 'down' || directionInput === 'CW') {
  //     this.setState({loadDirection: 'negative'})
  //   } else if (directionInput === 'angle') {
  //     this.setState({loadDirection: 'angle'})
  //   }
  //
  // }

  // defineDistrLoad = (parameter, distance, value) => {
  //
  //   if (value < 0) value = 0;
  //   if (value > this.state.length) value = this.state.length;
  //
  //   //set the start position
  //   if (parameter === 'startPosition' && distance === 'atDist') {
  //     this.setState({distrLoadStartPosition: value})
  //   } else if (parameter === 'startPosition' && distance === 'LHS') {
  //     this.setState({distrLoadStartPosition: 0})
  //   } else if (parameter === 'startPosition' && distance === 'RHS') {
  //     this.setState({distrLoadStartPosition: this.state.length})
  //   }
  //
  //   //set the end position
  //   if (parameter === 'endPosition' && distance === 'atDist') {
  //     this.setState({distrLoadEndPosition: value})
  //   } else if (parameter === 'endPosition' && distance === 'LHS') {
  //     this.setState({distrLoadEndPosition: 0})
  //   } else if (parameter === 'endPosition' && distance === 'RHS') {
  //     this.setState({distrLoadEndPosition: this.state.length})
  //   }
  //
  // }

  // defineDistrLoadMagnitude = (parameter, magnitude) => {
  //
  //   if (magnitude < 0) magnitude = 0;
  //
  //   //set the start and end position
  //   if (parameter === 'startMagnitude') {
  //     this.setState({distrLoadStartMagnitude: magnitude})
  //   } else if (parameter === 'endMagnitude') {
  //     this.setState({distrLoadEndMagnitude: magnitude})
  //   } else {
  //     this.setState({loadMagnitude: magnitude})
  //   }
  //
  // }

  // addNewLoad = () => {
  //
  //   let generateLoad;
  //
  //   // let index = this.state.loads.length
  //   let loadTermObj = generateLoadTerms(this.state.selectedLoadType, this.state.loads)
  //
  //   if (this.state.selectedLoadType !== 'distrLoad') {
  //
  //     generateLoad = {
  //       type: this.state.selectedLoadType,
  //       distance: this.state.loadOrMomentDistance,
  //       magnitude: this.state.loadMagnitude,
  //       loadDirection: this.state.loadDirection,
  //       loadAngle: this.state.angle,
  //       loadTerms: loadTermObj,
  //       loadID: this.state.loads.length + 1
  //     }
  //
  //     this.setState({loads: [...this.state.loads, generateLoad]})
  //
  //   } else {
  //
  //     let startDistance = this.state.distrLoadStartPosition;
  //     let endDistance = this.state.distrLoadEndPosition;
  //     let startMagnitude = this.state.distrLoadStartMagnitude;
  //     let endMagnitude = this.state.distrLoadEndMagnitude;
  //
  //     //redefined the distributed load
  //     this.redefineDistributedLoad(startDistance, endDistance, startMagnitude, endMagnitude, loadTermObj)
  //   }
  //
  //   //checks if array is empty or does not exist
  //   if (!Array.isArray(this.state.loads) || !this.state.loads) {
  //     this.setState({showSelectedLoadDiv: false})
  //   } else {
  //     this.setState({showSelectedLoadDiv: true})
  //   }
  //
  // }

  // generateRedefinedDistrLoadObj = (startDistance, endDistance,
  //                                  startMagnitude, endMagnitude,
  //                                  result) => {
  //
  //   let generateLoad;
  //   let equivalentTriDistance, equivalentRectDistance
  //   let equivalentTriLoad, equivalentRectLoad
  //   let loadTermArray;
  //
  //   loadTermArray = generateLoadTerms(this.state.selectedLoadType, this.state.loads)
  //
  //   //set equivalent loading as point load with equivalent distance
  //   if (result.distrLoadType === 'triangular') {
  //     equivalentRectDistance = null;
  //     equivalentRectLoad = null;
  //     equivalentTriDistance = result.equivalentDistance
  //     equivalentTriLoad = result.equivalentPointLoad
  //
  //   } else if (result.distrLoadType === 'rectangular') {
  //     equivalentTriDistance = null;
  //     equivalentTriLoad = null;
  //     equivalentRectDistance = result.equivalentDistance
  //     equivalentRectLoad = result.equivalentPointLoad;
  //
  //   } else {
  //     equivalentTriDistance = result.triLoadPortion.equivalentDistance;
  //     equivalentTriLoad = result.triLoadPortion.equivalentPointLoad;
  //     equivalentRectDistance = result.rectLoadPortion.equivalentDistance;
  //     equivalentRectLoad = result.rectLoadPortion.equivalentPointLoad;
  //   }
  //
  //   generateLoad = {
  //     loadID: this.state.loads.length + 1,
  //     type: this.state.selectedLoadType,
  //     distrLoadType: result.distrLoadType,
  //
  //     distrLoadStartPosition: startDistance,
  //     distrLoadEndPosition: endDistance,
  //     distrLoadStartMagnitude: startMagnitude,
  //     distrLoadEndMagnitude: endMagnitude,
  //
  //     distrLoadDirection: this.state.loadDirection,
  //
  //     equivalentTriDistance: equivalentTriDistance,
  //     equivalentTriLoad: equivalentTriLoad,
  //     equivalentRectDistance: equivalentRectDistance,
  //     equivalentRectLoad: equivalentRectLoad,
  //
  //     loadTerms: loadTermArray,
  //   }
  //
  //   return generateLoad
  //
  // }

  // redefineDistributedLoad = (startDistance, endDistance, startMagnitude, endMagnitude, loadTermArray) => {
  //
  //   let rectLoadResult, triLoadResult, trapezoidalLoadResult;
  //   let rectLoadObj, triLoadObj, trapLoadObj
  //
  //   if (startMagnitude === endMagnitude) {
  //
  //     rectLoadResult = this.calculateEquivalentRectLoad(startDistance,
  //         endDistance,
  //         startMagnitude,
  //         endMagnitude)
  //
  //     rectLoadObj = this.generateRedefinedDistrLoadObj(startDistance,
  //         endDistance,
  //         startMagnitude,
  //         endMagnitude,
  //         rectLoadResult,
  //         loadTermArray
  //     )
  //
  //     this.setState({loads: [...this.state.loads, rectLoadObj]})
  //
  //   } else if (startMagnitude === 0 || endMagnitude === 0) {
  //
  //     triLoadResult = this.calculateEquivalentTriLoad(startDistance,
  //         endDistance,
  //         startMagnitude,
  //         endMagnitude)
  //
  //     triLoadObj = this.generateRedefinedDistrLoadObj(startDistance,
  //         endDistance,
  //         startMagnitude,
  //         endMagnitude,
  //         triLoadResult
  //     )
  //
  //     this.setState({loads: [...this.state.loads, triLoadObj]})
  //
  //   } else {
  //
  //     trapezoidalLoadResult = this.calculateTrapezoidalLoad(startDistance,
  //         endDistance,
  //         startMagnitude,
  //         endMagnitude)
  //
  //     trapLoadObj = this.generateRedefinedDistrLoadObj(startDistance,
  //         endDistance,
  //         startMagnitude,
  //         endMagnitude,
  //         trapezoidalLoadResult
  //     )
  //
  //     this.setState({loads: [...this.state.loads, trapLoadObj]})
  //   }
  // }

  // calculateTrapezoidalLoad = (startDistance,
  //                             endDistance,
  //                             startMagnitude,
  //                             endMagnitude) => {
  //
  //   let triangularPortion;
  //   let triLoadPortionResult, rectLoadPortionResult;
  //
  //   if (startMagnitude > endMagnitude) {
  //
  //     triangularPortion = startMagnitude - endMagnitude;
  //
  //     triLoadPortionResult = this.calculateEquivalentTriLoad(startDistance, endDistance, triangularPortion, 0);
  //     rectLoadPortionResult = this.calculateEquivalentRectLoad(startDistance, endDistance, endMagnitude, endMagnitude);
  //
  //   } else if (endMagnitude > startMagnitude) {
  //
  //     triangularPortion = endMagnitude - startMagnitude;
  //
  //     triLoadPortionResult = this.calculateEquivalentTriLoad(startDistance, endDistance, 0, triangularPortion);
  //     rectLoadPortionResult = this.calculateEquivalentRectLoad(startDistance, endDistance, startMagnitude, startMagnitude);
  //
  //   }
  //
  //   return {
  //     distrLoadType: 'trapezoidal',
  //     triLoadPortion: triLoadPortionResult,
  //     rectLoadPortion: rectLoadPortionResult
  //   }
  //
  //
  // }
  //
  // calculateEquivalentRectLoad = (startDistance,
  //                                endDistance,
  //                                startMagnitude,
  //                                endMagnitude) => {
  //
  //   let totalLoad = (endDistance - startDistance) * (startMagnitude);
  //   let eqvDistance = 0.5 * (endDistance - startDistance) + startDistance;
  //
  //   return {
  //     distrLoadType: 'rectangular',
  //     equivalentDistance: eqvDistance,
  //     equivalentPointLoad: totalLoad,
  //   }
  //
  // }
  //
  // calculateEquivalentTriLoad = (startDistance,
  //                               endDistance,
  //                               startMagnitude,
  //                               endMagnitude) => {
  //
  //   let totalLoad, eqvDistance;
  //
  //   if (startMagnitude > endMagnitude) {
  //     eqvDistance = (1 / 3) * (endDistance - startDistance) + startDistance;
  //     totalLoad = (1 / 2) * ((endDistance - startDistance) * (startMagnitude));
  //   } else {
  //     eqvDistance = (2 / 3) * (endDistance - startDistance) + startDistance;
  //     totalLoad = (1 / 2) * ((endDistance - startDistance) * (endMagnitude));
  //   }
  //
  //   return {
  //     distrLoadType: 'triangular',
  //     equivalentDistance: eqvDistance,
  //     equivalentPointLoad: totalLoad,
  //   }
  //
  // }

  deleteLoad = (index) => {
    let loads = [...this.state.loads]
    loads.splice(index, 1);
    this.setState({loads: loads})
  }

  editLoad = (index) => {

    // let currentLoad = this.state.loads[index]

  }


  // showLoads = () => {
  //   if (this.state.loads.length === 0) {
  //     return null;
  //   }
  //
  //   return (
  //       <div className="selected-loads-wrapper">
  //
  //
  //         <div className={"load-col1"}>
  //           {
  //             this.state.loads
  //                 .filter((load) => (load.type === 'pointLoad'))
  //                 .map((load, index) => (
  //                     <div key={index} className={"load-row"}>
  //                       {load.type === 'pointLoad' ?
  //                           <p>{load.type + load.loadID + ' ' + load.loadDirection + ' at x=' + load.distance + 'm '}
  //                             <button onClick={() => this.editLoad(index)} type="button">{'edit'}</button>
  //                             <button onClick={() => this.deleteLoad(index)} type="button">{'x'}</button>
  //                           </p> : null}
  //                     </div>
  //                 ))
  //           }
  //         </div>
  //
  //         <div className="load-col2">
  //           {
  //             this.state.loads
  //                 .filter((load) => (load.type === 'moment'))
  //                 .map((load, index) => (
  //                     <div key={index} className={"load-row"}>
  //                       {load.loadDirection === 'CCW' || load.loadDirection === 'CW' ?
  //                           <p>{load.type + load.loadID + ' ' + load.loadDirection + ' at x=' + load.distance + 'm '}
  //                             <button onClick={() => this.editLoad(index)} type="button">{'edit'}</button>
  //                             <button onClick={() => this.deleteLoad(index)} type="button">{'x'}</button>
  //                           </p> : null}
  //                     </div>
  //                 ))
  //           }
  //         </div>
  //
  //         <div className="load-col3">
  //           {this.state.loads
  //               .filter((load) => (load.type === 'distrLoad')) //filter for distributed loads
  //               .map((load, index) => (
  //                   <div key={index} className={"load-row"}>
  //                     {load.type === 'distrLoad' ?
  //                         <p>{load.type + load.loadID + ' ' + load.distrLoadDirection + ' at x=' + load.distrLoadStartPosition + 'm '}
  //                           <button onClick={() => this.editLoad(index)} type="button">{'edit'}</button>
  //                           <button onClick={() => this.deleteLoad(index)} type="button">{'x'}</button>
  //                         </p> : null}
  //                   </div>
  //               ))
  //           }
  //
  //         </div>
  //
  //
  //       </div>
  //   )
  // }


  render() {
    return (
        <div className="App">

          <header className="title-div">
            Beam Calculator
          </header>

          <div className="inputs-wrapper">
            <div className="units-outer-div">

              <div className="support-div-title">Units</div>

              <div className="units-inner-div">

                <div className="label-div">
                  Measurement Units:
                </div>

                <div className="dropdown-div">
                  <MeasurementUnitSelection
                      value={this.state.measurementUnits}
                      onChange={(event) => this.setState({measurementUnits: event.target.value})}
                      required
                  />
                </div>

                <div className="label-div">
                  Force Units:
                </div>

                <div className="dropdown-div">
                  <ForceUnitSelection
                      value={this.state.forceUnits}
                      onChange={(event) => this.setState({forceUnits: event.target.value})}
                      required
                  />
                </div>
              </div>
            </div>

            <div className="design-inputs-outer-div">

              <div className="support-div-title">Design Parameters</div>

              <div className="design-inputs-inner-div">

                <div className="label-div">
                  Length:
                </div>

                <div className="dropdown-div">
                  <input type="number"
                         value={this.state.length}
                         onChange={(event) => this.setState({
                           length: Number.parseFloat(event.target.value)
                         })}
                         required
                  />
                </div>

                <div className="label-div">
                  Young's Modulus:
                </div>

                <div className="dropdown-div">
                  <input type="number"
                         value={this.state.youngsModulus}
                         onChange={(event) => this.setState({
                           youngsModulus: Number.parseFloat(event.target.value)
                         })}
                         required
                  />
                </div>

                <div className="label-div">
                  Second Moment of Inertia:
                </div>

                <div className="dropdown-div">
                  <input type="number"
                         value={this.state.secondMomentOfInertia}
                         onChange={(event) => this.setState({
                           secondMomentOfInertia: Number.parseFloat(event.target.value)
                         })}
                         required
                  />

                </div>

              </div>
            </div>

            <div className="support-outer-div">

              <div className="support-div-title">
                Pick the Support Types
              </div>

              <div className="support-inner-div">

                <div className="pin-support-div">
                  <button onClick={() => this.onSupportTypeChoose('pin')}>
                    Pin
                  </button>
                </div>

                <div className="roller-support-div">
                  <button onClick={() => this.onSupportTypeChoose('roller')}>
                    Roller
                  </button>
                </div>

                <div className="fixed-support-div">
                  <button onClick={() => this.onSupportTypeChoose('fixed')}>
                    Fixed Support
                  </button>
                </div>

              </div>

            </div>

            <div className="loads-outer-div">

              <div className="support-div-title">
                Pick the Loads
              </div>

              <div className="loads-inner-div">

                <div className="point-load-div">
                  <button onClick={() => this.onLoadTypeChoose('pointLoad')}>Point Load</button>
                </div>

                <div className="moment-load-div">
                  <button onClick={() => this.onLoadTypeChoose('moment')}>Moment</button>
                </div>

                <div className="uniform-distributed-load-div">
                  <button onClick={() => this.onLoadTypeChoose('distrLoad')}>Distributed Load</button>
                </div>

              </div>
            </div>

            {
              this.state.showSelectedSupportDiv ?
                  <div className="selected-supports">

                    {/*{this.showSupportInDiv()}*/}
                    Showing selected supports

                  </div> : null
            }

            <div className="selected-loads">
              {showLoads(this.state.loads)}
            </div>


            <div className="sketch-div">Sketch Div</div>

          </div>


          <ModalComponent
              isShowing={this.state.showSupportModal}
              onToggle={() => this.setState({
                showSupportModal: !this.state.showSupportModal
              })}
          >
            <form>
              <div>
                <input type="radio"
                       value="LHS"
                       name="fixed-support-radio"
                       onChange={() => this.onSupportLocationChoose('LHS')}
                       required
                />
                Left Hand Side
              </div>

              <div>
                <input type="radio"
                       value="RHS"
                       name="fixed-support-radio"
                       onChange={() => this.onSupportLocationChoose('RHS')}
                       required
                />
                Right Hand Side
              </div>


              {
                this.state.selectedSupportType !== 'fixed' ?

                    <div>
                      <input type="radio"
                             value="AtDist"
                             name="fixed-support-radio"
                             onChange={() => this.onSupportLocationChoose('AtDist')}
                             required
                      />
                      At Distance
                    </div> : null

              }

              {
                this.state.showDistanceBox ?
                    <div>
                      <input type="number"
                             value={this.state.supportDistance}
                             min={"0"}
                             onChange={(event) => this.setState({
                               supportDistance: Number.parseFloat(event.target.value)
                             })}
                             required
                      />

                    </div>
                    : null
              }


              <button onClick={() => this.addNewSupport()} type="button">Add</button>
              <button onClick={() => this.state.showSupportModal === false}>Cancel</button>


            </form>
          </ModalComponent>


          <ModalComponent
              isShowing={this.state.showLoadModal}
              onToggle={() => this.setState({
                showLoadModal: !this.state.showLoadModal
              })}
          >
            <form>
              <div>
                {
                  this.state.selectedLoadType === 'pointLoad' ?

                      <div>
                        <button onClick={(event) =>
                            setLoadDirection('up')} type="button">up
                        </button>
                        <button onClick={(event) =>
                            setLoadDirection('down')} type="button">down
                        </button>
                        <button onClick={(event) =>
                            setLoadDirection('angle')} type="button">angle
                        </button>

                        <div>
                          Load Distance:
                          <input type="number"
                                 min={"0"}
                                 max={this.state.length}
                              // oninput={"this.value=Math.abs(this.value)"}
                                 value={this.state.loadOrMomentDistance}
                                 onChange={(event) =>
                                     onLoadSideChoose(Number.parseFloat(event.target.value), this.state.length)}/>

                          <button onClick={(event) =>
                              onLoadSideChoose('LHS', this.state.length)} type="button">L
                          </button>
                          <button onClick={(event) =>
                              onLoadSideChoose('RHS', this.state.length)} type="button">R
                          </button>
                        </div>

                        <div>
                          Magnitude:
                          <input type="number"
                                 min={"0"}
                                 value={this.state.loadMagnitude}
                                 onChange={(event) =>
                                     defineDistrLoadMagnitude('loadMagnitude', Number.parseFloat(event.target.value))}/>
                        </div>

                        <div>

                          {
                            this.state.loadDirection === 'angle' ?

                                <div>
                                  Load Angle:
                                  <input type="number"
                                         min={"0"}
                                         value={this.state.loadAngle}
                                         onChange={(event) =>
                                             setLoadDirection(Number.parseFloat(event.target.value))}
                                  />
                                </div>
                                : null
                          }


                        </div>

                        <button onClick={() => addNewPointOrMomentLoad(
                            this.state.selectedLoadType,
                            this.state.loadOrMomentDistance,
                            this.state.loadMagnitude,
                            this.state.loadDirection,
                            this.state.angle,
                            this.state.loads)}
                                type="button">Add</button>
                        <button onClick={() => this.state.showLoadModal === false}>Cancel</button>

                      </div>
                      : null

                }

                {
                  this.state.selectedLoadType === 'moment' ?
                      <div>
                        <div>
                          <button onClick={(event) =>
                              setLoadDirection('CCW')} type="button">CCW
                          </button>
                          <button onClick={(event) =>
                              setLoadDirection('CW')} type="button">CW
                          </button>
                        </div>

                        <div>
                          Moment Distance:
                          <input type="number"
                              min={"0"}
                                 value={this.state.loadOrMomentDistance}
                                 onChange={(event) =>
                                     onLoadSideChoose(Number.parseFloat(event.target.value), this.state.length)}/>

                          <button onClick={(event) =>
                              onLoadSideChoose('LHS', this.state.length)} type="button">L
                          </button>
                          <button onClick={(event) =>  onLoadSideChoose('RHS', this.state.length)} type="button">R
                          </button>

                          <div>
                            Magnitude:
                            <input type="number"
                                   min={"0"}
                                   value={this.state.loadMagnitude}
                                   onChange={(event) =>
                                       defineDistrLoadMagnitude('loadMagnitude', Number.parseFloat(event.target.value))}
                                   required
                            />
                          </div>

                        </div>

                        <button onClick={() => addNewPointOrMomentLoad(
                            this.state.selectedLoadType,
                            this.state.loadOrMomentDistance,
                            this.state.loadMagnitude,
                            this.state.loadDirection,
                            this.state.angle,
                            this.state.loads)}
                                type="button">Add</button>
                        <button onClick={() => this.state.showLoadModal === false}>Cancel</button>
                      </div>
                      : null
                }

                {
                  this.state.selectedLoadType === 'distrLoad' ?
                      <div>
                        <div>
                          <button onClick={(event) =>
                              this.setLoadDirection('up')} type="button">up
                          </button>
                          <button onClick={(event) =>
                              this.setLoadDirection('down')} type="button">down
                          </button>
                        </div>

                        <div>
                          Start Position:
                          <input type="number"
                                 min={"0"}
                                 value={this.state.distrLoadStartPosition}
                                 onChange={(event) =>
                                     defineDistrLoadPosition('startPosition', 'atDist', Number.parseFloat(event.target.value))}
                                 required
                          />

                          <button onClick={(event) =>
                              defineDistrLoadPosition('startPosition', 'LHS')} type="button">L
                          </button>

                          <button onClick={(event) =>
                              defineDistrLoadPosition('startPosition', 'RHS')} type="button">R
                          </button>
                        </div>

                        <div>
                          End Position:
                          <input type="number"
                                 min={"0"}
                                 value={this.state.distrLoadEndPosition}
                                 onChange={(event) =>
                                     defineDistrLoadPosition('endPosition', 'atDist', Number.parseFloat(event.target.value))}
                                 required/>

                          <button onClick={(event) =>
                              defineDistrLoadPosition('endPosition', 'LHS')} type="button">L
                          </button>
                          <button onClick={(event) =>
                              defineDistrLoadPosition('endPosition', 'RHS')} type="button">R
                          </button>
                        </div>


                        <div>
                          Start Magnitude:
                          <input type="number"
                                 min={"0"}
                                 value={this.state.distrLoadStartMagnitude}
                                 onChange={(event) =>
                                     defineDistrLoadMagnitude('startMagnitude', Number.parseFloat(event.target.value))}
                                 required
                          />
                        </div>

                        <div>
                          End Magnitude:
                          <input type="number"
                                 min={"0"}
                                 value={this.state.distrLoadEndMagnitude}
                                 onChange={(event) =>
                                     defineDistrLoadMagnitude('endMagnitude', Number.parseFloat(event.target.value))}
                                 required
                          />
                        </div>

                        <button onClick={() => addNewDistributedLoad(
                            this.state.selectedLoadType,
                            this.state.distrLoadStartPosition,
                            this.state.distrLoadEndPosition,
                            this.state.distrLoadStartMagnitude,
                            this.state.distrLoadEndMagnitude,
                            this.state.loads
                        )} type="button">Add</button>
                        <button onClick={() => this.state.showLoadModal === false}>Cancel</button>
                      </div>
                      : null
                }

              </div>


            </form>
          </ModalComponent>


        </div>
    );
  }
}

export default App;


