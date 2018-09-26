import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/layout'
import Subject from '../components/subject'
import Logo3D from '../components/logo3d'

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
    <h2>Projects</h2>
    <h3>Virtual Reality 3D Model Viewer</h3>
    <p>
      Use your computer and phone to interact with 3D models in Virtual Reality.
      &nbsp;<a href="https://youtu.be/TLr6f9FNrfI?t=19s">Video</a>
    </p>
    </Subject>
    <Subject>
      <h2>Contact</h2>
      <p>
			  <a href='mail&#116;o&#58;&#112;&#37;61ul&#64;v%69z&#119;o%72ks%68&#111;&#112;%&#50;Eco%6D'>&#112;aul&#64;vi&#122;&#119;or&#107;&#115;h&#111;p&#46;com</a>
        &nbsp;&nbsp;|&nbsp;&nbsp;<a href='https://www.linkedin.com/in/paulpaulelliott/'>LinkedIn</a>
      </p>
    </Subject>
    <div style={{ width: '100%', height: '600px', marginTop: '-5rem',
      clipPath: 'inset(14% 0% 0 0)' }} >
      <Logo3D />
    </div>
  </Layout>
)

export default IndexPage