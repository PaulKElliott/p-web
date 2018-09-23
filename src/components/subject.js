import React from 'react'
import PropTypes from 'prop-types'

const Subject = ({ children }) => (
  <div
    style={{
        margin: '2.0rem auto',
    }}
  >
    {children}
  </div>
)
  
Subject.propTypes = {
  children: PropTypes.node.isRequired
}
  
export default Subject