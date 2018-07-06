import React, {Component} from 'react';

import Slider from '@material-ui/lab/Slider';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import ReactMoment from 'react-moment';
import moment from 'moment';

import mapStyles from "./mapStyles"

import MapComponent from "./Map"
//TODO: MAP CHOSER
//TODO: SPEED SPLIDEr
//TODO: FOLLOW CHECKBOX

class App extends Component {
  constructor(props) {
    super(props);

    let defaultZoom = 12;
    let defaultOpacity = 0.5;
    let defaultRadius = 2;
    let defaultMaxIntensity = 6;
    let defaultCenter = {
      lat: 59.334591,
      lng: 18.063240
    }

    this.state = {
      zoom: defaultZoom,
      center: defaultCenter,
      heatmapOptions: {
        opacity: defaultOpacity,
        radius: defaultRadius,
        maxIntensity: defaultMaxIntensity
      },
      data: [],
      speed: 100,
      follow: false,
      loadingFile: false,
      fileValidated: false,
      currentCenter: {}
    };
  }

  componentDidMount() {
    this.prepareMapStyles();
  }

  startTimeLine = () => {
    let allData = this.state.data;

    let follow = this.state.follow;

    this.setState({data: [], allData: allData})

    var i = 0;
    if (this.state.startDate) {
      let chosenStartUnix = new Date(this.state.startDate).getTime() / 1000;
      for (var j = 0; j < allData.length; j++) {
        if (allData[j].timestampMs >= chosenStartUnix) {
          i = j;
          break;
        }
      }
    }
    console.log(i)

    setInterval(() => {
      this.setState({
        data: this.state.data.concat(allData.slice(i, i + this.state.speed))
      })

      let lat = allData[i].lat;
      let lng = allData[i].lng;
      let timestamp = allData[i].timestampMs
      i += this.state.speed
      if (follow) {
        this.setState({
          currentCenter: {
            lat: lat,
            lng: lng
          }
        });
      }
      this.setState({timestamp: timestamp});

    }, 10);

  }

  prepareMapStyles = () => {
    this.setState({mapStyle: mapStyles[3]})
  }

  handleOpacitySliderChange = (event, value) => {
    this.setState(prevState => ({
      heatmapOptions: {
        ...prevState.heatmapOptions,
        opacity: value
      }
    }))
  };

  handleRadiusSliderChange = (event, value) => {
    this.setState(prevState => ({
      heatmapOptions: {
        ...prevState.heatmapOptions,
        radius: value
      }
    }))
  };

  handleMaxIntensitySliderChange = (event, value) => {
    this.setState(prevState => ({
      heatmapOptions: {
        ...prevState.heatmapOptions,
        maxIntensity: value
      }
    }))
  };

  fileChosen = (event) => {
    this.setState({loadingFile: true})
    let reader = new FileReader();
    reader.onload = this.onFileRead;
    reader.readAsText(event.target.files[0]);
  }

  onFileRead = (event) => {
    var locations = JSON.parse(event.target.result).locations;

    locations = locations.map(obj => {
      let lat = obj.latitudeE7 / 10000000;
      let lng = obj.longitudeE7 / 10000000;
      let timestampMs = Math.round(obj.timestampMs) / 1000;
      return {lat: lat, lng: lng, timestampMs: timestampMs}
    }).sort((a, b) => {
      return a.timestampMs - b.timestampMs;
    });

    let startDate = moment.unix(locations[0].timestampMs).format("YYYY-MM-DD");
    let endDate = moment.unix(locations[locations.length - 1].timestampMs).format(
      "YYYY-MM-DD"
    );

    if (!startDate || !endDate || !locations) {
      console.log("FILE ERRROR")
      return;
    }

    this.setState({
      data: locations,
      metadata: {
        nPoints: locations.length,
        startDate: startDate,
        endDate: endDate
      },
      startDate: startDate,
      timestamp: locations[0].timestampMs,
      fileValidated: true,
      loadingFile: false
    })
  }

  LocationMetadata = (props) => {
    return (
      <p className="sans-serif f3 tc">
        <span className="b f2 mh3 green">FILE OK!
        </span>
        We found
        <span className="b f2 mh3">{props.metadata.nPoints.toLocaleString(navigator.language)}
        </span>
        locations spanning
        <span className="b f2 mh3">
          {props.metadata.startDate}
        </span>
        to
        <span className="b f2 mh3">
          {props.metadata.endDate}
        </span>
      </p>
    )
  }

  UploadFile = (props) => {
    if (this.state.loadingFile) {
      return <CircularProgress size={50}/>
    }
    return (
      <div>
        <h1 className="sans-serif ">
          Upload Google Location History</h1>
        <input className="sans-serif" type="file" onChange={this.fileChosen}/>
      </div>
    )
  }

  StartDatePicker = (props) => {
    return (
      <TextField
        onChange={e => this.startDateChanged(e)}
        id="date"
        label="Start date"
        type="date"
        defaultValue={this.state.startDate}
        InputLabelProps={{
          shrink: true
        }}/>
    )
  }

  MapControls = (props) => {
    return (
      <div>
        <label className="sans-serif f3 b">
          Opacity
          <Slider
            value={this.state.heatmapOptions.opacity}
            min={0}
            max={1}
            step={0.1}
            onChange={this.handleOpacitySliderChange}/>
        </label>
        <label className="sans-serif f3 b">
          Point radius
          <Slider
            value={this.state.heatmapOptions.radius}
            min={0}
            max={10}
            step={1}
            onChange={this.handleRadiusSliderChange}/>
        </label>
        <label className="sans-serif f3 b">
          Max Intensity
          <Slider
            value={this.state.heatmapOptions.maxIntensity}
            min={0}
            max={10}
            step={1}
            onChange={this.handleMaxIntensitySliderChange}/>
        </label>
      </div>
    )
  }

  TimelapseControls = (props) => {
    return (
      <div>
        <ReactMoment unix="unix" className="db sans-serif b f3">{this.state.timestamp}</ReactMoment>
        <this.StartDatePicker className="w-100 mv3"/>
        <Button
          className="w-100 mv3"
          variant="contained"
          color="primary"
          onClick={this.startTimeLine}>
          Start Timelapse
        </Button>
      </div>
    )
  }

  startDateChanged = (e) => {
    this.setState({startDate: e.target.value})
  }

  render() {
    let data = this.state.data;
    let fileValidated = this.state.fileValidated;
    let heatmapOptions = this.state.heatmapOptions;
    let metadata = this.state.metadata;

    return (
      <div className="App">
        <div className="tc mv4">
          {!fileValidated && <this.UploadFile/>}
        </div>
        {fileValidated && <this.LocationMetadata metadata={metadata}/>}

        <MapComponent
          center={this.state.center}
          currentCenter={this.state.currentCenter}
          zoom={this.state.zoom}
          data={data}
          heatmapOptions={this.state.heatmapOptions}
          mapStyle={this.state.mapStyle}/>

        <div className="w-50 fl pa4">
          {fileValidated && <this.TimelapseControls/>}
        </div>

        <div className="w-50 fl pa4">
          {fileValidated && <this.MapControls show={heatmapOptions && fileValidated}/>}
        </div>
      </div>
    );
  }
}
export default App;
