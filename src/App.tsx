import React, {useState, useRef, useEffect, useCallback} from 'react';
import logo from './logo.svg';
import './App.css';
import Carousel from 'react-material-ui-carousel'
import { Stack, Paper, Button, Divider } from '@mui/material'

import elevationProfile from './static/img/profile.png'
import elevationProfileBearing from './static/img/profile-bearing.png'

import Map from './components/map.js';
import FadeInOut from './components/FadeInOut.js';

import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

function App() {
  let steps:number[] = [0, 3, 2, 0, 3, 3, 2, 1, 1, 0];

  const [step, setStep] = useState<[number, number]>([0, 0]);
  const [stepForward, setStepForward] = useState<boolean | null>(null);
  const [additionalPoints, setAdditionalPoints] = useState(0);
  const additionalPointsRef = useRef(additionalPoints);
  additionalPointsRef.current = additionalPoints


  function carouselChange(next:any, active:any) {
    setStep([next, 0]);
    setStepForward(next > active);
  };

  const changeChild = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        setStepForward(false);
        setStep(curStep => {
          let majorStep = curStep[0];
          let minorStep = curStep[1];

          if ((majorStep == 7 && minorStep == 1 && additionalPointsRef.current > 0)) {
            setAdditionalPoints(0);
            return [majorStep - 1, steps[majorStep - 1]];
          }
          else if ((minorStep == 0 && majorStep != 0))
            {
              return [majorStep - 1, steps[majorStep - 1]];
            }
          else if (minorStep > 0) return [majorStep, minorStep - 1];

          return curStep; // no change
        });
      } else if (e.key === "ArrowRight") {
        stepForwardAction();
       }
    },
    []
  );

  let stepForwardAction = function() {
     setStepForward(true);
        setStep(curStep => {
          let majorStep = curStep[0];
          let minorStep = curStep[1];

          if (majorStep == steps.length) return curStep;
          if (minorStep == steps[majorStep] && majorStep < steps.length) return [majorStep + 1, 0];
          if (minorStep < steps[majorStep]) return [majorStep, minorStep + 1];
          return curStep;
        }
      )
  }

  let addPoint = function(e:React.MouseEvent<HTMLElement>) {
    e.stopPropagation();
    setAdditionalPoints(additionalPoints + 1);
  }

  let removePoint = function(e:React.MouseEvent<HTMLElement>) {
    e.stopPropagation();
    setAdditionalPoints(additionalPoints - 1);
  }

  useEffect(() => {
    document.addEventListener("keydown", changeChild);

    return function cleanup() {
      document.removeEventListener("keydown", changeChild);
    };
  });

  return (
    <div className="App" onClick={() => { stepForwardAction()}}>
      <Stack className="Main-content" spacing={2} divider={<Divider flexItem />}>
      <Carousel
        index={step[0]}
        autoPlay={false}
        onChange={ (next, active) => { carouselChange(next, active) }}
        >

        <Paper className="Step-description short-paper">
          <h1>Introduction</h1>
          <p>Using a compass and a paper map, you can pinpoint your location. How accurate is it really? How does compass accuracy affect your end result? These next few diagrams and graphs will explore triangulation and compass accuracy.</p>
          <p>Tap the screeen or use your <KeyboardArrowLeftIcon style={{fontSize:'small'}} /> and <KeyboardArrowRightIcon style={{fontSize:'small'}} /> keys to navigate this demonstration.</p>
        </Paper>
        <Paper className="Step-description tall-paper">
          <h1>Triangulation Overview</h1>
            <p>Let's say you know you are on the trail in red.  From a point on the trail, you see the following features around you, Shastina, Mt. Shasta, and Gray Butte.</p>


            <img src={elevationProfile} width='70%' height='100px' />

            <FadeInOut show={step[0] == 1 && step[1] >= 1}>
              <img src={elevationProfileBearing} width='70%' />
              <p>With your compass, you measure the bearing to Gray Butte at 80° due east. <FadeInOut show={step[1] >= 2}> On your map, you draw an 80° line from Gray Butte until it intserects the trail.</FadeInOut><FadeInOut show={step[1] >=3}> You now know you are at the intersection of the red lines.</FadeInOut></p>

            </FadeInOut>
        </Paper>
        <Paper className="Step-description medium-paper">
        <h1>Triangulation Overview, continued</h1>
          <p>If you have absolutely no idea where you are, you can take an additional bearing to orient yourself.
            <FadeInOut show={step[1] >= 1}>&nbsp; You now know you are somewhere on the red 42° line to Mt. Shasta.</FadeInOut>
            <FadeInOut show={step[1] >= 2}>&nbsp; Similar to the previous example, a bearing will pinpoint where along a known line you are.</FadeInOut>
          </p>
        </Paper>
        <Paper className="Step-description medium-paper">
          <h1>Taking a Bearing</h1>
          <p>Taking a bearing is as simple as pointing a compass and rotating the bezel until the needle aligns with the orienting arrow.</p>
          <p>A common rule of thumb is that a bearing is accurate to 2°, but how does this affect navigating and orienting?</p>
        </Paper>
        <Paper className="Step-description medium-paper">
          <h1>Bearing & Course error</h1>
          <p>A bearing off by 2 degrees to the left or right over 1km could land you 35m left or right of your intended location.</p>
          <p>
            <FadeInOut show={step[0] == 4 && step[1] >= 1}>Your target error depends on the bearing error</FadeInOut>
            <FadeInOut show={step[0] == 4 && step[1] >= 2}> as well as distance.</FadeInOut>
            <FadeInOut show={step[0] == 4 && step[1] >= 3}> Walking in a straight line, off by 2° to Mt. Shasta could put you off target by 367.  Easily correctable by visual cues along the way, but when triangulating, the errors compound.</FadeInOut>
          </p>
        </Paper>
        <Paper className="Step-description tall-paper">
          <h1>Triangulation Error</h1>
          <p>
            Starting with our previous triangulation calculation, we can see what happens if the bearings were inaccurate.
            <FadeInOut show={step[0] == 5 && step[1] >= 1}>  The left bearing now shows an error of 2° in either direction. </FadeInOut>
            <FadeInOut show={step[0] == 5 && step[1] >= 2}>  Your triangulated position could be anywhere along a 3.6km line, or up to 1.8km away from your actual location.</FadeInOut>
          </p>

          
          <FadeInOut show={step[0] == 5 && step[1] >=3}>
            <p>
            Adding an error to the right bearing tells a different story.  The error now becomes an area instead of a length.  Triangulating two landmarks 10km away in this example, with a bearing of +/- 2° accuacy, we find ourselves anywhere within a 3km<sup>2</sup> area and up to 4km away from our actual location.
            </p>

            <p>
            Suddenly, a simple concept of triangulation escalates when accounting for a slight, real, inaccuracy in compass usage
            </p>
          </FadeInOut>
        </Paper>
        <Paper className="Step-description medium-paper">
          <h1>Triangulating Collinear Points</h1>

          <p>To hammer in the point, let's consider triangulating a point in front and behind you.</p>

          <p>
            <FadeInOut show={step[0] == 6 && step[1] >= 1}>
              The front bearing is 1° off to the right.
            </FadeInOut>
            <FadeInOut show={step[0] == 6 && step[1] >= 2}>
               &nbsp;Whereas the rear bearing is 1° off to the left.
            </FadeInOut>
          </p>

          <FadeInOut show={step[0] == 6 && step[1] >= 2}>
          <p>Notice how the two lines never intersect? When the angular distance of the two triangulation points is very large, in this case 180°, a small error can result in our bearings never intersection.  Or, as we saw earlier, when the angular distance is relatively small, &lt;20°, a small error can result it a long skinny area of possible locations. </p>
          </FadeInOut>
        </Paper>
        <Paper className="Step-description medium-paper">
          <h1>Triangulating Orthogonal Points</h1>

          <p>When triangulating with only two points, choosing two orthogonal points will minimize the area when accounting for compass error.</p>

          <FadeInOut show={step[0] == 7 && step[1] >= 1}>
          <p>With the same compass error (+/- 2°) as before, our area is about .5km<sup>2</sup> and any point in this area is less than 750m from the correct location. This results in an area 6x smaller than our previous example.</p>
          </FadeInOut>
        </Paper>
        <Paper className="Step-description medium-tall-paper">
          <h1>Triangulation with Multiple Points</h1>

          <p>In the field, you are limited by many factors including: visibility, map size & scale, and compass accuracy.  You can improve your triangulation accuracy further by choosing multiple points.  Each point will further narrow your resulting area.</p>

          <FadeInOut show={step[0] == 8 && step[1] >= 1}>
            <p>Adding a third triangulation point significantly reduces our potential area by the triangle formed by the 3 intersecting lines. Try adding more. <FadeInOut show={additionalPoints >= 4}>Not all lines intersect, nor do all intersections shrink the triangulation error.</FadeInOut></p>
          </FadeInOut>

          <FadeInOut className='paper-footer' style={{marginLeft:'3.5em'}} show={step[0] == 8 && step[1] >= 1}>
            <Button onClick={(e) => { addPoint(e) }} variant='contained'>Add Point</Button> <Button disabled={additionalPoints == 0} onClick={(e) => { removePoint(e) }} variant='outlined'>Remove Point</Button>
          </FadeInOut>
        </Paper>
        <Paper className="Step-description medium-paper">
          <h1>Conclusion</h1>

          <p>In theory, triangulation is a surefire skill for orientation. On the otherhand, compass acccuracy and point selection require practice to reliably triangulate.</p>

          <p>Often times, thorough planning and recognizing topography of your surroundings are enough to orient yourself on a map.</p>
        </Paper>
      </Carousel>
      <Paper className="Map-container">
        <Map step={step} stepForward={stepForward} additionalPoints={additionalPoints} />
      </Paper>
      </Stack>
    </div>
  );
}

export default App;