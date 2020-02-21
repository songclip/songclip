'use strict'

const axios = require('axios')
const randomString = require('randomstring')

const SNGCLP_API_URL = process.env.SNGCLP_MODE === 'production' ? 'https://api.songclip.com' : 'https://sandbox-api.songclip.com'
const SNGCLP_DEFAULT_LIMIT = process.env.SNGCLP_DEFAULT_LIMIT || 20
const SNGCLP_DEFAULT_PAGE = 1

class Songclip {

  /**
   * param {*} 
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
   * 
   * @param {*} params 
   */
  getHeaders() {
    return {
      apikey: this.config.apiKey,
      authorization: this.config.authorization,
    }
  }

  /**
   * 
   * @param {*} params 
   */
  generateUniqueId() {
    this.uniqueId = randomString.generate()
    return this.uniqueId
  }

  /**
   * 
   * @param {*} context 
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
   * 
   */
  async search(params = {
    q: null,
    limit: SNGCLP_DEFAULT_LIMIT,
    page: SNGCLP_DEFAULT_PAGE,
    shuffle: false,
    context: {
      sourcePlatform: 'web',
      minLength: null,
      maxLength: null,
      uniqueId: '',
      sessionId: null,
      tags: [],
    },
  }) {
    const headers = this.getHeaders()
    const { q, context = {}, page = SNGCLP_DEFAULT_PAGE, limit = SNGCLP_DEFAULT_LIMIT, shuffle = false } = params
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
   * 
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
   * 
   */
  async getCollection(params = {}) {
    const headers = this.getHeaders()
    const { term = 'trending', context = {}, page = SNGCLP_DEFAULT_PAGE, limit = SNGCLP_DEFAULT_LIMIT, shuffle = false } = params
    const auxContext = this.populateContext(context)
    try {
      const auxTerm = term && typeof term === 'string' ? encodeURI(term) : 'trending'

      const response = await axios({
        url: `${SNGCLP_API_URL}/songclips/collections/${auxTerm}`,
        method: 'get',
        headers,
        params: { context: auxContext, page, limit, shuffle },
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
   * 
   * @param {*} params 
   */
  async getRelated( params = {}) {
    const headers = this.getHeaders()
    const { id, context = {}, page = SNGCLP_DEFAULT_PAGE, limit = SNGCLP_DEFAULT_LIMIT, shuffle = false, assetType = 'songclip' } = params
    const auxContext = this.populateContext(context)
    try {
      const response = await axios({
        url: assetType === 'songclip' ? `${SNGCLP_API_URL}/songclips/${id}/related` : `${SNGCLP_API_URL}/songclips/${id}/related/gifnotes`,
        method: 'get',
        headers,
        params: { context: auxContext, page, limit, shuffle },
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
   * 
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
   * Reporting a songclip/gifnote play event
   * @param { id, sourcePlatform, uniqueId, sessionId } params
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
   * Reporting a songclip/gifnote share event
   * @param { id, sourcePlatform, uniqueId, sessionId } params
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
   * Reporting a songclip/gifnote add event
   * @param { id, sourcePlatform, uniqueId, sessionId } params
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