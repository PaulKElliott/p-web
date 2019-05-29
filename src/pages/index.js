import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/layout'
import Subject from '../components/subject'

const IndexPage = () => (
  <Layout subTitle="Paul Elliott's Website">
    <Subject>
      <h2>Technical Entrepreneur</h2>
      <p>Virtual Reality, Augmented Reality, 3D Graphics</p>
      <p>
        <Link to="/resume/">Resume</Link>
      </p>
    </Subject>
    <Subject>
      <h2>Contact</h2>
      <p>
			  <a href='mail&#116;o&#58;&#112;&#37;61ul&#64;v%69z&#119;o%72ks%68&#111;&#112;%&#50;Eco%6D'>&#112;aul&#64;vi&#122;&#119;or&#107;&#115;h&#111;p&#46;com</a>
        &nbsp;&nbsp;|&nbsp;&nbsp;<a href='https://www.linkedin.com/in/paulpaulelliott/'>LinkedIn</a>
      </p>
    </Subject>
    <Subject>
      <h2>Projects</h2>
      <h3>Three.js Interaction Module: SpinControls</h3>
      <p>
        Rotate 3D objects or the camera as if touching a trackball.&nbsp;&nbsp;
        <a href="https://paulkelliott.github.io/spin-controls/">Demo</a>
        &nbsp;&nbsp;|&nbsp;&nbsp; 
        <a href="https://github.com/PaulKElliott/spin-controls">Source</a>
      </p>
      <h3>VR with Projectors + Headsets + Phones</h3>
      <p>
        Use phones to interact with 3D models across monitors, projectors, and headsets seamlessly.
      </p>
      <div className='video-responsive'>
        <iframe width="560" height="315" title="VizWorkshop Demo"
        src="https://www.youtube-nocookie.com/embed/TLr6f9FNrfI?rel=0&start=19" 
        frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" 
        allowFullScreen></iframe>
      </div>
    </Subject>

    
    
  </Layout>
)

export default IndexPage