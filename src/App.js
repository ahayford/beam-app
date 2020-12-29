import './App.css'
import React from 'react'
import ModalComponent from './components/ModalComponent'

import {
  addNewDistributedLoad,
  addNewPointOrMomentLoad,
  defineDistrLoadMagnitude,
  defineDistrLoadPosition,
  onLoadSideChoose,
  setLoadDirection,
  showLoads
} from './helper'
import UnitsSelection from './components/UnitsSelection'
import DesignParameters from './components/DesignParameters'

class App extends React.Component {
  constructor(props) {
    super(props)

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
      showLoadModal: true
    })
  }

  generateSupportReactionTerms = (selectedSupportType) => {
    let i = this.state.supports.length
    let point = String.fromCharCode(i + 65).toLowerCase()

    const reactionTermArray = {
      x: null,
      y: null,
      M: null
    }

    if (selectedSupportType === 'fixed') {
      reactionTermArray.x = 'R' + point + 'x'
      reactionTermArray.y = 'R' + point + 'y'
      reactionTermArray.M = 'M' + point
    } else if (selectedSupportType === 'roller') {
      reactionTermArray.y = 'R' + point + 'y'
    } else if (selectedSupportType === 'pin') {
      reactionTermArray.x = 'R' + point + 'x'
      reactionTermArray.y = 'R' + point + 'y'
    }

    return reactionTermArray
  }

  onSupportLocationChoose = (supportLocation) => {
    if (supportLocation < 0) supportLocation = 0
    if (supportLocation > this.state.length) supportLocation = this.state.length

    let supportDistance

    if (supportLocation === 'LHS') {
      this.setState({ showDistanceBox: false })
      supportDistance = 0
    } else if (supportLocation === 'RHS') {
      this.setState({ showDistanceBox: false })
      supportDistance = this.state.length
    } else {
      this.setState({ showDistanceBox: true })
    }

    if (supportLocation === 'atDist' && supportDistance > this.state.length) {
      throw new Error('Distance cannot be beyond beam length')
    }

    this.setState({
      supportLocation: supportLocation,
      supportDistance: supportDistance
    })
  }

  addNewSupport = () => {
    let reactionTermObj = this.generateSupportReactionTerms(
      this.state.selectedSupportType
    )

    let supportID = this.state.supports.length + 1
    let newSupportType = this.state.selectedSupportType
    let newSupportDistance = this.state.supportDistance

    const generateSupport = {
      type: newSupportType,
      distance: newSupportDistance,
      reactions: reactionTermObj,
      supportID: supportID
    }

    this.setState({
      supports: [...this.state.supports, generateSupport]
    })

    if (!Array.isArray(this.state.supports) || !this.state.supports) {
      //checks if array is empty or does not exist
      this.setState({ showSelectedSupportDiv: false })
    } else {
      this.setState({ showSelectedSupportDiv: true })
    }
  }

  deleteLoad = (index) => {
    let loads = [...this.state.loads]
    loads.splice(index, 1)
    this.setState({ loads: loads })
  }

  editLoad = (index) => {
    // let currentLoad = this.state.loads[index]
  }

  render() {
    return (
      <div className='App'>
        <header className='title-div'>Beam Calculator</header>

        <div className='inputs-wrapper'>
          <UnitsSelection
            forceUnits={this.state.forceUnits}
            onForceUnitsChange={(forceUnits) => this.setState({ forceUnits })}
            measurementUnits={this.state.measurementUnits}
            onMeasurementUnitsChange={(measurementUnits) =>
              this.setState({ measurementUnits })
            }
          />

          <DesignParameters
            youngsModulus={this.state.youngsModulus}
            onYoungsModulusChange={(youngsModulus) =>
              this.setState({ youngsModulus })
            }
            length={this.state.length}
            onLengthChange={(length) => this.setState({ length })}
            secondMomentOfInertia={this.state.secondMomentOfInertia}
            onSecondMomentOfInertiaChange={(secondMomentOfInertia) =>
              this.setState({ secondMomentOfInertia })
            }
          />

          <div className='support-outer-div'>
            <div className='support-div-title'>Pick the Support Types</div>

            <div className='support-inner-div'>
              <div className='pin-support-div'>
                <button onClick={() => this.onSupportTypeChoose('pin')}>
                  Pin
                </button>
              </div>

              <div className='roller-support-div'>
                <button onClick={() => this.onSupportTypeChoose('roller')}>
                  Roller
                </button>
              </div>

              <div className='fixed-support-div'>
                <button onClick={() => this.onSupportTypeChoose('fixed')}>
                  Fixed Support
                </button>
              </div>
            </div>
          </div>

          <div className='loads-outer-div'>
            <div className='support-div-title'>Pick the Loads</div>

            <div className='loads-inner-div'>
              <div className='point-load-div'>
                <button onClick={() => this.onLoadTypeChoose('pointLoad')}>
                  Point Load
                </button>
              </div>

              <div className='moment-load-div'>
                <button onClick={() => this.onLoadTypeChoose('moment')}>
                  Moment
                </button>
              </div>

              <div className='uniform-distributed-load-div'>
                <button onClick={() => this.onLoadTypeChoose('distrLoad')}>
                  Distributed Load
                </button>
              </div>
            </div>
          </div>

          {this.state.showSelectedSupportDiv ? (
            <div className='selected-supports'>
              {/*{this.showSupportInDiv()}*/}
              Showing selected supports
            </div>
          ) : null}

          <div className='selected-loads'>{showLoads(this.state.loads)}</div>

          <div className='sketch-div'>Sketch Div</div>
        </div>

        <ModalComponent
          isShowing={this.state.showSupportModal}
          onToggle={() =>
            this.setState({
              showSupportModal: !this.state.showSupportModal
            })
          }
        >
          <form>
            <div>
              <input
                type='radio'
                value='LHS'
                name='fixed-support-radio'
                onChange={() => this.onSupportLocationChoose('LHS')}
                required
              />
              Left Hand Side
            </div>

            <div>
              <input
                type='radio'
                value='RHS'
                name='fixed-support-radio'
                onChange={() => this.onSupportLocationChoose('RHS')}
                required
              />
              Right Hand Side
            </div>

            {this.state.selectedSupportType !== 'fixed' ? (
              <div>
                <input
                  type='radio'
                  value='AtDist'
                  name='fixed-support-radio'
                  onChange={() => this.onSupportLocationChoose('AtDist')}
                  required
                />
                At Distance
              </div>
            ) : null}

            {this.state.showDistanceBox ? (
              <div>
                <input
                  type='number'
                  value={this.state.supportDistance}
                  min={'0'}
                  onChange={(event) =>
                    this.setState({
                      supportDistance: Number.parseFloat(event.target.value)
                    })
                  }
                  required
                />
              </div>
            ) : null}

            <button onClick={() => this.addNewSupport()} type='button'>
              Add
            </button>
            <button onClick={() => this.state.showSupportModal === false}>
              Cancel
            </button>
          </form>
        </ModalComponent>

        <ModalComponent
          isShowing={this.state.showLoadModal}
          onToggle={() =>
            this.setState({
              showLoadModal: !this.state.showLoadModal
            })
          }
        >
          <form>
            <div>
              {this.state.selectedLoadType === 'pointLoad' ? (
                <div>
                  <button
                    onClick={(event) => setLoadDirection('up')}
                    type='button'
                  >
                    up
                  </button>
                  <button
                    onClick={(event) => setLoadDirection('down')}
                    type='button'
                  >
                    down
                  </button>
                  <button
                    onClick={(event) => setLoadDirection('angle')}
                    type='button'
                  >
                    angle
                  </button>

                  <div>
                    Load Distance:
                    <input
                      type='number'
                      min={'0'}
                      max={this.state.length}
                      // oninput={"this.value=Math.abs(this.value)"}
                      value={this.state.loadOrMomentDistance}
                      onChange={(event) =>
                        onLoadSideChoose(
                          Number.parseFloat(event.target.value),
                          this.state.length
                        )
                      }
                    />
                    <button
                      onClick={(event) =>
                        onLoadSideChoose('LHS', this.state.length)
                      }
                      type='button'
                    >
                      L
                    </button>
                    <button
                      onClick={(event) =>
                        onLoadSideChoose('RHS', this.state.length)
                      }
                      type='button'
                    >
                      R
                    </button>
                  </div>

                  <div>
                    Magnitude:
                    <input
                      type='number'
                      min={'0'}
                      value={this.state.loadMagnitude}
                      onChange={(event) =>
                        defineDistrLoadMagnitude(
                          'loadMagnitude',
                          Number.parseFloat(event.target.value)
                        )
                      }
                    />
                  </div>

                  <div>
                    {this.state.loadDirection === 'angle' ? (
                      <div>
                        Load Angle:
                        <input
                          type='number'
                          min={'0'}
                          value={this.state.loadAngle}
                          onChange={(event) =>
                            setLoadDirection(
                              Number.parseFloat(event.target.value)
                            )
                          }
                        />
                      </div>
                    ) : null}
                  </div>

                  <button
                    onClick={() =>
                      addNewPointOrMomentLoad(
                        this.state.selectedLoadType,
                        this.state.loadOrMomentDistance,
                        this.state.loadMagnitude,
                        this.state.loadDirection,
                        this.state.angle,
                        this.state.loads
                      )
                    }
                    type='button'
                  >
                    Add
                  </button>
                  <button onClick={() => this.state.showLoadModal === false}>
                    Cancel
                  </button>
                </div>
              ) : null}

              {this.state.selectedLoadType === 'moment' ? (
                <div>
                  <div>
                    <button
                      onClick={(event) => setLoadDirection('CCW')}
                      type='button'
                    >
                      CCW
                    </button>
                    <button
                      onClick={(event) => setLoadDirection('CW')}
                      type='button'
                    >
                      CW
                    </button>
                  </div>

                  <div>
                    Moment Distance:
                    <input
                      type='number'
                      min={'0'}
                      value={this.state.loadOrMomentDistance}
                      onChange={(event) =>
                        onLoadSideChoose(
                          Number.parseFloat(event.target.value),
                          this.state.length
                        )
                      }
                    />
                    <button
                      onClick={(event) =>
                        onLoadSideChoose('LHS', this.state.length)
                      }
                      type='button'
                    >
                      L
                    </button>
                    <button
                      onClick={(event) =>
                        onLoadSideChoose('RHS', this.state.length)
                      }
                      type='button'
                    >
                      R
                    </button>
                    <div>
                      Magnitude:
                      <input
                        type='number'
                        min={'0'}
                        value={this.state.loadMagnitude}
                        onChange={(event) =>
                          defineDistrLoadMagnitude(
                            'loadMagnitude',
                            Number.parseFloat(event.target.value)
                          )
                        }
                        required
                      />
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      addNewPointOrMomentLoad(
                        this.state.selectedLoadType,
                        this.state.loadOrMomentDistance,
                        this.state.loadMagnitude,
                        this.state.loadDirection,
                        this.state.angle,
                        this.state.loads
                      )
                    }
                    type='button'
                  >
                    Add
                  </button>
                  <button onClick={() => this.state.showLoadModal === false}>
                    Cancel
                  </button>
                </div>
              ) : null}

              {this.state.selectedLoadType === 'distrLoad' ? (
                <div>
                  <div>
                    <button
                      onClick={(event) => this.setLoadDirection('up')}
                      type='button'
                    >
                      up
                    </button>
                    <button
                      onClick={(event) => this.setLoadDirection('down')}
                      type='button'
                    >
                      down
                    </button>
                  </div>

                  <div>
                    Start Position:
                    <input
                      type='number'
                      min={'0'}
                      value={this.state.distrLoadStartPosition}
                      onChange={(event) =>
                        defineDistrLoadPosition(
                          'startPosition',
                          'atDist',
                          Number.parseFloat(event.target.value)
                        )
                      }
                      required
                    />
                    <button
                      onClick={(event) =>
                        defineDistrLoadPosition('startPosition', 'LHS')
                      }
                      type='button'
                    >
                      L
                    </button>
                    <button
                      onClick={(event) =>
                        defineDistrLoadPosition('startPosition', 'RHS')
                      }
                      type='button'
                    >
                      R
                    </button>
                  </div>

                  <div>
                    End Position:
                    <input
                      type='number'
                      min={'0'}
                      value={this.state.distrLoadEndPosition}
                      onChange={(event) =>
                        defineDistrLoadPosition(
                          'endPosition',
                          'atDist',
                          Number.parseFloat(event.target.value)
                        )
                      }
                      required
                    />
                    <button
                      onClick={(event) =>
                        defineDistrLoadPosition('endPosition', 'LHS')
                      }
                      type='button'
                    >
                      L
                    </button>
                    <button
                      onClick={(event) =>
                        defineDistrLoadPosition('endPosition', 'RHS')
                      }
                      type='button'
                    >
                      R
                    </button>
                  </div>

                  <div>
                    Start Magnitude:
                    <input
                      type='number'
                      min={'0'}
                      value={this.state.distrLoadStartMagnitude}
                      onChange={(event) =>
                        defineDistrLoadMagnitude(
                          'startMagnitude',
                          Number.parseFloat(event.target.value)
                        )
                      }
                      required
                    />
                  </div>

                  <div>
                    End Magnitude:
                    <input
                      type='number'
                      min={'0'}
                      value={this.state.distrLoadEndMagnitude}
                      onChange={(event) =>
                        defineDistrLoadMagnitude(
                          'endMagnitude',
                          Number.parseFloat(event.target.value)
                        )
                      }
                      required
                    />
                  </div>

                  <button
                    onClick={() =>
                      addNewDistributedLoad(
                        this.state.selectedLoadType,
                        this.state.distrLoadStartPosition,
                        this.state.distrLoadEndPosition,
                        this.state.distrLoadStartMagnitude,
                        this.state.distrLoadEndMagnitude,
                        this.state.loads
                      )
                    }
                    type='button'
                  >
                    Add
                  </button>
                  <button onClick={() => this.state.showLoadModal === false}>
                    Cancel
                  </button>
                </div>
              ) : null}
            </div>
          </form>
        </ModalComponent>
      </div>
    )
  }
}

export default App
