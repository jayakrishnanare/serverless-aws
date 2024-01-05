const Responses = require('../common/API_Response')
const AWS = require('aws-sdk')
const Comprehend = new AWS.Comprehend()

exports.handler = async event => {
    console.log('event', event)
    const body = JSON.parse(event.body)
    if(!body || !body.text){
        return Responses._400({message : "no text filed in the body"})
    }

    const text = body.text

    const params = {
        LanguageCode : 'en',
        TextList : [text]
    }
    try {
       const entityResults = await Comprehend.batchDetectEntities(params).promise();
       const entities = entityResults.ResultList[0]

       const sentimentResults = await Comprehend.batchDetectSentiment(params).promise()
       const sentiment = sentimentResults.ResultList[0]

       const responsesData  = {
        entities,
        sentiment
       }
       console.log('responsesData',responsesData)
       return Responses._200(responsesData)
    } catch (error) {
        return Responses._400({message : 'failed to work'})
    }
} 