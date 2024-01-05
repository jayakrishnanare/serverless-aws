const { useHooks , logEvent, parseEvent, handleUnexpectedError } = require('lambda-hooks');
const withHooks = useHooks({
    before: [logEvent , parseEvent],
    after: [],
    onError: [handleUnexpectedError]
})

const hooksVithValidation =  ({ bodySchema, pathSchema }) => {
    return useHooks({
        before: [logEvent, parseEvent, validateEventBody, validatePaths],
        after: [],
        onError: [handleUnexpectedError]
    },
    {
        bodySchema,
        pathSchema
    })
}

module.exports = {
    withHooks,
    hooksVithValidation
}

const validateEventBody = async state => {
    const { bodySchema } = state.config
    if(!bodySchema){
        throw Error('missing the required body schema')
    }

    try {
        const { event } = state;
        await bodySchema.validate(event.body, { strict : true})
    } catch (error) {
        console.log('yup validatin error of event.body', error)
        state.exit = true
        state.response = { statusCode : 400, body : JSON.stringify({ error : error})}
    }
    return state;
}

const validatePaths = async state => {
    const { pathSchema } = state.config
    if(!pathSchema){
        throw Error('missing the required path schema')
    }

    try {
        const { event } = state;
        await pathSchema.validate(event.pathParameters, { strict : true})
    } catch (error) {
        console.log('yup validatin error of pathparameters', error)
        state.exit = true
        state.response = { statusCode : 400, body : JSON.stringify({ error : error})}
    }
    return state;
}