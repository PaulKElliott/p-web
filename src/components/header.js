import React from 'react'
import { Link } from 'gatsby'
import logo from "../images/vw-icon.png"

const Header = ({ siteTitle }) => (
  <div
    style={{
      background: 'white',
      marginBottom: '1.5rem',      
      boxShadow: '0px 0px 5px #6666ff', /* offset-x | offset-y | blur-radius | color */
    }}
  >
    <div
      style={{
        margin: '0 auto',
        maxWidth: 960,
        padding: '1.0rem 1.0rem',
      }}
    >
      <h1 
        style={{ 
          margin: "0rem 0rem 1rem",
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: '2.5rem',
            color: 'black',
            textDecoration: 'none',
          }}
        >
          <img src={logo} alt="Logo" 
          style={{
            float: 'left',
            maxWidth: 48,
            marginRight: '0.6rem',
            marginBottom: '0rem',
          }}
          />
          {siteTitle}
        </Link>
      </h1>
      <h3
        style={{
          margin: '0rem 0rem',
        }}
      >
        Paul Elliott's Website
      </h3>
    </div>
  </div>
)

export default Header
