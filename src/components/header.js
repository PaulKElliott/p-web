import React from 'react'
import { Link, StaticQuery, graphql } from 'gatsby'
import Img from "gatsby-image"
import Logo3D from '../components/logo3d'

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
            fluid(maxWidth: 100, maxHeight: 100) {
              ...GatsbyImageSharpFluid
            }
          }
        }
      }
    `}
    render={data => (
      <div
        id='headerGroup'
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
            overflow: 'auto',
          }}
        >
          <div //Logo and title
            style={{ 
                float: 'left',
                width: '20em', //360
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
                <div
                  style={{
                    float: 'left',
                    width: '48px',
                    height: '48px',
                    marginRight: '0.6rem',
                    marginTop: '.3rem',
                    marginBottom: '0',
                  }}
                >
                  <Logo3D />
                </div>
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
          <Img className='hide-small-screens' fluid={data.fileNamey.childImageSharp.fluid } alt="face" 
            style={{
              marginRight: '0',
              marginLeft: 'auto',
              verticalAlign: 'middle',
              maxWidth: '100px',
            }}
          />
          <div style={{clear: 'both'}}></div>
        </div>
      </div>
    )}
  />
)

export default Header
