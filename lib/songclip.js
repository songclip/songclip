'use strict'

const axios = require('axios')
const randomString = require('randomstring')

const SNGCLP_API_URL = process.env.SNGCLP_MODE === 'production' ? 'https://api.songclip.com' : 'https://sandbox-api.songclip.com'
const SNGCLP_DEFAULT_LIMIT = process.env.SNGCLP_DEFAULT_LIMIT || 20
const SNGCLP_DEFAULT_PAGE = 1

/**
 * Songclip API endpoints wrapper library.
 *
 * Class that manages a session (identified by the context parameter named "sessionId")
 * for a user (identified by an anonymized "uniqueId" sent as part of the context parameter 
 * in all calls).
 *
 * @class
 * @link https://songclip.docs.apiary.io/#
 *
 */
class Songclip {

  /**
   * Configuration settings for all calls.
   * 
   * @param {Object} config                Configuration object.
   * @param {string} config.apiKey         Partner's API key to use Songclip API.
   * @param {string} config.authorization  Authorization string, for example: 'Bearer asfasdfa...'.
   * @param {number} config.timeout        Timeout of axios calls in milliseconds, default: 0.
   * @param {Object} config.proxy          Proxy axios configuration object proxy, for example: {
   *    host: '127.0.0.1',
   *    port: 9000,
   *    auth: {
   *      username: 'mikeymike',
   *      password: 'rapunz3l'
   *    }
   *  } 
   */
  constructor(config = {
    apiKey: null,
    authorization: null, 
    timeout: 0,
  }) {
    this.config = config || {}
    this.sessionId = null
  }

  /**
   * Builds header section with corresponding apiKey and Authorization params
   * provided in constructor.
   *
   * @access     private
   *
   * @return {Object} Return headers object for axios endpoint call.
   */
  getHeaders() {
    return {
      apikey: this.config.apiKey,
      authorization: this.config.authorization,
    }
  }

  /**
   * Generates a "uniqueId" for session, if none is provided in the context
   * parameter of calls. 
   *
   * @access     private
   *
   * @return {Object} Return headers object for axios endpoint call.
   */
  generateUniqueId() {
    this.uniqueId = randomString.generate()
    return this.uniqueId
  }

  /**
   * Get current value for "uniqueId".
   *
   * @return {string} Return current fvalue for uniqueId.
   */
  getUniqueId() {
    return this.uniqueId || this.generateUniqueId()
  }

  /**
   * Populates context object for API calls with set values for 
   * "sessionId", "uniqueId", "sourcePlatform".
   *
   * @param {Object}   context     Given context.
   *
   * @return {Object} context      Returns "context" object with existing "sessionId", 
   *                               "uniqueId" and "sourcePlatform" values
   */
  populateContext(context = {}) {
    const auxContext = { ...context }
    if (!auxContext.sessionId && this.sessionId) {
      auxContext.sessionId = this.sessionId
    }
    if (!auxContext.sourcePlatform) {
      auxContext.sourcePlatform = 'web'
    }
    if (!auxContext.uniqueId) {
      auxContext.uniqueId = this.uniqueId || this.generateUniqueId()
    }
    
    return auxContext
  }

  /**
   * Search for songclips.
   *
   * Search for clips with a query string or tags. Optional: minLength & maxLength, shuffle, page and limit
   *
   * @link https://songclip.docs.apiary.io/#reference/0/songclip-audio-files/search-songclip-audio-files
   *
   * @param {Object} params                 Parameters for call
   * @param {string} params.q               Query string to search (either "q" and/or "context.tags" must be provided)
   * @param {number} params.limit           Max. number of elements to be retrieved (default: 20)
   * @param {number} params.page            Page (default: 1)
   * @param {boolean} params.shuffle        Shuffle contents in current page (default: false)
   * @param {number} params.minLength       Minimum length in seconds (including value provided, default: 0)
   * @param {number} params.maxLength       Max length in seconds (included value provided, default: infinite)
   * @param {number} params.allowDuplicates Enable or disable duplicate content based on artist and title (default: true)
   * @param {Object} params.context         Context for call
   * @param {string} params.sourcePlatform  Source platform, default 'web', other: 'iOS', 'Android', etc.
   * @param {string} params.uniqueId        Anonimized ID for user, to keep context for future calls. If not set, one is generated.
   * @param {string} params.sessionId       ID for current session (identifier to group calls done from a user in a period of time defined by partner) 
   *                                        If not set, will use one coming from the first response.
   * @param {Array of String} params.tags   Tags to match search, for example: ['love', 'flirt']
   *
   * @return {Array} Clips (each clip is an object with: id, artist, title, lyrics[if available], coverUrl, audioUrl and duration) found.
   */
  async search(params = {
    q: null,
    limit: SNGCLP_DEFAULT_LIMIT,
    page: SNGCLP_DEFAULT_PAGE,
    shuffle: false,
    minLength: null,
    maxLength: null,
    allowDuplicates: true,
    context: {
      sourcePlatform: 'web',
      uniqueId: '',
      sessionId: null,
      tags: [],
    },
  }) {
    const headers = this.getHeaders()
    const { q, context = {}, page = SNGCLP_DEFAULT_PAGE, limit = SNGCLP_DEFAULT_LIMIT, shuffle = false, minLength = 0, maxLength = 10000} = params
    const auxContext = this.populateContext(context)
    
    try {
      const response = await axios({
        url: `${SNGCLP_API_URL}/songclips`,
        method: 'get',
        headers,
        params: {
          q,
          context: auxContext,
          page,
          limit,
          shuffle,
          minLength,
          maxLength,
          allowDuplicates,
        },
        timeout: this.config.timeout || 0,
        responseType: 'json',
        responseEncoding: 'utf8',
        maxRedirects: 5,
        proxy: this.config.proxy || null,
      })

      const { data = {}, status } = response && response.data ? response.data : {}

      if (!this.sessionId && data.context ) {
        this.sessionId = data.context.sessionId
      }
      if (status !== 'success') {
        throw new Error(`[Songclip][search] ${JSON.stringify(data || {})}`)
      }
      return data ? data.songclips : []
    } catch (error) {
      throw new Error(`[Songclip][search] ${error}`)
    }
  }

  /**
   * Get all available collections.
   *
   * Get collections curated for corresponding partner. Each collection has an object with the following
   * fields: {term, color, backgroundGifUrl, backgroundWebpUrl}
   *
   * @link https://songclip.docs.apiary.io/#reference/0/songclip-audio-files/list-songclips-collections
   *
   * @param {Object} params                 Parameters for call
   * @param {Object} params.context         Context for call
   * @param {string} params.sourcePlatform  Source platform, default 'web', other: 'iOS', 'Android', etc.
   * @param {string} params.uniqueId        Anonimized ID for user, to keep context for future calls. If not set, one is generated.
   * @param {string} params.sessionId       ID for current session (identifier to group calls done from a user in a period of time defined by partner) 
   *                                        If not set, will use one coming from the first response.
   * @param {minLength}
   *
   * @return {Array} collections, each with {term, color, backgroundGifUrl, backgroundWebpUrl}
   */
  async getCollections(context = {}) {
    const headers = this.getHeaders()
    const auxContext = this.populateContext(context)
    try {
      const response = await axios({
        url: `${SNGCLP_API_URL}/songclips/collections`,
        method: 'get',
        headers,
        params: { context: auxContext },
        timeout: this.config.timeout || 0,
        responseType: 'json',
        responseEncoding: 'utf8',
        maxRedirects: 5,
        proxy: this.config.proxy || null,
      })

      const { data = {}, status } = response && response.data ? response.data : {}

      if (!this.sessionId && data.context ) {
        this.sessionId = data.context.sessionId
      }
      if (status !== 'success') {
        throw new Error(`[Songclip][getCollections] ${JSON.stringify(data || {})}`)
      }
      return data ? data.collections : []
    } catch (error) {
      throw new Error(`[Songclip][getCollections] ${error}`)
    }
  }

  /**
   * Retrieve clips from collection identified by 'term'.
   *
   * Get clips for given collection identified by 'term'. Optional: minLength & maxLength, shuffle, page and limit
   *
   * @link https://songclip.docs.apiary.io/#reference/0/songclip-audio-files/search-songclip-audio-files
   *
   * @param {Object} params                 Parameters for call
   * @param {string} params.term            Identifier for collection, default 'trending'
   * @param {number} params.limit           Max. number of elements to be retrieved (default: 20)
   * @param {number} params.page            Page (default: 1)
   * @param {boolean} params.shuffle        Shuffle contents in current page (default: false)
   * @param {number} params.minLength       Minimum length in seconds (including value provided, default: 0)
   * @param {number} params.maxLength       Max length in seconds (included value provided, default: infinite)
   * @param {Object} params.context         Context for call
   * @param {string} params.sourcePlatform  Source platform, default 'web', other: 'iOS', 'Android', etc.
   * @param {string} params.uniqueId        Anonimized ID for user, to keep context for future calls. If not set, one is generated.
   * @param {string} params.sessionId       ID for current session (identifier to group calls done from a user in a period of time defined by partner) 
   *                                        If not set, will use one coming from the first response.
   * @param {Array of String} params.tags   Tags to match search, for example: ['love', 'flirt']
   *
   * @return {Array} Clips (each clip is an object with: id, artist, title, lyrics[if available], coverUrl, audioUrl and duration) found.
   */
  async getCollection(params = {}) {
    const headers = this.getHeaders()
    const { term = 'trending', context = {}, page = SNGCLP_DEFAULT_PAGE, limit = SNGCLP_DEFAULT_LIMIT, shuffle = false, minLength = 0, maxLength = 10000 } = params
    const auxContext = this.populateContext(context)
    try {
      const auxTerm = term && typeof term === 'string' ? encodeURI(term) : 'trending'

      const response = await axios({
        url: `${SNGCLP_API_URL}/songclips/collections/${auxTerm}`,
        method: 'get',
        headers,
        params: { context: auxContext, page, limit, shuffle, minLength, maxLength },
        timeout: this.config.timeout || 0,
        responseType: 'json',
        responseEncoding: 'utf8',
        maxRedirects: 5,
        proxy: this.config.proxy || null,
      })

      const { data = {}, status } = response && response.data ? response.data : {}

      if (!this.sessionId && data.context ) {
        this.sessionId = data.context.sessionId
      }
      if (status !== 'success') {
        throw new Error(`[Songclip][getCollection] ${JSON.stringify(data || {} )}`)
      }
      return data ? data.songclips : []
    } catch (error) {
      throw new Error(`[Songclip][getCollection] ${error}`)
    }
  }

  /**
   * Search for songclips related to given clip (identified by id).
   *
   * Search for clips related to a given clip (identified by id)
   *
   * @link https://songclip.docs.apiary.io/#reference/0/songclip-audio-files/related-songclip-audio-files-for-songclip-audio-file
   *
   * @param {Object} params                 Parameters for call
   * @param {string} params.id              Clip ID to find related clips for (Mandatory)
   * @param {number} params.limit           Max. number of elements to be retrieved (default: 20)
   * @param {number} params.page            Page (default: 1)
   * @param {boolean} params.shuffle        Shuffle contents in current page (default: false)
   * @param {number} params.minLength       Minimum length in seconds (including value provided, default: 0)
   * @param {number} params.maxLength       Max length in seconds (included value provided, default: infinite)
   * @param {Object} params.context         Context for call
   * @param {string} params.sourcePlatform  Source platform, default 'web', other: 'iOS', 'Android', etc.
   * @param {string} params.uniqueId        Anonimized ID for user, to keep context for future calls. If not set, one is generated.
   * @param {string} params.sessionId       ID for current session (identifier to group calls done from a user in a period of time defined by partner) 
   *                                        If not set, will use one coming from the first response.
   * @param {Array of String} params.tags   Tags to match search, for example: ['love', 'flirt']
   *
   * @return {Array} Related clips found (each clip is an object with: id, artist, title, lyrics[if available], coverUrl, audioUrl and duration).
   */
  async getRelated( params = {}) {
    const headers = this.getHeaders()
    const { id, context = {}, page = SNGCLP_DEFAULT_PAGE, limit = SNGCLP_DEFAULT_LIMIT, shuffle = false, assetType = 'songclip', minLength = 0, maxLength = 10000 } = params
    const auxContext = this.populateContext(context)
    try {
      const response = await axios({
        url: assetType === 'songclip' ? `${SNGCLP_API_URL}/songclips/${id}/related` : `${SNGCLP_API_URL}/songclips/${id}/related/gifnotes`,
        method: 'get',
        headers,
        params: { context: auxContext, page, limit, shuffle, minLength, maxLength },
        timeout: this.config.timeout || 0,
        responseType: 'json',
        responseEncoding: 'utf8',
        maxRedirects: 5,
        proxy: this.config.proxy || null,
      })

      const { data = {}, status } = response && response.data ? response.data : {}

      if (!this.sessionId && data.context ) {
        this.sessionId = data.context.sessionId
      }
      if (status !== 'success') {
        throw new Error(`[Songclip][getRelated] ${JSON.stringify(data || {} )}`)
      }
      return data ? data.songclips ? data.songclips : data.gifnotes : []
    } catch (error) {
      throw new Error(`[Songclip][getRelated] ${error}`)
    }
  }

  /**
   * Sends an open "App" event.
   *
   * Sends an open "App" event when the "Songclip" content is first used in the user's session.
   * It is usually related to a button that enables the songclip content to be surfaced in the current user's session.
   *
   * @link https://songclip.docs.apiary.io/#reference/0/events/send-app-open-event
   *
   * @param {Object} params.context         Context for call
   * @param {string} params.sourcePlatform  Source platform, default 'web', other: 'iOS', 'Android', etc.
   * @param {string} params.uniqueId        Anonimized ID for user, to keep context for future calls. If not set, one is generated.
   * @param {string} params.sessionId       ID for current session (identifier to group calls done from a user in a period of time defined by partner) 
   *                                        If not set, will use one coming from the first response.
   * @return {Object|boolean} response object { status: string } or false if unsuccessful call, status = 'success' if call is OK
   */
  async postAppOpen(params = {}) {
    const headers = this.getHeaders()
    const { context = {} } = params || {}
    const auxContext = this.populateContext(context || {})
    try {
      const response = await axios({
        url: `${SNGCLP_API_URL}/events/open`,
        method: 'post',
        headers,
        data: { context: auxContext },
        timeout: this.config.timeout || 0,
        responseType: 'json',
        responseEncoding: 'utf8',
        maxRedirects: 5,
        proxy: this.config.proxy || null,
      })

      const { data = {}, status } = response && response.data ? response.data : {}

      if (!this.sessionId && data.context ) {
        this.sessionId = data.context.sessionId
      }
      if (status !== 'success') {
        throw new Error(`[Songclip][postAppOpen] ${JSON.stringify(data || {} )}`)
      }
      return response.data || false
    } catch (error) {
      throw new Error(`[Songclip][postAppOpen] ${error}`)
    }
  }

  /**
   * Sends a play clip/gifnote (identified by ID) event.
   *
   * POSTs a play event for clip/gifnote (identified by ID). It is used for music reporting services to Labels/Publishers/PRO.
   *
   * @link https://songclip.docs.apiary.io/#reference/0/songclip-audio-files/send-a-songclip-audio-file-play-event
   * @link https://songclip.docs.apiary.io/#reference/0/songclip-gif-videos/send-a-songclip-gif-video-play-event
   *
   * @param {Object} params                 Parameters for call
   * @param {Number} params.id              Clip/Gifnote identifier
   * @param {string} params.assetType       Type of asset ('songclip' or 'gifnote'). Default is 'songclip'
   * @param {Object} params.context         Context for call
   * @param {string} params.sourcePlatform  Source platform, default 'web', other: 'iOS', 'Android', etc.
   * @param {string} params.uniqueId        Anonimized ID for user, to keep context for future calls. If not set, one is generated.
   * @param {string} params.sessionId       ID for current session (identifier to group calls done from a user in a period of time defined by partner) 
   *                                        If not set, will use one coming from the first response.
   * @return {Object|boolean} response object { status: string } or false if unsuccessful call, status = 'success' if call is OK
   */
  async postPlayEvent({ id, context = {}, assetType = 'songclip' }) {
    const headers = this.getHeaders()
    const auxContext = this.populateContext(context)
    try {
      const response = await axios({
        url: assetType === 'songclip' ? `${SNGCLP_API_URL}/songclips/${id}/events/play` : `${SNGCLP_API_URL}/gifnotes/${id}/events/play`,
        method: 'post',
        headers: { ...headers, 'content-type': 'application/json' },
        data: JSON.stringify({ context: auxContext }),
        timeout: this.config.timeout || 0,
        responseType: 'json',
        responseEncoding: 'utf8',
        maxRedirects: 5,
        proxy: this.config.proxy || null,
      })

      const { data = {}, status } = response && response.data ? response.data : {}

      if (!this.sessionId && data.context ) {
        this.sessionId = data.context.sessionId
      }
      if (status !== 'success') {
        throw new Error(`[Songclip][postPlayEvent] ${JSON.stringify(data || {} )}`)
      }
      return response.data || false
    } catch (error) {
      throw new Error(`[Songclip][postPlayEvent] ${error}`)
    }
  }

  /**
   * Sends a share clip/gifnote (identified by ID) event.
   *
   * POSTs a share event for clip/gifnote (identified by ID). It is used for music reporting services to Labels/Publishers/PRO.
   *
   * @link https://songclip.docs.apiary.io/#reference/0/songclip-audio-files/send-a-songclip-audio-file-share-event
   * @link https://songclip.docs.apiary.io/#reference/0/songclip-gif-videos/send-a-songclip-gif-video-share-event
   *
   * @param {Object} params                 Parameters for call
   * @param {Number} params.id              Clip/Gifnote identifier
   * @param {string} params.assetType       Type of asset ('songclip' or 'gifnote'). Default is 'songclip'
   * @param {Object} params.context         Context for call
   * @param {string} params.sourcePlatform  Source platform, default 'web', other: 'iOS', 'Android', etc.
   * @param {string} params.uniqueId        Anonimized ID for user, to keep context for future calls. If not set, one is generated.
   * @param {string} params.sessionId       ID for current session (identifier to group calls done from a user in a period of time defined by partner) 
   *                                        If not set, will use one coming from the first response.
   * @return {Object|boolean} response object { status: string } or false if unsuccessful call, status = 'success' if call is OK
   */
  async postShareEvent({ id, context = {}, assetType = 'songclip' }) {
    const headers = this.getHeaders()
    const auxContext = this.populateContext(context)
    try {
      const response = await axios({
        url: assetType === 'songclip' ? `${SNGCLP_API_URL}/songclips/${id}/events/share` : `${SNGCLP_API_URL}/gifnotes/${id}/events/share`,
        method: 'post',
        headers,
        data: { context: auxContext },
        timeout: this.config.timeout || 0,
        responseType: 'json',
        responseEncoding: 'utf8',
        maxRedirects: 5,
        proxy: this.config.proxy || null,
      })

      const { data = {}, status } = response && response.data ? response.data : {}

      if (!this.sessionId && data.context ) {
        this.sessionId = data.context.sessionId
      }
      if (status !== 'success') {
        throw new Error(`[Songclip][postShareEvent] ${JSON.stringify(data || {} )}`)
      }
      return response.data || false
    } catch (error) {
      throw new Error(`[Songclip][postShareEvent] ${error}`)
    }
  }

  /**
   * Sends an Add clip (identified by ID) event.
   *
   * POSTs an add event for given clip (identified by ID). It is used to notify that the user is actually merging the content into 
   * some other type of asset. It is used for music reporting services to Labels/Publishers/PRO.
   *
   * @link https://songclip.docs.apiary.io/#reference/0/songclip-audio-files/send-a-songclip-audio-file-add-event
   *
   * @param {Object} params                 Parameters for call
   * @param {Number} params.id              Clip identifier
   * @param {string} params.assetType       Type of asset ('songclip' or 'gifnote'). Default is 'songclip' (not implemented for 'gifnote' in Songclip API v2.4.4)
   * @param {Object} params.context         Context for call
   * @param {string} params.sourcePlatform  Source platform, default 'web', other: 'iOS', 'Android', etc.
   * @param {string} params.uniqueId        Anonimized ID for user, to keep context for future calls. If not set, one is generated.
   * @param {string} params.sessionId       ID for current session (identifier to group calls done from a user in a period of time defined by partner) 
   *                                        If not set, will use one coming from the first response.
   * @return {Object|boolean} response object { status: string } or false if unsuccessful call, status = 'success' if call is OK
   */
  async postAddEvent({ id, context = {}, assetType = 'songclip' }) {
    const headers = this.getHeaders()
    const auxContext = this.populateContext(context)
    try {
      const response = await axios({
        url: assetType === 'songclip' ? `${SNGCLP_API_URL}/songclips/${id}/events/add` : `${SNGCLP_API_URL}/gifnotes/${id}/events/add`,
        method: 'post',
        headers,
        data: { context: auxContext },
        timeout: this.config.timeout || 0,
        responseType: 'json',
        responseEncoding: 'utf8',
        maxRedirects: 5,
        proxy: this.config.proxy || null,
      })

      const { data = {}, status } = response && response.data ? response.data : {}

      if (!this.sessionId && data.context ) {
        this.sessionId = data.context.sessionId
      }
      if (status !== 'success') {
        throw new Error(`[Songclip][postAddEvent] ${JSON.stringify(data || {} )}`)
      }
      return response.data || false
    } catch (error) {
      throw new Error(`[Songclip][postAddEvent] ${error}`)
    }
  }

}

module.exports = Songclip