FORMAT: 1A
HOST: http://api.songclip.com/


# Songclip API v2.4.4
[![Audiobyte](https://s3.amazonaws.com/audiobyte-assets/songclip_header_logo.png)](http://gallery.songclip.com)
The Songclip Music API is a [RESTful](https://en.wikipedia.org/wiki/Representational_state_transfer) API 
using [JSEND](https://github.com/omniti-labs/jsend) response format for social and digital companies 
to offer fully-licensed popular music as a feature. 

Songclip API v2.4.x is compatible with Audiobyte API v2.3 calls.

[Songclip.com](https://www.songclip.com), is powered by the Songclip API as a showcase of available capabilities for Songclip API partners. 

## Overview

Songclip shares with its partners this NodeJS module to facilitate its integration. It's an API wrap with the following methods:

1. search
2. getCollections
3. getCollection
4. getRelated
5. postAppOpenEvent
6. postPlayEvent
7. postShareEvent
8. postAddEvent

`
$ npm install 'songclip' --save
`

Sample code:

`
const Songclip = require('songclip')
const songclip = new Songclip({
  apiKey: 'APS...',
  authorization: 'bearer ...',
})

async test() {
  try {
    const clips = await songclip.search({
      q: 'Ed Sheeran',
      context: {
        minLength: 10, // seconds
        uniqueId: 'anoymizedUniqueUserID', //
      },
    })
    const first = clips[0]
  } catch (error) {
    console.error(error)
  }
}
`


## Introduction to full API

A **Songclip** is a 5-30 second fully-licensed popular song clip audio file.

A **Songclip GIF** (previously known as a **Gifnote**) is the audio-visual result of merging an audio song clip ("Songclip") and a visual asset such as a GIF, photo, or video into a music video asset.

The Songclip Music API delivers services for both Songclip audio files and Songclip GIF videos.

In order to request access to the Songclip Music API, please email [api@songclip.com](mailto:api@songclip.com) with the following information
1. **Business Name.**
2. **Use-case(s).** Describe the use-case(s) for your app(s) and how you will use the Songclip Partner Platform.
3. **Metrics.** Please provide the number of daily and monthly users you expect at the end of your first three months after launching your app with the Songclip API. This information will help the Songclip team prepare for your launch, delivering the best performance for your end-users.
4. **Contact.** Provide your main contact details for future communication.

## Overview

The Songclip Music API includes the following entities:

* [Songclip audio files](#reference/0/songclips)
* [Songclip GIF videos](#reference/0/gifnotes)
* [Events](#reference/0/events)
* [Users](#reference/0/users)

### Authorization
Please include the following headers in your request: 

* *Authorization*: Bearer **ACCESS_TOKEN**
* *apikey*: **API_KEY**

### Events
[Songclip Music API Terms](https://www.songclip.com/terms-of-service) include sending the following events to the Songclip API:
1. When a user accesses Songclip for the first time in the session, [POST /events/open](#reference/0/events/send-app-open-event)
2. When you create a new user, [POST /users](#reference/0/users/create-user)
3. When a Songclip GIF video is played, [POST /gifnotes/:id/events/play](#reference/0/gifnotes/send-a-gifnote-play-event)
4. When a Songclip audio file is played, [POST /songclips/:id/events/play](#reference/0/songclips/send-a-songclip-play-event)
5. When a Songclip GIF video is shared, [POST /gifnotes/:id/events/share](#reference/0/gifnotes/send-a-gifnote-share-event)
6. When a Songclip audio file is shared, [POST /songclips/:id/events/share](#reference/0/songclips/send-a-songclip-share-event)
7. When a Songclip audio file is created, [POST /songclips](#reference/0/songclip-audio-files/send-a-songclip-audio-file-create-event)

To review how events reporting must be implemented [see here](https://songclip-partner-docs.s3.amazonaws.com/Songclip%2BPartner+%3D+Event+Flow.pdf).

### Description API Responses:
- 200 `OK` - the request was successful (some API calls may return 201 instead).
- 201 `Created` - the request was successful and a resource was created.
- 400 `Bad Request` - the request could not be understood or was missing required parameters.
- 401 `Unauthorized` - authentication failed or user doesn't have permissions for requested operation.
- 403 `Forbidden` - access denied.
- 404 `Not Found` - resource was not found.
- 405 `Method Not Allowed` - requested method is not supported for resource.

### Context object
The *context* object used in API calls gives additional information required for proper reporting to the music industry. The "context" is a JSON object comprising the following
-fields-:
<table>
    <tr>
        <td> Field </td>
        <td> Description </td>    
    </tr>
    <tr>
        <td> <i><b>sessionId</b></i> (String) </td>
        <td><b>Required</b>. ID providing an anonymized unique identifier to all actions and events registered after the 
        AppOpen event. Every call is returning the <i><b>sessionId</b></i> used. If none is provided,
        a new one is generated and delivered in response for you to use in next calls. If no session
        identifier is available in your app, consider using in all subsequent calls the one provided
        in the <a href="reference/0/events/send-app-open-event">AppOpen</a> event response</td> 
    </tr>
    <tr>
        <td> <i><b>uniqueId</b></i> (String) </td>
        <td><b>Required</b>. Unique identifier for each user - can be anonymized.  
        It is required to deliver unique user reporting to Label partners and used to adapt 
        recommendations based on user’s preferences.</td> 
    </tr>
    <tr>
        <td> <i><b>clientIP</b></i> (String) </td>
        <td><b>Optional</b>. To provide location based recommendations.</td> 
    </tr>
    <tr>
        <td> <i><b>searchType</b></i> (String) </td>
        <td><b>Optional</b>. Parameter used in "search" related calls (
        <a href="#reference/0/gifnote-music-videos/search-gifnote-music-videos">GET /gifnotes</a>, 
        <a href="#reference/0/songclip-audio-files/search-songclip-audio-files">GET /songclips</a>) to 
        specify a domain of search. Its value is 
        by the /autocomplete call. Valid values are:
        <i>artist</i>, <i>title</i>, <i>lyrics</i> or <i>gif</i></td> 
    </tr>
    <tr>
        <td> <i><b>searchText</b></i> (String) </td>
        <td><b>Optional</b>. Parameter used in "related" calls (
        <a href="#reference/0/gifnote-music-videos/related-gifnote-music-videos-for-a-gifnote-music-video">GET /gifnotes/:id/related</a>,
        <a href="#reference/0/gifnote-music-videos/related-songclip-audio-files-for-gifnote-music-videos">GET /gifnotes/:id/related/songclips</a>,
        <a href="#reference/0/songclip-audio-files/related-songclip-audio-files-for-songclip-audio-file">
        GET /songclips/:id/related</a>) to 
        specify the last search query. Its value is relevant to find relevant related matches.
        </td> 
    </tr>
    <tr>
        <td> <i><b>tags</b></i> (String) </td>
        <td><b>Optional</b>. Parameter used in "related" and "search" calls (
        <a href="#reference/0/songclip-audio-files/search-songclip-audio-files">GET /songclips</a>,
        <a href="#reference/0/songclip-gif-videos/search-songclip-gif-videos">GET /gifnotes</a>,
        <a href="#reference/0/gifnote-music-videos/related-gifnote-music-videos-for-a-gifnote-music-video">GET /gifnotes/:id/related</a>,
        <a href="#reference/0/gifnote-music-videos/related-songclip-audio-files-for-gifnote-music-videos">GET /gifnotes/:id/related/songclips</a>,
        <a href="#reference/0/songclip-audio-files/related-songclip-audio-files-for-songclip-audio-file">
        GET /songclips/:id/related</a>) to 
        specify additional tags for matching. Its value is relevant to find relevant related matches.
        </td> 
    </tr>
</table>

## Songclip Audio Files [/songclips]

### Search Songclip audio files [GET /songclips{?q,context,minLength,maxLength,page,limit,shuffle}]

Search for Songclip audio files.
Context is a JSON object that must include an anonymized "uniqueId" field identifying the user to allow 
proper activity reporting to the music industry.

+ Parameters
    + q (required, String) ... query string to search Songclips.
    + context (required, JSON) ... { "uniqueId":"111-asf_123", "sourcePlatform": "example_app_platform", "tags":["happy","funny"] } 
    + minLength (optional, Number) ... minimum length in seconds
    + maxLength (optional, Number) ... max length in seconds
    + page (optional, Number) ... page requested, default is 1
    + limit (optional, Number) ... limit per page, default is 20
    + shuffle (optional, Boolean) ... shuffle results of corresponding page, default is false
    
+ Request

    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*
            
+ Response 200 (application/json)

        {  
           "status":"success",
           "data":{  
              "songclips":[  
                 {  
                    "id":"64423325966796605",
                    "artist":"Elton John",
                    "title":"Rocket Man",
                    "lyrics":"Burnin' out his fuse\nUp here alone",
                    "coverUrl":"https://dev-c.rdnt.us/5890b1b1405c7b34340848b9.jpg",
                    "audioUrl":"https://dev-c.rdnt.us/5890b1a38b03f233ff5bcef3.mp3",
                    "duration": 12.3
                 }
              ]
           }
        }

+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }

### Get Songclip autocomplete suggestions [GET /songclips/autocomplete{?q,context}]

Up to 10 recommendations for searched terms on Songclips. Context is a JSON object that must include an anonymized "uniqueId" field identifying the user to allow 
proper activity reporting to the music industry.

+ Parameters
    + q (required, String) ... query string to search autocomplete suggestions for Songclips
    + context (required, JSON) ... { "uniqueId": "111-asf_123", "sourcePlatform": "example_app_platform" } 

+ Request
    
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)

        {
          "status": "success",
          "data": {
            "suggestions": [
              {
                "text": "hey baby (drop it to the floor)",
                "searchType": "title"
              },
              {
                "text": "hey joe",
                "searchType": "title"
              },
              {
                "text": "hey violet",
                "searchType": "artist"
              }
            ]
          }
        }

+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }

### Related Songclip audio files for Songclip audio file [GET /songclips/{id}/related{?context,page,limit,shuffle}]

Get related Songclip audio files for a given Songclip audio file.

+ Parameters
    + context (required, JSON) ... { "uniqueId": "111-asf_123", "sourcePlatform": "example_app_platform", "tags": ["hello", "funny"] } 
    + page (optional, Number) ... page requested, default is 1
    + limit (optional, Number) ... limit per page, default is 20
    + shuffle (optional, Boolean) ... shuffle results of corresponding page, default is false

+ Request
    + Attributes
        - id: "63802520203429395" (string, required)

    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*
        
+ Response 200 (application/json)

        {  
           "status":"success",
           "data":{  
              "songclips":[  
                 {  
                    "id":"63842667183736466",
                    "artist":"Fifth Harmony feat. Ty Dolla Sign",
                    "title":"Work From Home",
                    "lyrics":"You don't gotta go to work, work, work, work, work, work, work",
                    "coverUrl":"https://dev-c.rdnt.us/57ed02a8579b4c0003fed9d3.jpg",
                    "audioUrl":"https://dev-c.rdnt.us/572512b094fabf0f00100fbb.mp3",
                    "duration": 12.3
                 }
              ]
           }
        }

+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }

### Related Songclip GIF videos for a Songclip audio file [GET /songclips/{id}/related/gifnotes{?context,page,limit,shuffle}]

Get related Songclip GIF videos for a given Songclip audio file.

+ Parameters
    + context (required, JSON) ... { "uniqueId": "111-asf_123", "sourcePlatform": "example_app_platform", "tags": ["hello", "funny"] } 
    + page (optional, Number) ... page requested, default is 1
    + limit (optional, Number) ... limit per page, default is 20
    + shuffle (optional, Boolean) ... shuffle results of corresponding page, default is false

+ Request

    + Attributes
        - id: "63802520203429395" (string, required)

    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*
            
+ Response 200 (application/json)

        {  
           "status":"success",
           "data":{  
              "gifnotes":[  
                 {  
                    "id":"229097616418276943",
                    "songclip":{  
                       "id":"63843291765933741",
                       "artist":"Prince",
                       "title":"Little Red Corvette ",
                       "lyrics":"Little red corvette, baby you're much too fast",
                       "coverUrl":"https://dev-c.rdnt.us/57ed0052579b4c0003fec700.jpg",
                       "audioUrl":"https://dev-c.rdnt.us/572e0bac4eb5650f00328683.mp3",
                       "duration": 15.3
                    },
                    "gifUrl":"https://dev-i.gifnote.co/3TqIFQpomY761kXlCsJnYpVYUQWudFOa.gif",
                    "gifnoteUrl": "https://i.gifnote.co/UdfaPOprtaRRD3454.mp4",
                    "gifnoteThumbnailUrl": "https://i.gifnote.co/UdfadsfsdfdsfsdPOprtaRRD3454.jpg",
                    "gifMp4Url": "https://i.gifnote.co/hfdks36842yhkjhds89.mp4",
                    "dims":[  
                       150,
                       150
                    ],
                    "gifId":"229097586261231182"
                 }
              ]
           }
        }

+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }

### Get Songclip audio file information [GET /songclips/{id}]

Get Songclip audio file information.

+ Request
    + Attributes
        - id: "63802520203429395" (string, required)
        
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*
            
+ Response 200 (application/json)

        {  
           "status":"success",
           "data":{  
              "songclip":{  
                 "id":"63802520203429395",
                 "artist":"BORns",
                 "title":"Electric Love",
                 "lyrics":"And every night my mind is running around her",
                 "coverUrl":"https://s3.amazonaws.com/.../57ecffa1579b4c0003fec138.jpg",
                 "audioUrl":"https://s3.amazonaws.com/.../56f3fa6968fd6c0f0014cc48.mp3",
                 "duration": 18.5
              }
           }
        }
        
+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }


### List Songclips collections [GET /songclips/collections]

List available Songclip featured collections. 

+ Request
    
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)

        {
          "status": "success",
          "data": {
            "collections": [
              {
                "term": "TRENDING",
                "color": "#33D4FF",
                "backgroundGifUrl": "https://i.gifnote.co/fVFHQsg6d7hAcF7jRbsi47vddEyatH2x.gif",
                "backgroundWebpUrl": "https://i.gifnote.co/lRUaXAiaqbA2zsiERvTAjMkYjUg0xCRf.webp"
              },
              {
                "term": "LOVE",
                "color": "#00B359",
                "backgroundGifUrl": "https://i.gifnote.co/ABuwS6kCdwJifn5vId7nQqcOkEplSK8c.gif",
                "backgroundWebpUrl": "https://i.gifnote.co/TuS8DpaPDZubpX9sSRU1zgK3oi2BxQzJ.webp"
              }
            ]
          }
        }

+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }


### Get Songclips trending collection [GET /songclips/collections/trending{?page,limit,context,minLength,maxLength,shuffle}]

List Songclips in the *trending* collection. 
Context is a JSON object that must include an anonymized "uniqueId" field identifying the user to allow 
proper activity reporting to the music industry.

+ Parameters
    + page (optional, Number) ... page from 1 to 999
    + limit (optional, Number) ... maximum number of Songclip records expected by client.
    + context (required, JSON) ... { "uniqueId": "111-asf_123", "sourcePlatform": "example_app_platform" }
    + minLength (optional, Number) ... minimum length in seconds
    + maxLength (optional, Number) ... max length in seconds
    + shuffle (optional, Boolean) ... shuffle results of corresponding page, default is false

+ Request
    
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)

        {
          "status": "success",
          "data": {
            "gifnotes": [
              {
                "id": "241457717300954205",
                "artist": "The Offspring",
                "title": "Pretty Fly (For A White Guy)",
                "lyrics": "Give it to me baby\nGive it to me baby",
                "coverUrl": "https://c.rdnt.us/nvieQaIDJeAkblk7KIpNwVnQd5EsdOYJ.jpg",
                "audioUrl": "https://c.rdnt.us/xZmz7Ho9Hf6VxygwnlhwIvkIYJz4XV52.mp3",
                "duration": 18.5
              },
              {
                "id": "236316737899857272",
                "artist": "Fergie",
                "title": "Fergalicious",
                "lyrics": "So delicious aye aye aye(It's hot, hot)\nIt's so delicious aye aye aye(I put them boys on rock, rock)\nIt's so delicious",
                "coverUrl": "https://c.rdnt.us/odYkoANRqShwh688Han0owUZfJFmg71C.jpg",
                "audioUrl": "https://c.rdnt.us/ZQn5JUeyIq2725RnUXAJi0iYGMDItUvb.mp3",
                "duration": 20.1
              }
            ]
          }
        }

+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }

### Get a single Songclip collection [GET /songclips/collections/{term}{?q,page,limit,context,shuffle}]

List Songclips for {term} collection. 
Context is a JSON object that must include an anonymized "uniqueId" field identifying the user to allow 
proper activity reporting to the music industry.

+ Parameters
    + page (optional, Number) ... page from 1 to 999
    + limit (optional, Number) ... maximum number of Songclip records expected by client.
    + context (required, JSON) ... { "uniqueId": "111-asf_123", "sourcePlatform": "example_app_platform" } 
    + shuffle (optional, Boolean) ... shuffle results of corresponding page, default is false

+ Request
    + Attributes
        - term: "LOVE" (string, required)
    
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)

        {
          "status": "success",
          "data": {
            "songclips": [
              {
                "id": "482098784763905236",
                "artist": "The Supremes",
                "title": "Baby Love",
                "lyrics": "Baby love, my baby love, I need you oh how I need you",
                "coverUrl": "https://c.rdnt.us/yPXaqI3oSn08I1S7XfOFn3xbfyKl0dif.jpg",
                "audioUrl": "https://c.rdnt.us/I3S0fUD5WfKmntAJ8Zs8tZao2VnT8uS3.mp3",
                "duration": 18.5
              },
              {
                "id": "482117252368303361",
                "artist": "Celine Dion",
                "title": "The Power of Love",
                "lyrics": "'Cause I am your lady\nAnd you are my man",
                "coverUrl": "https://c.rdnt.us/iTe1WHVndGJs1KgaZPoqOMI0ZroTXXKf.jpg",
                "audioUrl": "https://c.rdnt.us/IcQTRmMTqVd58a1WDdI94Ru0B0XKMY4D.mp3",
                "duration": 21.5
              }
            ]
          }
        }

+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }


### Send a Songclip audio file play event [POST /songclips/:id/events/play]

Send a play event for a given Songclip audio file.
Context is a JSON object that must include an anonymized "uniqueId" field identifying the user to allow 
proper activity reporting to the music industry.

+ Request (application/json)
    
    + Body    
    
            {
                "context": {"uniqueId":"111-asf_123", "sourcePlatform": "example_app_platform"}
            }

                    
    + Attributes
        - id: "476350871664330462" (string, required)
        
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)
        
        {
          "status":"success"
        }
        
+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }


### Send a Songclip audio file share event [POST /songclips/:id/events/share]

Send a share event for a given Songclip audio file.
Context is a JSON object including a "uniqueId" field identifying the user to allow 
customized responses based on user's behavior.

+ Request (application/json)
    
    + Body    
    
            {
                "context": {"uniqueId":"111-asf_123"}
            }

                    
    + Attributes
        - id: "476350871664330462" (string, required)
        
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)
        
        {
          "status":"success"
        }

### Send a Songclip audio file favoriting event [POST /songclips/:id/events/favoriting]

Send a -favoriting- (when a user likes or adds to a personal collection) event for a given Songclip audio file.
Context is a JSON object that must include an anonymized "uniqueId" field identifying the user to allow 
proper activity reporting to the music industry.

+ Request (application/json)
    
    + Body    
    
            {
                "context": {"uniqueId":"111-asf_123"}
            }

                    
    + Attributes
        - id: "476350871664330462" (string, required)
        
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)
        
        {
          "status":"success"
        }
        
### Send a Songclip audio file create event [POST /songclips]

Send a -create- event for a given Songclip audio file.
Context is a JSON object that must include an anonymized "uniqueId" field identifying the user to allow 
proper activity reporting to the music industry.  For parameters start, end, fadeIn, fadeOut, pass milliseconds as format.

+ Request (application/json)
    
    + Body    
    
            {
                "context": {"uniqueId":"111-asf_123"},
                "start": 1000,
                "end": 3000,
                "fadeIn": 500,
                "fadeOut": 300,
                "tags": ["happy"],
                "songId": "5958929698"
            }

    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)
        
        {
          "status":"success"
        }
        
### Send a Songclip audio file unfavoriting event [POST /songclips/:id/events/unfavoriting]

Send an -unfavoriting- (when a user unlikes or removes the given songclip ID from a 
personal collection) event for a given Songclip audio file.
Context is a JSON object that must include an anonymized "uniqueId" field identifying the user to allow 
proper activity reporting to the music industry.

+ Request (application/json)
    
    + Body    
    
            {
                "context": {"uniqueId":"111-asf_123"}
            }

                    
    + Attributes
        - id: "476350871664330462" (string, required)
        
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)
        
        {
          "status":"success"
        }

### Send a Songclip audio file add event [POST /songclips/:id/events/add]

Send an -add- event for a given Songclip audio file. This event must be posted when a new asset is created using a songclip.
Context is a JSON object that must include an anonymized "uniqueId" field identifying the user to allow 
proper activity reporting to the music industry.

+ Request (application/json)
    
    + Body    
    
            {
                "context": {"uniqueId":"111-asf_123", "sourcePlatform": "example_app_platform"}
            }

                    
    + Attributes
        - id: "476350871664330462" (string, required)
        
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)
        
        {
          "status":"success"
        }
        
+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }

# Songclip GIF Videos [/gifnotes]

### Search Songclip GIF videos [GET /gifnotes{?q,page,limit,context}]
Retrieve Songclip GIF videos matching a query string "q" with a required "context". 
Context is a JSON object that must include an anonymized "uniqueId" field identifying the user to allow 
proper activity reporting to the music industry.

+ Parameters
    + q (required, String) ... query string to search Songclip GIF videos
    + page (optional, Number) ... page from 1 to 999
    + limit (optional, Number) ... maximum number of Songclip GIF video records expected by client.
    + context (required, JSON) ... { "uniqueId": "111-asf_123", "sessionId": "112312132123", "sourcePlatform": "example_app_platform", "tags": ["hello","funny"] } 

+ Request

    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)

        {
          "status": "success",
          "data": {
            "gifnotes": [
              {
                "id": "263997365411644435",
                "songclip": {
                  "id": "132769474188150024",
                  "artist": "Off Bloom",
                  "title": "Hey Bae",
                  "lyrics": "Hey bae, let's do it your way\nHey bae, let's do it your way, way",
                  "coverUrl": "https://c.rdnt.us/https://c.rdnt.us/Zva9Ls2EvrJiaZDP5gs4PFApE0rpZ7Xj.jpg",
                  "audioUrl": "https://c.rdnt.us/U9lXZcitaPkXywcYHP2vnocdGWZxKuEN.mp3",
                  "duration": 18.5
                },
                "gifUrl": "https://i.gifnote.co/U4IYAXeqk7JJW8GjXegOqM0um5emAkgw.gif",
                "gifnoteUrl": "https://i.gifnote.co/UdfaPOprtaRRD3454.mp4",
                "gifnoteThumbnailUrl": "https://i.gifnote.co/UdfadsfsdfdsfsdPOprtaRRD3454.jpg",
                "gifMp4Url": "https://i.gifnote.co/hfdks36842yhkjhds89.mp4",
                "dims": [
                  250,
                  189
                ],
                "gifId": "263997365059322898"
              }
            ]
          }
        }
        
+ Response 400 (application/json)

        {  
           "status":"failed",
           "data":{  
              "message":"Validation Failed",
              "code":"INVALID_PARAM",
              "errors":[  
                 {  
                    "message":"\"q\" parameter is missing",
                    "code":"invalid",
                    "field":"q"
                 }
              ]
           }
        }

### Get Songclip GIF video autocomplete suggestions [GET /gifnotes/autocomplete{?q,context}]

Up to 10 recommendations for searched terms on Songclip GIF Videos. Context is a JSON object that must include an anonymized "uniqueId" field identifying the user to allow 
proper activity reporting to the music industry.

+ Parameters
    + q (required, String) ... query string to search autocomplete suggestions for Songclip GIF videos
    + context (required, JSON) ... { "uniqueId": "111-asf_123", "sourcePlatform": "example_app_platform" } 

+ Request
    
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)

        {
          "status": "success",
          "data": {
            "suggestions": [
              {
                "text": "hey",
                "searchType": "gif"
              },
              {
                "text": "hey arnold",
                "searchType": "gif"
              },
              {
                "text": "hey baby",
                "searchType": "gif"
              },
              {
                "text": "hey baby",
                "searchType": "title"
              },
              {
                "text": "hey baby ",
                "searchType": "title"
              },
              {
                "text": "hey baby (uhh ahh) [radio mix]",
                "searchType": "title"
              },
              {
                "text": "hey bae",
                "searchType": "title"
              },
              {
                "text": "hey boy",
                "searchType": "gif"
              },
              {
                "text": "hey bulldog",
                "searchType": "title"
              },
              {
                "text": "hey violet",
                "searchType": "artist"
              }
            ]
          }
        }

+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }

### Related Songclip audio files for Songclip GIF video [GET /gifnotes/{id}/related/songclips{?context}]

Get related Songclip audio files for a given Songclip GIF video.

+ Parameters
    + context (required, JSON) ... { "uniqueId": "111-asf_123", "sourcePlatform": "example_app_platform", "tags":["hello","funny"] } 

+ Request
    + Attributes
        - id: "287781293196837947" (string, required)

    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)

        {  
           "status":"success",
           "data":{  
              "songclips":[  
                 {  
                    "id":"63802520203429395",
                    "artist":"BORns",
                    "title":"Electric Love",
                    "lyrics":"And every night my mind is running around her",
                    "coverUrl":"https://dev-c.rdnt.us/57ecffa1579b4c0003fec137.jpg",
                    "audioUrl":"https://dev-c.rdnt.us/56f3fa6968fd6c0f0014cc48.mp3",
                    "duration": 18.5
                 }
              ]
           }
        }

   
+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }

    
### Related Songclip GIF videos for a Songclip GIF video [GET /gifnotes/{id}/related{?context}]

Get related Songclip GIF videos for a given Songclip GIF video.

+ Parameters
    + context (required, JSON) ... { "uniqueId": "111-asf_123", "sourcePlatform": "example_app_platform", "tags":["hello","funny"] } 

+ Request

    + Attributes
        - id: "287781293196837947" (string, required)

    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)

        {  
           "status":"success",
           "data":{
               "gifnotes": [  
                   {  
                     "id":"258664555951949276",
                     "songclip":{  
                        "id":"63812403208390588",
                        "artist":"Luke Bryan",
                        "title":"Kick The Dust Up",
                        "lyrics":"We go way out where there aint nobody\nWe turn this cornfield into a party",
                        "coverUrl":"https://dev-c.rdnt.us/57ed0442579b4c0003fee4a0.jpg",
                        "audioUrl":"https://dev-c.rdnt.us/5707c520bda4090f0042da6e.mp3",
                        "duration": 18.5
                     },
                     "gifUrl":"https://dev-i.gifnote.co/1Q3dnFP7j66vxKfpy8tvpv4YFQaOiWIt.gif",
                     "gifnoteUrl": "https://i.gifnote.co/UdfaPOprtaRRD3454.mp4",
                     "gifnoteThumbnailUrl": "https://i.gifnote.co/UdfadsfsdfdsfsdPOprtaRRD3454.jpg",
                     "gifMp4Url": "https://i.gifnote.co/hfdks36842yhkjhds89.mp4",
                     "dims":[  
                        250,
                        187
                     ],
                     "gifId":"258604378426967514"
                   }
               ]
            }
        }

+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }

### Get Songclip GIF video information [GET /gifnotes/{id}]

Retrieve information from a Songclip GIF video with ID.

+ Request
    + Attributes
        - id: "287781293196837947" (string, required)

    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)

        {  
           "status":"success",
           "data":[  
              {  
                 "id":"258664555951949276",
                 "songclip":{  
                    "id":"63812403208390588",
                    "artist":"Luke Bryan",
                    "title":"Kick The Dust Up",
                    "lyrics":"We go way out where there aint nobody\nWe turn this cornfield into a party",
                    "coverUrl":"https://dev-c.rdnt.us/57ed0442579b4c0003fee4a0.jpg",
                    "audioUrl":"https://dev-c.rdnt.us/5707c520bda4090f0042da6e.mp3",
                    "duration": 18.5
                 },
                 "gifUrl":"https://dev-i.gifnote.co/1Q3dnFP7j66vxKfpy8tvpv4YFQaOiWIt.gif",
                 "gifnoteUrl": "https://i.gifnote.co/UdfaPOprtaRRD3454.mp4",
                 "gifnoteThumbnailUrl": "https://i.gifnote.co/UdfadsfsdfdsfsdPOprtaRRD3454.jpg",
                 "gifMp4Url": "https://i.gifnote.co/hfdks36842yhkjhds89.mp4",
                 "dims":[  
                    250,
                    187
                 ],
                 "gifId":"258604378426967514"
              }
           ]
        
        
+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }


### List Songclip GIF video collections [GET /gifnotes/collections]

List available Songclip GIF video collections. 

+ Request
    
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)

        {
          "status": "success",
          "data": {
            "collections": [
              {
                "term": "TRENDING",
                "color": "#33D4FF",
                "backgroundGifUrl": "https://i.gifnote.co/fVFHQsg6d7hAcF7jRbsi47vddEyatH2x.gif",
                "backgroundWebpUrl": "https://i.gifnote.co/lRUaXAiaqbA2zsiERvTAjMkYjUg0xCRf.webp"
              },
              {
                "term": "LOVE",
                "color": "#00B359",
                "backgroundGifUrl": "https://i.gifnote.co/ABuwS6kCdwJifn5vId7nQqcOkEplSK8c.gif",
                "backgroundWebpUrl": "https://i.gifnote.co/TuS8DpaPDZubpX9sSRU1zgK3oi2BxQzJ.webp"
              }
            ]
          }
        }

+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }


### Get Songclip GIF video trending collection [GET /gifnotes/collections/trending{?page,limit,context}]

List Songclip GIF videos in the *trending* collection. 
Context is a JSON object that must include an anonymized "uniqueId" field identifying the user to allow 
proper activity reporting to the music industry.

+ Parameters
    + page (optional, Number) ... page from 1 to 999
    + limit (optional, Number) ... maximum number of Songclip GIF video records expected by client.
    + context (required, JSON) ... { "uniqueId": "111-asf_123", "sourcePlatform": "example_app_platform" } 

+ Request
    
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)

        {
          "status": "success",
          "data": {
            "gifnotes": [
              {
                "id": "476350871664330462",
                "songclip": {
                  "id": "264542780892644813",
                  "artist": "Europe",
                  "title": "The Final Countdown",
                  "lyrics": "It's the final countdown",
                  "coverUrl": "https://c.rdnt.us/tJa0hXLvhKqAwhi9PSDsWW4882jp5XUe.jpg",
                  "audioUrl": "https://c.rdnt.us/oLslZDqvVoPAbVh2RhXEjSyIml6AiUxp.mp3",
                  "duration": 18.5
                },
                "gifUrl": "https://i.gifnote.co/fVFHQsg6d7hAcF7jRbsi47vddEyatH2x.gif",
                "gifnoteUrl": "https://i.gifnote.co/UdfaPOprtaRRD3454.mp4",
                "gifnoteThumbnailUrl": "https://i.gifnote.co/UdfadsfsdfdsfsdPOprtaRRD3454.jpg",
                "gifMp4Url": "https://i.gifnote.co/hfdks36842yhkjhds89.mp4",
                "dims": [
                  220,
                  220
                ],
                "gifId": "476350871664330462",
                "type": "curated-1445"
              }
            ]
          }
        }

+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }

### Get a single Songclip GIF video collection [GET /gifnotes/collections/{term}{?q,page,limit,context}]

List Songclip GIF videos for {term} collection. 
Context is a JSON object that must include an anonymized "uniqueId" field identifying the user to allow 
proper activity reporting to the music industry.

+ Parameters
    + page (optional, Number) ... page from 1 to 999
    + limit (optional, Number) ... maximum number of Songclip GIF video records expected by client.
    + context (required, JSON) ... { "uniqueId": "111-asf_123", "sourcePlatform": "example_app_platform" } 

+ Request
    + Attributes
        - term: "LOVE" (string, required)
    
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)

        {
          "status": "success",
          "data": {
            "gifnotes": [
              {
                "id": "476350871664330462",
                "songclip": {
                  "id": "264542780892644813",
                  "artist": "Europe",
                  "title": "The Final Countdown",
                  "lyrics": "It's the final countdown",
                  "coverUrl": "https://c.rdnt.us/tJa0hXLvhKqAwhi9PSDsWW4882jp5XUe.jpg",
                  "audioUrl": "https://c.rdnt.us/oLslZDqvVoPAbVh2RhXEjSyIml6AiUxp.mp3",
                  "duration": 18.5
                },
                "gifUrl": "https://i.gifnote.co/fVFHQsg6d7hAcF7jRbsi47vddEyatH2x.gif",
                "gifnoteUrl": "https://i.gifnote.co/UdfaPOprtaRRD3454.mp4",
                "gifnoteThumbnailUrl": "https://i.gifnote.co/UdfadsfsdfdsfsdPOprtaRRD3454.jpg",
                "gifMp4Url": "https://i.gifnote.co/hfdks36842yhkjhds89.mp4",
                "dims": [
                  220,
                  220
                ],
                "gifId": "476350871664330462",
                "type": "curated-1445"
              }
            ]
          }
        }

+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }


### Send a Songclip GIF video play event [POST /gifnotes/{id}/events/play]

Post a "play" event for given {id} Songclip GIF video.
Context is a JSON object that must include an anonymized "uniqueId" field identifying the user to allow 
proper activity reporting to the music industry.

+ Request (application/json)
    
    +  Body 
    
            {
                "context": {"uniqueId":"111-asf_123", "sourcePlatform": "example_app_platform"}
            }

                    
    + Attributes
        - id: "476350871664330462" (string, required)
    
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)

        {
          "status": "success",
        }

### Send a Songclip GIF video share event [POST /gifnotes/{id}/events/share]

Post a "share" event for a given {id} Songclip GIF video.
Context is a JSON object that must include an anonymized "uniqueId" field identifying the user to allow 
proper activity reporting to the music industry.


+ Request (application/json)
    
    + Body
    
            {
                "context": {"uniqueId":"111-asf_123", "sourcePlatform": "example_app_platform"}
            }

                    
    + Attributes
        - id: "476350871664330462" (string, required)
                   
    
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)

        {
          "status": "success",
        }

+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }

### Send a Songclip GIF video favoriting event [POST /gifnotes/{id}/events/favoriting]

Post a "favoriting" event for a given {id} Songclip GIF video.
Context is a JSON object that must include an anonymized "uniqueId" field identifying the user to allow 
proper activity reporting to the music industry.


+ Request (application/json)
    
    + Body
    
            {
                "context": {"uniqueId":"111-asf_123", "sourcePlatform": "example_app_platform"}
            }

                    
    + Attributes
        - id: "476350871664330462" (string, required)
                   
    
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)

        {
          "status": "success",
        }

+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }

### Send a Songclip GIF video unfavoriting event [POST /gifnotes/{id}/events/unfavoriting]

Post an "unfavoriting" event for a given {id} Songclip GIF video.
Context is a JSON object that must include an anonymized "uniqueId" field identifying the user to allow 
proper activity reporting to the music industry.


+ Request (application/json)
    
    + Body
    
            {
                "context": {"uniqueId":"111-asf_123", "sourcePlatform": "example_app_platform"}
            }

                    
    + Attributes
        - id: "476350871664330462" (string, required)
                   
    
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)

        {
          "status": "success",
        }

+ Response 400 (application/json)

        {
            "status": "error",
            "message": "apikey parameter is missing"
        }

## Events  [/events]

### Send app open event [POST /events/open]

Send an app-open event whenever the partner's application first initiates any Songclip API call for the user.
Context is a JSON object that must include an anonymized "uniqueId" field identifying the user to allow 
proper activity reporting to the music industry.

+ Request (application/json)
    
    + Body    
    
            {
                "context": {"uniqueId":"111-asf_123", "sourcePlatform": "example_app_platform"}
            }
        
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*

+ Response 200 (application/json)
        
        {
          "status":"success"
        }

## Users [/users]

### List Users [GET /users{?q}]

List Users created by Partner

+ Parameters
    + q (required, String) ... query string to search between username, email, uniqueId
    
+ Request

    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*
    
+ Response 200 (application/json)

        [{
            "status":"success",
            "data": {
                users: {
                    "uniqueId": "1234",
                    "username": "jordan23",
                    "email":"jordan@gmail.com"
                }
            }
        }]

### Get a User [GET /users/{uniqueId}]

Get User's profile.

+ Request
    + Attributes
        - uniqueId: "A01AF899-227A-4E01-9729-9B4EA3DC7DA5" (string, required)
        
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*
    
+ Response 200 (application/json)

        {
            "status":"success",
            "data": {
                users: {
                    "uniqueId": "1234",
                    "username": "jordan23",
                    "email":"jordan@gmail.com"
                }
            }
        }

### Delete User [DELETE /users/{uniqueId}]

Remove a User's profile.

+ Request
    + Attributes
        - uniqueId: "A01AF899-227A-4E01-9729-9B4EA3DC7DA5" (string, required)
        
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*
    
+ Response 200 (application/json)

        {
            "status":"success"
        }

### Update User [PUT /users/{uniqueId}]

Update a User's profile.

+ Request
    + Attributes
        - uniqueId: "A01AF899-227A-4E01-9729-9B4EA3DC7DA5" (string, required)
        - username: "jordan23" (string, required)
        - email: "jordan23@gmail.com" (string, required)
        
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*
    
+ Response 200 (application/json)

        {
            "status":"success"
        }

### Create User [POST /users]

Create a User's profile.

+ Request

    + Body
    
            {
                "uniqueId": "A01AF899-227A-4E01-9729-9B4EA3DC7DA-5" (string, required)
                "username": "jordan23" (string, required)
                "email": "jordan23@gmail.com" (string, optional)  
            }
        
    + Headers
    
            Authorization: Bearer YOUR_ACCESS_TOKEN
            apikey: YOUR_API_KEY
            Accept: */*
    
+ Response 200 (application/json)

        {
            "status":"success",
            "data":"uniqueId"
        }
