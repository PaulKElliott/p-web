import React from 'react'
import { Link, StaticQuery, graphql } from 'gatsby'
import Img from "gatsby-image"
import logo from "../images/vw-icon.png"

const Header = () => (
  <StaticQuery
    query={graphql`
      query {
        site {
          siteMetadata {
            title
          }
        }
        fileNamey: file(relativePath: { eq: "images/face.jpg" }) {
          childImageSharp {
            fixed(height: 100, width: 100,
              duotone: {
                highlight: "#FFFFFF",
                shadow: "#6666FF"
              }) {
              ...GatsbyImageSharpFixed
            }
          }
        }
      }
    `}
    render={data => (
      <div
        style={{
          background: 'white',
          marginBottom: '1.5rem',
          boxShadow: '0px 0px 5px #6666FF', /* offset-x | offset-y | blur-radius | color */
        }}
      >
        <div
          style={{
            margin: '0 auto',
            maxWidth: 960,
            padding: '1.0rem 1.0rem',
          }}
        >
          <div style={{
              float: 'right',
            }}
          >
            <Img fixed={data.fileNamey.childImageSharp.fixed} />
          </div>
          <div>
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
                  marginTop: '.2rem',
                  marginBottom: '.5rem',
                }}
                />
                {data.site.siteMetadata.title}
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
          <div style={{clear: 'both'}}></div>
        </div>
      </div>
    )}
  />
)

export default Header
