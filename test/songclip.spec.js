'use strict'

require('dotenv').config()

const expect = require('chai').expect
const Songclip = require('../index')

const songclip = new Songclip({
  apiKey: process.env.SNGCLP_API_KEY,
  authorization: `bearer ${process.env.SNGCLP_AUTHORIZATION}`,
})

describe('songclip search', function () {

  it('should return 10 clips for a "hey" open search', async () => {
    const clips = await songclip.search({
      q: 'hey',
      limit: 10,
      page: 1,
    })
    expect(clips).to.be.an('array').that.is.not.eql([])
    expect(clips.length).to.be.eql(10)
  })

})

describe('songclip collections', function () {
  
  it('should return available collections', async () => {
    const collections = await songclip.getCollections()
    expect(collections).to.be.an('array').that.is.not.eql([])
  })

})


describe('songclip available collection', function () {
  const limit = 5

  it(`should return ${limit} elements each`, async () => {
    const collections = await songclip.getCollections()
    expect(collections).to.be.an('array').that.is.not.eql([])

    for (const collection of collections) {
      const { term } = collection
      const clips = await songclip.getCollection({
        term,
        limit,
      })
      expect(clips).to.be.an('array').that.is.not.eql([])
      expect(clips.length).to.be.eql(limit)
    }
  })

})

describe('songclip related clips', function () {
  const limit = 5

  it(`should return ${limit} related clips each`, async () => {
    const clips = await songclip.getCollection({ limit: 1 }) // trending
    expect(clips).to.be.an('array').that.is.not.eql([])
    const clip = clips[0]

    const relatedClips = await songclip.getRelated({
      id: clip.id,
      limit,
    })
    expect(relatedClips).to.be.an('array').that.is.not.eql([])
    expect(relatedClips.length).to.be.eql(limit)
  })

})

describe('post a app open event', function () {

  it(`should return success`, async () => {
    const { status } = await songclip.postAppOpen()
    
    expect(status).to.be.eql('success')
  })

})

describe('post a play event', function () {

  it(`should return success for first clip in trending collection`, async () => {
    const clips = await songclip.getCollection({ limit: 1 }) // trending
    expect(clips).to.be.an('array').that.is.not.eql([])
    const clip = clips[0]

    const { status } = await songclip.postPlayEvent({ id: clip.id })
    
    expect(status).to.be.eql('success')
  })

})

describe('post a share event', function () {

  it(`should return success for first clip in trending collection`, async () => {
    const clips = await songclip.getCollection({ limit: 1 }) // trending
    expect(clips).to.be.an('array').that.is.not.eql([])
    const clip = clips[0]

    const { status } = await songclip.postShareEvent({ id: clip.id })
    
    expect(status).to.be.eql('success')
  })

})

describe('post a add event', function () {

  it(`should return success for first clip in trending collection`, async () => {
    const clips = await songclip.getCollection({ limit: 1 }) // trending
    expect(clips).to.be.an('array').that.is.not.eql([])
    const clip = clips[0]

    const { status } = await songclip.postAddEvent({ id: clip.id })
    
    expect(status).to.be.eql('success')
  })

})