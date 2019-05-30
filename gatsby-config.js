module.exports = {
  siteMetadata: {
    title: 'VizWorkshop',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'VizWorkshop: Paul Elliott\'s Website',
        short_name: 'VizWorkshop',
        start_url: '/',
        background_color: '#6666FF',
        theme_color: '#6666FF',
        display: 'browser',
        icon: 'src/images/vw-icon.png', // This path is relative to the root of the site.
      },
    },
    'gatsby-plugin-offline',
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `files`,
        path: `${__dirname}/src/`,
      },
    },
    {
      resolve: `gatsby-plugin-sharp`,
      options: {
        stripMetadata: true,
        defaultQuality: 75,
      },
    },
    `gatsby-transformer-sharp`,
    {
      resolve: `gatsby-plugin-google-analytics`,
      options: {
        trackingId: "UA-6650449-1",
        head: true,
        anonymize: true,
        respectDNT: false,
      },
    },
  ],
}
