
import React from 'react'
import Layout from '../components/layout'

import resumePDF from './Paul Elliott Resume.pdf'

import './resume.css'
import htmlFile from 'raw-loader!./PaulElliottResume.html'
function createMarkup() {
  return {__html: htmlFile};
}

const ResumePage = () => (
  <Layout subTitle="Paul Elliott's Resume">
    <div id='getPDFLink'>
      <a href={resumePDF}>Get PDF</a>
      <br />
      <br />
    </div>
    <div dangerouslySetInnerHTML={createMarkup()} />
  </Layout>
)


export default ResumePage

