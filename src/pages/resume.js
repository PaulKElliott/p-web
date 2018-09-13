
import React from 'react'
import Layout from '../components/layout'

import resumePDF from './Paul_Elliott_Resume.pdf'

import './resume.css'
import htmlFile from 'raw-loader!./PaulElliottResume.html'
function createMarkup() {
  return {__html: htmlFile};
}

const ResumePage = () => (
  <Layout subTitle="Resume">
    <a href={resumePDF}>Get PDF</a>
    <br />
    <br />
    <div dangerouslySetInnerHTML={createMarkup()} />
  </Layout>
)


export default ResumePage

