import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import { StaticQuery, graphql } from 'gatsby'

import Header from './header'
import './layout.css'
import './site.css'

const Layout = ({ children, subTitle, data }) => {
  let titleSufix = "";
  if (subTitle) {
    titleSufix =  " | " + subTitle
  }
  return (
    <StaticQuery
      query={graphql`
        query SiteTitleQuery {
          site {
            siteMetadata {
              title
            }
          }
        }
      `}
      render={data => (
        <>
          <Helmet
            title={data.site.siteMetadata.title + titleSufix} 
            meta={[
              { name: 'description', content: 'Paul Elliott\'s Website' },
              { name: 'keywords', content: 'Personal Website, Virtual Reality, Augmented Reality, 3D Graphics' },
            ]}
          >
            <html lang="en" />
          </Helmet>
          <Header />
          <div
            style={{
              margin: '0 auto',
              maxWidth: 960,
              padding: '0px 1.0875rem 1.45rem',
              paddingTop: 0,
            }}
          >
            {children}
          </div>
        </>
      )}
    />
  )
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
}

export default Layout
