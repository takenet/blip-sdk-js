import * as UriTemplates from './UriTemplates';
import * as ContentTypes from './ContentTypes';
import * as Lime from 'lime-js';
import ExtensionBase from '../ExtensionBase';

const POSTMASTER_AI = 'postmaster@ai';

export default class ArtificialIntelligenceExtension extends ExtensionBase {

    constructor(client, domain) {
        super(client, `${POSTMASTER_AI}.${domain}`);
    }

    // Analysis

    getAnalysis({
        skip = 0,
        take = 100,
        ascending = false,
        filter = '',
        intents = [],
        feedbacks = [],
        source = '',
        beginDate = '',
        endDate = '',
        minScore = '',
        maxScore = '',
        ...otherParams
    } = {}) {
        if (arguments.length > 1 && typeof arguments[0] !== 'object') {
            throw new Error('You are using the deprecated signature of \'%s\', which does not exists anymore!',
            `${ArtificialIntelligenceExtension.name}.getAnalysis`);
        }

        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(UriTemplates.ANALYSIS, {
                    $skip: skip,
                    $take: take,
                    $ascending: ascending,
                    $filter: filter,
                    intents,
                    feedbacks,
                    source,
                    beginDate,
                    endDate,
                    minScore,
                    maxScore,
                    ...otherParams
                })));
    }

    analyse(analysis) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.ANALYSIS, ContentTypes.ANALYSIS, analysis));
    }

    setAnalysisByEmail(emailAndFilter, intents = [], feedbacks = [], source = '', beginDate = '', endDate = '', minScore = '', maxScore = '') {
        return this._processCommand(
            this._createSetCommand(UriTemplates.ANALYSIS_EMAIL, ContentTypes.JSON_DOCUMENT, {
                email: emailAndFilter.email,
                filter: this._buildResourceQuery(UriTemplates.ANALYSIS, {
                    $filter: emailAndFilter.filter,
                    intents,
                    feedbacks,
                    source,
                    beginDate,
                    endDate,
                    minScore,
                    maxScore
                })
            }));
    }

    setAnalysisFeedback(id, analysisFeedback) {
        return this._processCommand(
            this._createSetCommand(
                this._buildUri(UriTemplates.ANALYSIS_FEEDBACK, id),
                ContentTypes.ANALYSIS_FEEDBACK, analysisFeedback));
    }

    setAnalysesFeedback(analyses) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.ANALYSES_FEEDBACK, Lime.ContentTypes.COLLECTION, {
                itemType: ContentTypes.ANALYSIS_FEEDBACK,
                items: analyses
            }));
    }

    // Analytics (Confusion Matrix)

    getAnalytics(id = null) {
        const uri = id ? this._buildUri(UriTemplates.ANALYTICS_ID, id) : UriTemplates.ANALYTICS;
        return this._processCommand(this._createGetCommand(uri));
    }

    setAnalytics(confusionMatrix) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.ANALYTICS, ContentTypes.CONFUSION_MATRIX, confusionMatrix));
    }

    deleteAnalytics(id) {
        return this._processCommand(
            this._createDeleteCommand(
                this._buildUri(UriTemplates.ANALYTICS_ID, id)));
    }

    // Intents

    getIntent(id, deep = false) {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(
                    this._buildUri(UriTemplates.INTENTION, id), {
                        deep: deep
                    })));
    }

    getIntents(skip = 0, take = 100, deep = false, name = '', ascending = false) {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(UriTemplates.INTENTIONS, {
                    $skip: skip,
                    $take: take,
                    deep: deep,
                    name: name,
                    $ascending: ascending
                })));
    }

    setIntent(intent) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.INTENTIONS, ContentTypes.INTENTION, intent));
    }

    setIntents(intents) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.INTENTIONS, Lime.ContentTypes.COLLECTION, {
                itemType: ContentTypes.INTENTION,
                items: intents
            }));
    }

    mergeIntent(intent) {
        return this._processCommand(
            this._createMergeCommand(UriTemplates.INTENTIONS, ContentTypes.INTENTION, intent));
    }

    mergeIntents(intents) {
        return this._processCommand(
            this._createMergeCommand(UriTemplates.INTENTIONS, Lime.ContentTypes.COLLECTION, {
                itemType: ContentTypes.INTENTION,
                items: intents
            }));
    }

    deleteIntent(id) {
        return this._processCommand(
            this._createDeleteCommand(
                this._buildUri(UriTemplates.INTENTION, id)));
    }

    deleteIntents() {
        return this._processCommand(
            this._createDeleteCommand(UriTemplates.INTENTIONS));
    }

    // Intents Answers

    getIntentAnswers(id, skip = 0, take = 100, ascending = false) {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(
                    this._buildUri(UriTemplates.INTENTION_ANSWERS, id), {
                        $skip: skip,
                        $take: take,
                        $ascending: ascending
                    })));
    }

    setIntentAnswers(id, answers) {
        return this._processCommand(
            this._createSetCommand(
                this._buildUri(UriTemplates.INTENTION_ANSWERS, id), Lime.ContentTypes.COLLECTION, {
                    itemType: ContentTypes.ANSWER,
                    items: answers
                }));
    }

    deleteIntentAnswer(id, answerId) {
        return this._processCommand(
            this._createDeleteCommand(
                this._buildUri(UriTemplates.INTENTION_ANSWER, id, answerId)));
    }

    // Intents Questions

    getIntentQuestions(id) {
        return this._processCommand(
            this._createGetCommand(this._buildUri(UriTemplates.INTENTION_QUESTIONS, id)));
    }

    setIntentQuestions(id, questions) {
        return this._processCommand(
            this._createSetCommand(
                this._buildUri(UriTemplates.INTENTION_QUESTIONS, id), Lime.ContentTypes.COLLECTION, {
                    itemType: ContentTypes.QUESTION,
                    items: questions
                }));
    }

    deleteIntentQuestion(id, questionId) {
        return this._processCommand(
            this._createDeleteCommand(this._buildUri(UriTemplates.INTENTION_QUESTION, id, questionId)));
    }

    // Entity

    getEntity(id) {
        return this._processCommand(
            this._createGetCommand(this._buildUri(UriTemplates.ENTITY, id)));
    }

    getEntities(skip = 0, take = 100, ascending = false, name = '') {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(UriTemplates.ENTITIES, {
                    $skip: skip,
                    $take: take,
                    $ascending: ascending,
                    name: name
                })));
    }

    setEntity(entity) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.ENTITIES, ContentTypes.ENTITY, entity));
    }

    deleteEntity(id) {
        return this._processCommand(
            this._createDeleteCommand(this._buildUri(UriTemplates.ENTITY, id)));
    }

    deleteEntities() {
        return this._processCommand(
            this._createDeleteCommand(UriTemplates.ENTITIES));
    }

    // Content Tag

    getContentTag(id) {
        return this._processCommand(
            this._createGetCommand(this._buildUri(UriTemplates.CONTENT_TAG_ID, id)));
    }

    getContentTags(skip = 0, take = 100, ascending = false, name = '') {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(UriTemplates.CONTENT_TAGS, {
                    $skip: skip,
                    $take: take,
                    $ascending: ascending,
                    name: name
                })));
    }

    setContentTag(tag) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.CONTENT_TAGS, ContentTypes.CONTENT_TAG, tag));
    }

    deleteContentTag(id) {
        return this._processCommand(
            this._createDeleteCommand(this._buildUri(UriTemplates.CONTENT_TAG_ID, id)));
    }

    deleteContentTags() {
        return this._processCommand(
            this._createDeleteCommand(UriTemplates.CONTENT_TAGS));
    }


    // Model

    getModels(skip = 0, take = 100, ascending = false) {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(UriTemplates.MODELS, {
                    $skip: skip,
                    $take: take,
                    $ascending: ascending
                })));
    }

    getModel(id) {
        return this._processCommand(
            this._createGetCommand(
                this._buildUri(UriTemplates.MODEL, id)));
    }

    getModelSummary() {
        return this._processCommand(
            this._createGetCommand(UriTemplates.MODELS_SUMMARY));
    }

    getLastTrainedOrPublishedModel() {
        return this._processCommand(
            this._createGetCommand(UriTemplates.LAST_TRAINED_OR_PUBLISH_MODEL));
    }

    trainModel() {
        return this._processCommand(
            this._createSetCommand(UriTemplates.MODELS, ContentTypes.MODEL_TRAINING, {}));
    }

    publishModel(id) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.MODELS, ContentTypes.MODEL_PUBLISHING, {
                id: id
            }));
    }

    // Word Set

    getWordSet(id, deep = false) {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(
                    this._buildUri(UriTemplates.WORD_SET, id), {
                        deep: deep
                    })));
    }

    getWordSets(deep = false) {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(UriTemplates.WORD_SETS, {
                    deep: deep
                })));
    }

    setWordSetResource(id, resource) {
        return this._processCommand(
            this._createSetCommand(
                this._buildUri(UriTemplates.WORD_SET, id), Lime.ContentTypes.COLLECTION, {
                    itemType: ContentTypes.WORD_SET_WORD,
                    items: resource
                }));
    }

    setWordSet(wordSet) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.WORD_SETS, ContentTypes.WORD_SET, wordSet));
    }

    deleteWordSet(id) {
        return this._processCommand(
            this._createDeleteCommand(this._buildUri(UriTemplates.WORD_SET, id)));
    }

    analyseWordSet(analysis) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.WORD_SETS_ANALYSIS, ContentTypes.WORD_SETS_ANALYSIS, analysis));
    }

    //Content Assistant

    analyseContent(analysis) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.CONTENT_ANALYSIS, ContentTypes.ANALYSIS, analysis));
    }

    matchContent(combination) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.CONTENT_ANALYSIS, ContentTypes.CONTENT_COMBINATION, combination));
    }

    getContents(skip = 0, take = 100, ascending = false, intents = [], entities = [], text = '', beginDate = '', endDate = '') {
        return this._processCommand(
            this._createGetCommand(
                this._buildResourceQuery(UriTemplates.CONTENT, {
                    $skip: skip,
                    $take: take,
                    $ascending: ascending,
                    intents: intents,
                    entities: entities,
                    text: text,
                    beginDate: beginDate,
                    endDate: endDate
                })));
    }

    getContent(id) {
        return this._processCommand(
            this._createGetCommand(
                this._buildUri(UriTemplates.CONTENT_ID, id)));
    }

    setContent(content) {
        return this._processCommand(
            this._createSetCommand(UriTemplates.CONTENT, ContentTypes.CONTENT_RESULT, content));
    }

    setContentResult(id, content) {
        return this._processCommand(
            this._createSetCommand(
                this._buildUri(UriTemplates.CONTENT_ID, id), ContentTypes.CONTENT_RESULT, content));
    }

    setContentCombination(id, combination) {
        return this._processCommand(
            this._createSetCommand(
                this._buildUri(UriTemplates.CONTENT_ID, id), ContentTypes.CONTENT_COMBINATION, combination));
    }

    setContentCombinations(id, combinations) {
        return this._processCommand(
            this._createSetCommand(
                this._buildUri(UriTemplates.CONTENT_ID, id), Lime.ContentTypes.COLLECTION, {
                    itemType: ContentTypes.CONTENT_COMBINATION,
                    items: combinations
                }));
    }

    deleteContent(id) {
        return this._processCommand(
            this._createDeleteCommand(
                this._buildUri(UriTemplates.CONTENT_ID, id)));
    }

}
